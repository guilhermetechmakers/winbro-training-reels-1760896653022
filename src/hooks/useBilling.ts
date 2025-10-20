/**
 * Billing and Subscription React Query Hooks
 * Generated: 2024-12-21T13:00:00Z
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingApi } from '@/api/billing';
import type {
  OrganizationInsert,
  OrganizationUpdate,
  UserOrganizationInsert,
  UserOrganizationUpdate,
  SubscriptionPlanInsert,
  SubscriptionPlanUpdate,
  SubscriptionInsert,
  SubscriptionUpdate,
  InvoiceInsert,
  InvoiceUpdate,
  PaymentInsert,
  PaymentUpdate,
  BillingEventInsert,
  BillingSearchParams,
} from '@/types/billing';

// =====================================================
// Organization Hooks
// =====================================================

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => billingApi.organizations.getById(id),
    enabled: !!id,
  });
};

export const useOrganizationWithSubscriptions = (id: string) => {
  return useQuery({
    queryKey: ['organization', id, 'with-subscriptions'],
    queryFn: () => billingApi.organizations.getWithSubscriptions(id),
    enabled: !!id,
  });
};

export const useOrganizations = (params: BillingSearchParams = {}) => {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => billingApi.organizations.list(params),
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationInsert) => billingApi.organizations.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create organization');
      console.error('Create organization error:', error);
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdate }) =>
      billingApi.organizations.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update organization');
      console.error('Update organization error:', error);
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingApi.organizations.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.removeQueries({ queryKey: ['organization', id] });
      toast.success('Organization deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete organization');
      console.error('Delete organization error:', error);
    },
  });
};

// =====================================================
// User Organization Hooks
// =====================================================

export const useUserOrganizations = (userId: string) => {
  return useQuery({
    queryKey: ['user-organizations', userId],
    queryFn: () => billingApi.userOrganizations.getByUserId(userId),
    enabled: !!userId,
  });
};

export const useAddUserToOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserOrganizationInsert) => billingApi.userOrganizations.addUser(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['organization', data.organization_id] });
      toast.success('User added to organization successfully');
    },
    onError: (error) => {
      toast.error('Failed to add user to organization');
      console.error('Add user to organization error:', error);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserOrganizationUpdate }) =>
      billingApi.userOrganizations.updateRole(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations', data.user_id] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error('Update user role error:', error);
    },
  });
};

export const useRemoveUserFromOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingApi.userOrganizations.removeUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      toast.success('User removed from organization successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove user from organization');
      console.error('Remove user from organization error:', error);
    },
  });
};

// =====================================================
// Subscription Plan Hooks
// =====================================================

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => billingApi.subscriptionPlans.getActive(),
  });
};

export const useSubscriptionPlan = (id: string) => {
  return useQuery({
    queryKey: ['subscription-plan', id],
    queryFn: () => billingApi.subscriptionPlans.getById(id),
    enabled: !!id,
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscriptionPlanInsert) => billingApi.subscriptionPlans.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create subscription plan');
      console.error('Create subscription plan error:', error);
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionPlanUpdate }) =>
      billingApi.subscriptionPlans.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plan', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Subscription plan updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update subscription plan');
      console.error('Update subscription plan error:', error);
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingApi.subscriptionPlans.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.removeQueries({ queryKey: ['subscription-plan', id] });
      toast.success('Subscription plan deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete subscription plan');
      console.error('Delete subscription plan error:', error);
    },
  });
};

// =====================================================
// Subscription Hooks
// =====================================================

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => billingApi.subscriptions.getById(id),
    enabled: !!id,
  });
};

export const useCurrentSubscription = (organizationId: string) => {
  return useQuery({
    queryKey: ['current-subscription', organizationId],
    queryFn: () => billingApi.subscriptions.getCurrentByOrganizationId(organizationId),
    enabled: !!organizationId,
  });
};

export const useSubscriptionUsage = (id: string) => {
  return useQuery({
    queryKey: ['subscription-usage', id],
    queryFn: () => billingApi.subscriptions.getUsage(id),
    enabled: !!id,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubscriptionInsert) => billingApi.subscriptions.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['subscription', data.id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Subscription created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create subscription');
      console.error('Create subscription error:', error);
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionUpdate }) =>
      billingApi.subscriptions.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Subscription updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update subscription');
      console.error('Update subscription error:', error);
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billingApi.subscriptions.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', data.id] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription');
      console.error('Cancel subscription error:', error);
    },
  });
};

// =====================================================
// Invoice Hooks
// =====================================================

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => billingApi.invoices.getById(id),
    enabled: !!id,
  });
};

export const useInvoices = (organizationId: string, params: BillingSearchParams = {}) => {
  return useQuery({
    queryKey: ['invoices', organizationId, params],
    queryFn: () => billingApi.invoices.getByOrganizationId(organizationId, params),
    enabled: !!organizationId,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoiceInsert) => billingApi.invoices.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create invoice');
      console.error('Create invoice error:', error);
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdate }) =>
      billingApi.invoices.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update invoice');
      console.error('Update invoice error:', error);
    },
  });
};

export const useMarkInvoiceAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paidAt }: { id: string; paidAt?: string }) =>
      billingApi.invoices.markAsPaid(id, paidAt),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      toast.error('Failed to mark invoice as paid');
      console.error('Mark invoice as paid error:', error);
    },
  });
};

export const useGenerateInvoicePdf = () => {
  return useMutation({
    mutationFn: (id: string) => billingApi.invoices.generatePdf(id),
    onSuccess: () => {
      toast.success('Invoice PDF generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate invoice PDF');
      console.error('Generate invoice PDF error:', error);
    },
  });
};

// =====================================================
// Payment Hooks
// =====================================================

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => billingApi.payments.getById(id),
    enabled: !!id,
  });
};

export const usePayments = (organizationId: string, params: BillingSearchParams = {}) => {
  return useQuery({
    queryKey: ['payments', organizationId, params],
    queryFn: () => billingApi.payments.getByOrganizationId(organizationId, params),
    enabled: !!organizationId,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentInsert) => billingApi.payments.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Payment created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create payment');
      console.error('Create payment error:', error);
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentUpdate }) =>
      billingApi.payments.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update payment');
      console.error('Update payment error:', error);
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      billingApi.payments.refund(id, amount, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary', data.organization_id] });
      toast.success('Payment refunded successfully');
    },
    onError: (error) => {
      toast.error('Failed to refund payment');
      console.error('Refund payment error:', error);
    },
  });
};

// =====================================================
// Billing Event Hooks
// =====================================================

export const useBillingEvents = (organizationId: string, params: BillingSearchParams = {}) => {
  return useQuery({
    queryKey: ['billing-events', organizationId, params],
    queryFn: () => billingApi.billingEvents.getByOrganizationId(organizationId, params),
    enabled: !!organizationId,
  });
};

export const useCreateBillingEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BillingEventInsert) => billingApi.billingEvents.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['billing-events', data.organization_id] });
    },
    onError: (error) => {
      console.error('Create billing event error:', error);
    },
  });
};

// =====================================================
// Billing Summary Hooks
// =====================================================

export const useBillingSummary = (organizationId: string) => {
  return useQuery({
    queryKey: ['billing-summary', organizationId],
    queryFn: () => billingApi.billingSummary.getByOrganizationId(organizationId),
    enabled: !!organizationId,
  });
};

export const useBillingAnalytics = () => {
  return useQuery({
    queryKey: ['billing-analytics'],
    queryFn: () => billingApi.billingSummary.getAnalytics(),
  });
};

// =====================================================
// Utility Hooks
// =====================================================

export const useBillingData = (organizationId: string) => {
  const billingSummary = useBillingSummary(organizationId);
  const currentSubscription = useCurrentSubscription(organizationId);
  const subscriptionUsage = useSubscriptionUsage(currentSubscription.data?.id || '');

  return {
    billingSummary,
    currentSubscription,
    subscriptionUsage,
    isLoading: billingSummary.isLoading || currentSubscription.isLoading || subscriptionUsage.isLoading,
    error: billingSummary.error || currentSubscription.error || subscriptionUsage.error,
  };
};
