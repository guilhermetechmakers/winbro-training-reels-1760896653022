/**
 * Billing and Subscription Management Types
 * Generated: 2024-12-21T13:00:00Z
 */

// =====================================================
// Organization Types
// =====================================================

export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  billing_email: string;
  billing_address: Record<string, any>;
  tax_id: string | null;
  vat_number: string | null;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  timezone: string;
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationInsert {
  id?: string;
  name: string;
  domain?: string | null;
  billing_email: string;
  billing_address?: Record<string, any>;
  tax_id?: string | null;
  vat_number?: string | null;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  timezone?: string;
  status?: 'active' | 'suspended' | 'cancelled' | 'trial';
  trial_ends_at?: string | null;
}

export interface OrganizationUpdate {
  name?: string;
  domain?: string | null;
  billing_email?: string;
  billing_address?: Record<string, any>;
  tax_id?: string | null;
  vat_number?: string | null;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  timezone?: string;
  status?: 'active' | 'suspended' | 'cancelled' | 'trial';
  trial_ends_at?: string | null;
}

// =====================================================
// User Organization Types
// =====================================================

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'billing_admin' | 'member';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserOrganizationInsert {
  id?: string;
  user_id: string;
  organization_id: string;
  role?: 'admin' | 'billing_admin' | 'member';
  joined_at?: string;
}

export interface UserOrganizationUpdate {
  role?: 'admin' | 'billing_admin' | 'member';
}

// =====================================================
// Subscription Plan Types
// =====================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  plan_type: 'trial' | 'basic' | 'professional' | 'enterprise' | 'custom';
  billing_cycle: 'monthly' | 'yearly';
  price_cents: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  max_users: number | null;
  max_machines: number | null;
  max_storage_gb: number | null;
  max_videos: number | null;
  max_courses: number | null;
  features: Record<string, any>;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanInsert {
  id?: string;
  name: string;
  description?: string | null;
  plan_type: 'trial' | 'basic' | 'professional' | 'enterprise' | 'custom';
  billing_cycle: 'monthly' | 'yearly';
  price_cents?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  max_users?: number | null;
  max_machines?: number | null;
  max_storage_gb?: number | null;
  max_videos?: number | null;
  max_courses?: number | null;
  features?: Record<string, any>;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  is_active?: boolean;
  is_public?: boolean;
}

export interface SubscriptionPlanUpdate {
  name?: string;
  description?: string | null;
  plan_type?: 'trial' | 'basic' | 'professional' | 'enterprise' | 'custom';
  billing_cycle?: 'monthly' | 'yearly';
  price_cents?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  max_users?: number | null;
  max_machines?: number | null;
  max_storage_gb?: number | null;
  max_videos?: number | null;
  max_courses?: number | null;
  features?: Record<string, any>;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  is_active?: boolean;
  is_public?: boolean;
}

// =====================================================
// Subscription Types
// =====================================================

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'paused';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  price_cents: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  tax_rate: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  seats_used: number;
  seats_limit: number | null;
  machines_used: number;
  machines_limit: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInsert {
  id?: string;
  organization_id: string;
  plan_id: string;
  status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'paused';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string | null;
  trial_end?: string | null;
  cancelled_at?: string | null;
  price_cents: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  tax_rate?: number;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
  seats_used?: number;
  seats_limit?: number | null;
  machines_used?: number;
  machines_limit?: number | null;
  metadata?: Record<string, any>;
}

export interface SubscriptionUpdate {
  status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'paused';
  billing_cycle?: 'monthly' | 'yearly';
  current_period_start?: string;
  current_period_end?: string;
  trial_start?: string | null;
  trial_end?: string | null;
  cancelled_at?: string | null;
  price_cents?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  tax_rate?: number;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
  seats_used?: number;
  seats_limit?: number | null;
  machines_used?: number;
  machines_limit?: number | null;
  metadata?: Record<string, any>;
}

// =====================================================
// Invoice Types
// =====================================================

