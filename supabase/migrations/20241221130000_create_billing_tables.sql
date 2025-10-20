-- =====================================================
-- Migration: Create Billing and Subscription Tables
-- Created: 2024-12-21T13:00:00Z
-- Tables: organizations, subscriptions, subscription_plans, invoices, payments, billing_events
-- Purpose: Implement comprehensive billing and subscription management system
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: organizations
-- Purpose: Customer organizations with billing information
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  billing_email TEXT NOT NULL,
  billing_address JSONB DEFAULT '{}'::jsonb,
  tax_id TEXT,
  vat_number TEXT,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT organizations_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT organizations_billing_email_valid CHECK (billing_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS organizations_domain_idx ON organizations(domain);
CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations(status);
CREATE INDEX IF NOT EXISTS organizations_created_at_idx ON organizations(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their organization's data
CREATE POLICY "organizations_select_own"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "organizations_update_own"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- =====================================================
-- TABLE: user_organizations
-- Purpose: Many-to-many relationship between users and organizations
-- =====================================================
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'billing_admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique user-organization pairs
  UNIQUE(user_id, organization_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_organizations_user_id_idx ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS user_organizations_organization_id_idx ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS user_organizations_role_idx ON user_organizations(role);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_organizations_updated_at ON user_organizations;
CREATE TRIGGER update_user_organizations_updated_at
  BEFORE UPDATE ON user_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own organization memberships
CREATE POLICY "user_organizations_select_own"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_organizations_insert_own"
  ON user_organizations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_organizations_update_own"
  ON user_organizations FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- TABLE: subscription_plans
-- Purpose: Available subscription plans and pricing
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'basic', 'professional', 'enterprise', 'custom')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  
  -- Plan limits
  max_users INTEGER,
  max_machines INTEGER,
  max_storage_gb INTEGER,
  max_videos INTEGER,
  max_courses INTEGER,
  
  -- Features
  features JSONB DEFAULT '{}'::jsonb,
  
  -- Stripe integration
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT subscription_plans_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT subscription_plans_price_positive CHECK (price_cents >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS subscription_plans_plan_type_idx ON subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS subscription_plans_billing_cycle_idx ON subscription_plans(billing_cycle);
CREATE INDEX IF NOT EXISTS subscription_plans_is_active_idx ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS subscription_plans_stripe_price_id_idx ON subscription_plans(stripe_price_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public plans are readable by all, private plans by admins
CREATE POLICY "subscription_plans_select_public"
  ON subscription_plans FOR SELECT
  USING (is_public = true AND is_active = true);

-- =====================================================
-- TABLE: subscriptions
-- Purpose: Organization subscriptions to plans
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  
  -- Subscription details
  status TEXT DEFAULT 'active' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'unpaid', 'paused')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Billing dates
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Pricing
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  tax_rate DECIMAL(5,4) DEFAULT 0,
  
  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  
  -- Usage tracking
  seats_used INTEGER DEFAULT 0,
  seats_limit INTEGER,
  machines_used INTEGER DEFAULT 0,
  machines_limit INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT subscriptions_price_positive CHECK (price_cents >= 0),
  CONSTRAINT subscriptions_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 1),
  CONSTRAINT subscriptions_period_valid CHECK (current_period_end > current_period_start)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS subscriptions_organization_id_idx ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_id_idx ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_current_period_end_idx ON subscriptions(current_period_end);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their organization's subscriptions
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
  ));

-- =====================================================
-- TABLE: invoices
-- Purpose: Generated invoices for subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  
  -- Amounts
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Billing period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Due dates
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Stripe integration
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  
  -- PDF generation
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  -- Metadata
  line_items JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT invoices_subtotal_positive CHECK (subtotal_cents >= 0),
  CONSTRAINT invoices_tax_positive CHECK (tax_cents >= 0),
  CONSTRAINT invoices_total_positive CHECK (total_cents >= 0),
  CONSTRAINT invoices_period_valid CHECK (period_end > period_start)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS invoices_organization_id_idx ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS invoices_subscription_id_idx ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON invoices(due_date);
