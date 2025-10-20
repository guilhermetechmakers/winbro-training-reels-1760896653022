/**
 * Billing and Subscription API
 * Generated: 2024-12-21T13:00:00Z
 */

import { supabase } from '@/lib/supabase';
import type {
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  UserOrganization,
  UserOrganizationInsert,
  UserOrganizationUpdate,
  SubscriptionPlan,
  SubscriptionPlanInsert,
  SubscriptionPlanUpdate,
  SubscriptionInsert,
  SubscriptionUpdate,
  InvoiceInsert,
  InvoiceUpdate,
  PaymentInsert,
  PaymentUpdate,
  BillingEvent,
  BillingEventInsert,
  SubscriptionWithPlan,
  InvoiceWithSubscription,
  PaymentWithInvoice,
  OrganizationWithSubscription,
  BillingSummary,
  BillingAnalytics,
  BillingSearchParams,
  BillingPaginatedResponse,
  SubscriptionUsage,
} from '@/types/billing';

// =====================================================
// Organization API
// =====================================================

export const organizationApi = {
  // Get organization by ID
  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get organization with subscriptions
  async getWithSubscriptions(id: string): Promise<OrganizationWithSubscription | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        subscriptions (
          *,
          plan:subscription_plans(*)
        ),
        user_organizations (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create organization
  async create(organization: OrganizationInsert): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update organization
  async update(id: string, updates: OrganizationUpdate): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete organization
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // List organizations with pagination
  async list(params: BillingSearchParams = {}): Promise<BillingPaginatedResponse<Organization>> {
    const { page = 1, limit = 10, filters, sortBy = 'created_at', sortOrder = 'desc' } = params;
    
    let queryBuilder = supabase
      .from('organizations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }
    if (filters?.currency) {
      queryBuilder = queryBuilder.eq('currency', filters.currency);
    }
    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Apply search
    if (params.query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${params.query}%,domain.ilike.%${params.query}%,billing_email.ilike.%${params.query}%`);
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true,
    };
  },
};

// =====================================================
// User Organization API
// =====================================================

export const userOrganizationApi = {
  // Get user organizations
  async getByUserId(userId: string): Promise<UserOrganization[]> {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  // Add user to organization
  async addUser(data: UserOrganizationInsert): Promise<UserOrganization> {
    const { data: result, error } = await supabase
      .from('user_organizations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Update user role in organization
  async updateRole(id: string, updates: UserOrganizationUpdate): Promise<UserOrganization> {
    const { data, error } = await supabase
      .from('user_organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove user from organization
  async removeUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// Subscription Plan API
// =====================================================

export const subscriptionPlanApi = {
  // Get all active plans
  async getActive(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('is_public', true)
      .order('price_cents', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get plan by ID
  async getById(id: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create plan (admin only)
  async create(plan: SubscriptionPlanInsert): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update plan (admin only)
  async update(id: string, updates: SubscriptionPlanUpdate): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete plan (admin only)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// Subscription API
// =====================================================

export const subscriptionApi = {
  // Get subscription by ID
  async getById(id: string): Promise<SubscriptionWithPlan | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*),
        organization:organizations(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get organization's current subscription
  async getCurrentByOrganizationId(organizationId: string): Promise<SubscriptionWithPlan | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*),
        organization:organizations(*)
      `)
      .eq('organization_id', organizationId)
      .in('status', ['trial', 'active', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create subscription
  async create(subscription: SubscriptionInsert): Promise<SubscriptionWithPlan> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select(`
        *,
        plan:subscription_plans(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update subscription
  async update(id: string, updates: SubscriptionUpdate): Promise<SubscriptionWithPlan> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        plan:subscription_plans(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Cancel subscription
  async cancel(id: string): Promise<SubscriptionWithPlan> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        plan:subscription_plans(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Get subscription usage
  async getUsage(id: string): Promise<SubscriptionUsage> {
    const { data, error } = await supabase
      .rpc('calculate_subscription_usage', { subscription_uuid: id });

    if (error) throw error;
    return data[0] || {
      seats_used: 0,
      machines_used: 0,
      storage_used_gb: 0,
      videos_used: 0,
      courses_used: 0,
    };
  },
};

// =====================================================
// Invoice API
// =====================================================

export const invoiceApi = {
  // Get invoice by ID
  async getById(id: string): Promise<InvoiceWithSubscription | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        subscription:subscriptions(
          *,
          plan:subscription_plans(*)
        ),
        organization:organizations(*),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get organization's invoices
  async getByOrganizationId(organizationId: string, params: BillingSearchParams = {}): Promise<BillingPaginatedResponse<InvoiceWithSubscription>> {
    const { page = 1, limit = 10, query, filters, sortBy = 'created_at', sortOrder = 'desc' } = params;
    
    let queryBuilder = supabase
      .from('invoices')
      .select(`
        *,
        subscription:subscriptions(
          *,
          plan:subscription_plans(*)
        ),
        organization:organizations(*),
        payments(*)
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }
    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Apply search
    if (query) {
      queryBuilder = queryBuilder.or(`invoice_number.ilike.%${query}%`);
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true,
    };
  },

  // Create invoice
  async create(invoice: InvoiceInsert): Promise<InvoiceWithSubscription> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select(`
        *,
        subscription:subscriptions(
          *,
          plan:subscription_plans(*)
        ),
        organization:organizations(*),
        payments(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update invoice
  async update(id: string, updates: InvoiceUpdate): Promise<InvoiceWithSubscription> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        subscription:subscriptions(
          *,
          plan:subscription_plans(*)
        ),
        organization:organizations(*),
        payments(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Mark invoice as paid
  async markAsPaid(id: string, paidAt: string = new Date().toISOString()): Promise<InvoiceWithSubscription> {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: paidAt,
      })
      .eq('id', id)
      .select(`
        *,
        subscription:subscriptions(
          *,
          plan:subscription_plans(*)
        ),
        organization:organizations(*),
        payments(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Generate PDF for invoice
  async generatePdf(id: string): Promise<string> {
    // This would typically call a backend service to generate the PDF
    // For now, we'll return a placeholder URL
    const { data, error } = await supabase
      .from('invoices')
      .update({
        pdf_generated_at: new Date().toISOString(),
        pdf_url: `/api/invoices/${id}/pdf`,
      })
      .eq('id', id)
      .select('pdf_url')
      .single();

    if (error) throw error;
    return data.pdf_url;
  },
};

// =====================================================
// Payment API
// =====================================================

export const paymentApi = {
  // Get payment by ID
  async getById(id: string): Promise<PaymentWithInvoice | null> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(*),
        organization:organizations(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get payments by organization
  async getByOrganizationId(organizationId: string, params: BillingSearchParams = {}): Promise<BillingPaginatedResponse<PaymentWithInvoice>> {
    const { page = 1, limit = 10, filters, sortBy = 'created_at', sortOrder = 'desc' } = params;
    
    let queryBuilder = supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(*),
        organization:organizations(*)
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }
    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true,
    };
  },

  // Create payment
  async create(payment: PaymentInsert): Promise<PaymentWithInvoice> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select(`
        *,
        invoice:invoices(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment
  async update(id: string, updates: PaymentUpdate): Promise<PaymentWithInvoice> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        invoice:invoices(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Process refund
  async refund(id: string, amount: number, reason: string): Promise<PaymentWithInvoice> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        refunded_amount_cents: amount,
        refunded_at: new Date().toISOString(),
        refund_reason: reason,
        status: 'refunded',
      })
      .eq('id', id)
      .select(`
        *,
        invoice:invoices(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// Billing Event API
// =====================================================

export const billingEventApi = {
  // Get events by organization
  async getByOrganizationId(organizationId: string, params: BillingSearchParams = {}): Promise<BillingPaginatedResponse<BillingEvent>> {
    const { page = 1, limit = 10, query, filters, sortBy = 'created_at', sortOrder = 'desc' } = params;
    
    let queryBuilder = supabase
      .from('billing_events')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Apply search
    if (query) {
      queryBuilder = queryBuilder.or(`event_type.ilike.%${query}%,event_description.ilike.%${query}%`);
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      success: true,
    };
  },

  // Create event
  async create(event: BillingEventInsert): Promise<BillingEvent> {
    const { data, error } = await supabase
      .from('billing_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// Billing Summary API
// =====================================================

export const billingSummaryApi = {
  // Get billing summary for organization
  async getByOrganizationId(organizationId: string): Promise<BillingSummary> {
    // Get organization
    const organization = await organizationApi.getById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get current subscription
    const currentSubscription = await subscriptionApi.getCurrentByOrganizationId(organizationId);

    // Get invoice counts
    const { data: invoiceStats } = await supabase
      .from('invoices')
      .select('status, total_cents')
      .eq('organization_id', organizationId);

    const totalInvoices = invoiceStats?.length || 0;
    const paidInvoices = invoiceStats?.filter(inv => inv.status === 'paid').length || 0;
    const pendingInvoices = invoiceStats?.filter(inv => ['draft', 'open'].includes(inv.status)).length || 0;
    const totalAmountPaid = invoiceStats
      ?.filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_cents, 0) || 0;

    // Get next billing date
    const nextBillingDate = currentSubscription?.current_period_end || null;

    // Get usage if subscription exists
    let usage: SubscriptionUsage | null = null;
    if (currentSubscription) {
      usage = await subscriptionApi.getUsage(currentSubscription.id);
    }

    return {
      organization,
      current_subscription: currentSubscription,
      total_invoices: totalInvoices,
      paid_invoices: paidInvoices,
      pending_invoices: pendingInvoices,
      total_amount_paid: totalAmountPaid,
      next_billing_date: nextBillingDate,
      usage,
    };
  },

  // Get billing analytics (admin only)
  async getAnalytics(): Promise<BillingAnalytics> {
    // This would typically involve complex aggregations
    // For now, we'll return mock data
    return {
      monthly_revenue: 0,
      total_customers: 0,
      active_subscriptions: 0,
      churn_rate: 0,
      average_revenue_per_customer: 0,
      revenue_by_plan: [],
      revenue_trend: [],
    };
  },
};

// =====================================================
// Export all APIs
// =====================================================

export const billingApi = {
  organizations: organizationApi,
  userOrganizations: userOrganizationApi,
  subscriptionPlans: subscriptionPlanApi,
  subscriptions: subscriptionApi,
  invoices: invoiceApi,
  payments: paymentApi,
  billingEvents: billingEventApi,
  billingSummary: billingSummaryApi,
};