export interface Invoice {
  id: string;
  organization_id: string;
  subscription_id: string | null;
  invoice_number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  period_start: string;
  period_end: string;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  line_items: Record<string, any>[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceInsert {
  id?: string;
  organization_id: string;
  subscription_id?: string | null;
  invoice_number?: string;
  status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal_cents?: number;
  tax_cents?: number;
  total_cents?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  period_start: string;
  period_end: string;
  due_date?: string | null;
  paid_at?: string | null;
  stripe_invoice_id?: string | null;
  stripe_payment_intent_id?: string | null;
  pdf_url?: string | null;
  pdf_generated_at?: string | null;
  line_items?: Record<string, any>[];
  metadata?: Record<string, any>;
}

export interface InvoiceUpdate {
  status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal_cents?: number;
  tax_cents?: number;
  total_cents?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  period_start?: string;
  period_end?: string;
  due_date?: string | null;
  paid_at?: string | null;
  stripe_invoice_id?: string | null;
  stripe_payment_intent_id?: string | null;
  pdf_url?: string | null;
  pdf_generated_at?: string | null;
  line_items?: Record<string, any>[];
  metadata?: Record<string, any>;
}

// =====================================================
// Payment Types
// =====================================================

export interface Payment {
  id: string;
  organization_id: string;
  invoice_id: string;
  amount_cents: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  payment_method_type: 'card' | 'bank_transfer' | 'check' | 'wire' | null;
  payment_method_last4: string | null;
  payment_method_brand: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  refunded_amount_cents: number;
  refunded_at: string | null;
  refund_reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentInsert {
  id?: string;
  organization_id: string;
  invoice_id: string;
  amount_cents: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  status?: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  payment_method_type?: 'card' | 'bank_transfer' | 'check' | 'wire' | null;
  payment_method_last4?: string | null;
  payment_method_brand?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  refunded_amount_cents?: number;
  refunded_at?: string | null;
  refund_reason?: string | null;
  metadata?: Record<string, any>;
}

export interface PaymentUpdate {
  status?: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  payment_method_type?: 'card' | 'bank_transfer' | 'check' | 'wire' | null;
  payment_method_last4?: string | null;
  payment_method_brand?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  refunded_amount_cents?: number;
  refunded_at?: string | null;
  refund_reason?: string | null;
  metadata?: Record<string, any>;
}

// =====================================================
// Billing Event Types
// =====================================================

export interface BillingEvent {
  id: string;
  organization_id: string;
  subscription_id: string | null;
  invoice_id: string | null;
  payment_id: string | null;
  event_type: string;
  event_category: string;
  event_description: string;
  event_data: Record<string, any>;
  previous_data: Record<string, any>;
  source: 'system' | 'stripe' | 'admin' | 'user';
  source_id: string | null;
  created_at: string;
}

export interface BillingEventInsert {
  id?: string;
  organization_id: string;
  subscription_id?: string | null;
  invoice_id?: string | null;
  payment_id?: string | null;
  event_type: string;
  event_category: string;
  event_description: string;
  event_data?: Record<string, any>;
  previous_data?: Record<string, any>;
  source?: 'system' | 'stripe' | 'admin' | 'user';
  source_id?: string | null;
}

// =====================================================
// Extended Types with Relations
// =====================================================

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan;
  organization: Organization;
}

export interface InvoiceWithSubscription extends Invoice {
  subscription: Subscription | null;
  organization: Organization;
  payments: Payment[];
}

export interface PaymentWithInvoice extends Payment {
  invoice: Invoice;
  organization: Organization;
}

export interface OrganizationWithSubscription extends Organization {
  subscriptions: Subscription[];
  user_organizations: UserOrganization[];
}

// =====================================================
// Usage and Analytics Types
// =====================================================

export interface SubscriptionUsage {
  seats_used: number;
  machines_used: number;
  storage_used_gb: number;
  videos_used: number;
  courses_used: number;
}

export interface BillingSummary {
  organization: Organization;
  current_subscription: SubscriptionWithPlan | null;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
  total_amount_paid: number;
  next_billing_date: string | null;
  usage: SubscriptionUsage | null;
}

export interface BillingAnalytics {
  monthly_revenue: number;
  total_customers: number;
  active_subscriptions: number;
  churn_rate: number;
  average_revenue_per_customer: number;
  revenue_by_plan: Array<{
    plan_name: string;
    revenue: number;
    customer_count: number;
  }>;
  revenue_trend: Array<{
    month: string;
    revenue: number;
  }>;
}

// =====================================================
// Form and UI Types
// =====================================================

export interface CreateOrganizationForm {
  name: string;
  domain: string;
  billing_email: string;
  billing_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  tax_id?: string;
  vat_number?: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  timezone: string;
}

export interface CreateSubscriptionForm {
  organization_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  trial_days?: number;
  seats_limit?: number;
  machines_limit?: number;
}

export interface UpdateSubscriptionForm {
  plan_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
  seats_limit?: number;
  machines_limit?: number;
  status?: 'active' | 'paused' | 'cancelled';
}

export interface CreateInvoiceForm {
  organization_id: string;
  subscription_id?: string;
  period_start: string;
  period_end: string;
  due_date: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
  }>;
  tax_rate?: number;
}

export interface PaymentForm {
  invoice_id: string;
  payment_method_type: 'card' | 'bank_transfer' | 'check' | 'wire';
  amount_cents: number;
  payment_method_data?: {
    last4?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
  };
}

// =====================================================
// API Response Types
// =====================================================

export interface BillingApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface BillingPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

// =====================================================
// Filter and Search Types
// =====================================================

export interface BillingFilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
  plan_type?: string;
  billing_cycle?: 'monthly' | 'yearly';
  currency?: string;
}

export interface BillingSearchParams {
  query?: string;
  filters?: BillingFilterOptions;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =====================================================
// Stripe Integration Types
// =====================================================

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  description?: string;
  metadata: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
      };
    }>;
  };
}

export interface StripeInvoice {
  id: string;
  customer: string;
  subscription: string | null;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  due_date: number | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  payment_method: string | null;
}

// =====================================================
// Export Types
// =====================================================

export type OrganizationRow = Organization;
export type UserOrganizationRow = UserOrganization;
export type SubscriptionPlanRow = SubscriptionPlan;
export type SubscriptionRow = Subscription;
export type InvoiceRow = Invoice;
export type PaymentRow = Payment;
export type BillingEventRow = BillingEvent;