CREATE INDEX IF NOT EXISTS invoices_stripe_invoice_id_idx ON invoices(stripe_invoice_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their organization's invoices
CREATE POLICY "invoices_select_own"
  ON invoices FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

-- =====================================================
-- TABLE: payments
-- Purpose: Payment records for invoices
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment details
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  
  -- Payment method
  payment_method_type TEXT CHECK (payment_method_type IN ('card', 'bank_transfer', 'check', 'wire')),
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  
  -- Stripe integration
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  
  -- Refund information
  refunded_amount_cents INTEGER DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT payments_amount_positive CHECK (amount_cents > 0),
  CONSTRAINT payments_refunded_amount_valid CHECK (refunded_amount_cents >= 0 AND refunded_amount_cents <= amount_cents)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS payments_organization_id_idx ON payments(organization_id);
CREATE INDEX IF NOT EXISTS payments_invoice_id_idx ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
CREATE INDEX IF NOT EXISTS payments_stripe_payment_intent_id_idx ON payments(stripe_payment_intent_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their organization's payments
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

-- =====================================================
-- TABLE: billing_events
-- Purpose: Audit trail for billing-related events
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_description TEXT NOT NULL,
  
  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,
  previous_data JSONB DEFAULT '{}'::jsonb,
  
  -- Source information
  source TEXT DEFAULT 'system' CHECK (source IN ('system', 'stripe', 'admin', 'user')),
  source_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS billing_events_organization_id_idx ON billing_events(organization_id);
CREATE INDEX IF NOT EXISTS billing_events_event_type_idx ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS billing_events_created_at_idx ON billing_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their organization's billing events
CREATE POLICY "billing_events_select_own"
  ON billing_events FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number ~ '^INV-\d+$';
  
  -- Format as INV-000001, INV-000002, etc.
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate subscription usage
CREATE OR REPLACE FUNCTION calculate_subscription_usage(subscription_uuid UUID)
RETURNS TABLE (
  seats_used BIGINT,
  machines_used BIGINT,
  storage_used_gb BIGINT,
  videos_used BIGINT,
  courses_used BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT uo.user_id), 0) as seats_used,
    COALESCE(COUNT(DISTINCT v.machine_model), 0) as machines_used,
    COALESCE(SUM(v.file_size) / (1024^3), 0) as storage_used_gb,
    COALESCE(COUNT(v.id), 0) as videos_used,
    COALESCE(COUNT(c.id), 0) as courses_used
  FROM subscriptions s
  LEFT JOIN user_organizations uo ON uo.organization_id = s.organization_id
  LEFT JOIN videos v ON v.customer_scope @> ARRAY[s.organization_id::TEXT]
  LEFT JOIN courses c ON c.organization_id = s.organization_id
  WHERE s.id = subscription_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, plan_type, billing_cycle, price_cents, currency, max_users, max_machines, max_storage_gb, max_videos, max_courses, features) VALUES
('Trial', '14-day free trial', 'trial', 'monthly', 0, 'USD', 5, 2, 1, 10, 2, '{"transcription": true, "search": true, "basic_analytics": true}'),
('Basic', 'Perfect for small teams', 'basic', 'monthly', 2900, 'USD', 10, 5, 10, 100, 10, '{"transcription": true, "search": true, "analytics": true, "custom_tags": true}'),
('Professional', 'For growing organizations', 'professional', 'monthly', 9900, 'USD', 50, 20, 100, 1000, 100, '{"transcription": true, "search": true, "advanced_analytics": true, "custom_tags": true, "api_access": true, "priority_support": true}'),
('Enterprise', 'For large organizations', 'enterprise', 'monthly', 29900, 'USD', 200, 100, 1000, 10000, 1000, '{"transcription": true, "search": true, "advanced_analytics": true, "custom_tags": true, "api_access": true, "priority_support": true, "sso": true, "custom_integrations": true}'),
('Basic Annual', 'Perfect for small teams (annual)', 'basic', 'yearly', 29000, 'USD', 10, 5, 10, 100, 10, '{"transcription": true, "search": true, "analytics": true, "custom_tags": true}'),
('Professional Annual', 'For growing organizations (annual)', 'professional', 'yearly', 99000, 'USD', 50, 20, 100, 1000, 100, '{"transcription": true, "search": true, "advanced_analytics": true, "custom_tags": true, "api_access": true, "priority_support": true}'),
('Enterprise Annual', 'For large organizations (annual)', 'enterprise', 'yearly', 299000, 'USD', 200, 100, 1000, 10000, 1000, '{"transcription": true, "search": true, "advanced_analytics": true, "custom_tags": true, "api_access": true, "priority_support": true, "sso": true, "custom_integrations": true}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS billing_events CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS subscription_plans CASCADE;
-- DROP TABLE IF EXISTS user_organizations CASCADE;
-- DROP TABLE IF EXISTS organizations CASCADE;
-- DROP FUNCTION IF EXISTS generate_invoice_number();
-- DROP FUNCTION IF EXISTS calculate_subscription_usage(UUID);
-- DROP FUNCTION IF EXISTS set_invoice_number();
