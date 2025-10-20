import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  createSubscription,
  getCustomerSubscription,
  updateSubscription,
  getCustomerContent,
  assignContent,
  bulkAssignContent,
  updateContentAssignment,
  removeContentFromLibrary,
  autoAssignContentByMachines,
  getCustomerMachines,
  addMachine,
  updateMachine,
  deleteMachine,
  trackContentEvent,
  getCustomerAnalytics,
  getCustomerDashboardStats,
  searchCustomerContent,
  getCustomerByDomain,
  getCustomerByUserCompany,
  hasContentAccess,
  getUserAccessibleContent
} from '@/api/customerContent';
import type {
  CustomerInsert,
  CustomerUpdate,
  CustomerSubscriptionInsert,
  CustomerSubscriptionUpdate,
  CustomerContentLibraryUpdate,
  CustomerMachineInsert,
  CustomerMachineUpdate,
  CustomerContentFilter,
  ContentAssignmentRequest,
  BulkContentAssignment,
  ContentAnalyticsEvent
} from '@/types/customer';

// Query keys
export const customerContentKeys = {
  all: ['customerContent'] as const,
  customers: (page?: number, limit?: number, filters?: any) => 
    [...customerContentKeys.all, 'customers', page, limit, filters] as const,
  customer: (id: string) => [...customerContentKeys.all, 'customer', id] as const,
  customerByDomain: (domain: string) => [...customerContentKeys.all, 'customerByDomain', domain] as const,
  customerByCompany: (company: string) => [...customerContentKeys.all, 'customerByCompany', company] as const,
  subscriptions: (customerId: string) => [...customerContentKeys.all, 'subscriptions', customerId] as const,
  content: (customerId: string, filters?: CustomerContentFilter) => 
    [...customerContentKeys.all, 'content', customerId, filters] as const,
  userContent: (userId: string, filters?: CustomerContentFilter) => 
    [...customerContentKeys.all, 'userContent', userId, filters] as const,
  machines: (customerId: string) => [...customerContentKeys.all, 'machines', customerId] as const,
  analytics: (customerId: string) => [...customerContentKeys.all, 'analytics', customerId] as const,
  dashboardStats: (customerId: string) => [...customerContentKeys.all, 'dashboardStats', customerId] as const,
  search: (customerId: string, query: string, filters?: any) => 
    [...customerContentKeys.all, 'search', customerId, query, filters] as const,
  contentAccess: (userId: string, videoId: string) => 
    [...customerContentKeys.all, 'contentAccess', userId, videoId] as const,
};

// =====================================================
// CUSTOMER MANAGEMENT HOOKS
// =====================================================

// Get all customers
export function useCustomers(
  page = 1,
  limit = 20,
  filters: {
    status?: string;
    subscription_tier?: string;
    search?: string;
  } = {}
) {
  return useQuery({
    queryKey: customerContentKeys.customers(page, limit, filters),
    queryFn: () => getCustomers(page, limit, filters),
    placeholderData: (previousData) => previousData,
  });
}

// Get customer by ID
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerContentKeys.customer(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}

// Get customer by domain
export function useCustomerByDomain(domain: string) {
  return useQuery({
    queryKey: customerContentKeys.customerByDomain(domain),
    queryFn: () => getCustomerByDomain(domain),
    enabled: !!domain,
  });
}

// Get customer by company
export function useCustomerByCompany(company: string) {
  return useQuery({
    queryKey: customerContentKeys.customerByCompany(company),
    queryFn: () => getCustomerByUserCompany(company),
    enabled: !!company,
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customer: CustomerInsert) => createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'customers',
      });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error('Error creating customer:', error);
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CustomerUpdate }) => 
      updateCustomer(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.customer(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'customers',
      });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update customer');
      console.error('Error updating customer:', error);
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'customers',
      });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    },
  });
}

// =====================================================
// CUSTOMER SUBSCRIPTION HOOKS
// =====================================================

// Get customer subscription
export function useCustomerSubscription(customerId: string) {
  return useQuery({
    queryKey: customerContentKeys.subscriptions(customerId),
    queryFn: () => getCustomerSubscription(customerId),
    enabled: !!customerId,
  });
}

// Create subscription mutation
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscription: CustomerSubscriptionInsert) => createSubscription(subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'subscriptions',
      });
      toast.success('Subscription created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create subscription');
      console.error('Error creating subscription:', error);
    },
  });
}

// Update subscription mutation
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CustomerSubscriptionUpdate }) => 
      updateSubscription(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'subscriptions',
      });
      toast.success('Subscription updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update subscription');
      console.error('Error updating subscription:', error);
    },
  });
}

// =====================================================
// CUSTOMER CONTENT HOOKS
// =====================================================

// Get customer content
export function useCustomerContent(customerId: string, filters: CustomerContentFilter = {}) {
  return useQuery({
    queryKey: customerContentKeys.content(customerId, filters),
    queryFn: () => getCustomerContent(customerId, filters),
    enabled: !!customerId,
    placeholderData: (previousData) => previousData,
  });
}

// Get user accessible content
export function useUserAccessibleContent(userId: string, filters: CustomerContentFilter = {}) {
  return useQuery({
    queryKey: customerContentKeys.userContent(userId, filters),
    queryFn: () => getUserAccessibleContent(userId, filters),
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
  });
}

// Assign content mutation
export function useAssignContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignment: ContentAssignmentRequest) => assignContent(assignment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.content(variables.customer_id),
      });
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'userContent',
      });
      toast.success('Content assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign content');
      console.error('Error assigning content:', error);
    },
  });
}

// Bulk assign content mutation
export function useBulkAssignContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkAssignment: BulkContentAssignment) => bulkAssignContent(bulkAssignment),
    onSuccess: (data) => {
      // Invalidate all customer content queries
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => 
          query.queryKey[1] === 'content' || query.queryKey[1] === 'userContent',
      });
      
      const successCount = data.successful.length;
      const failCount = data.failed.length;
      
      if (successCount > 0) {
        toast.success(`${successCount} content items assigned successfully`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} assignments failed`);
      }
    },
    onError: (error) => {
      toast.error('Failed to bulk assign content');
      console.error('Error bulk assigning content:', error);
    },
  });
}

// Update content assignment mutation
export function useUpdateContentAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CustomerContentLibraryUpdate }) => 
      updateContentAssignment(id, updates),
    onSuccess: () => {
      // Invalidate all content queries since we don't know the customer ID
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => 
          query.queryKey[1] === 'content' || query.queryKey[1] === 'userContent',
      });
      toast.success('Content assignment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update content assignment');
      console.error('Error updating content assignment:', error);
    },
  });
}

// Remove content from library mutation
export function useRemoveContentFromLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, videoId }: { customerId: string; videoId: string }) => 
      removeContentFromLibrary(customerId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => 
          query.queryKey[1] === 'content' || query.queryKey[1] === 'userContent',
      });
      toast.success('Content removed from library');
    },
    onError: (error) => {
      toast.error('Failed to remove content from library');
      console.error('Error removing content from library:', error);
    },
  });
}

// Auto-assign content by machines mutation
export function useAutoAssignContentByMachines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => autoAssignContentByMachines(customerId),
    onSuccess: (assignedCount, customerId) => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.content(customerId),
      });
      toast.success(`${assignedCount} content items auto-assigned based on machine models`);
    },
    onError: (error) => {
      toast.error('Failed to auto-assign content');
      console.error('Error auto-assigning content:', error);
    },
  });
}

// =====================================================
// CUSTOMER MACHINES HOOKS
// =====================================================

// Get customer machines
export function useCustomerMachines(customerId: string) {
  return useQuery({
    queryKey: customerContentKeys.machines(customerId),
    queryFn: () => getCustomerMachines(customerId),
    enabled: !!customerId,
  });
}

// Add machine mutation
export function useAddMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (machine: CustomerMachineInsert) => addMachine(machine),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'machines',
      });
      toast.success('Machine added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add machine');
      console.error('Error adding machine:', error);
    },
  });
}

// Update machine mutation
export function useUpdateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CustomerMachineUpdate }) => 
      updateMachine(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.machines(data.customer_id),
      });
      toast.success('Machine updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update machine');
      console.error('Error updating machine:', error);
    },
  });
}

// Delete machine mutation
export function useDeleteMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMachine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerContentKeys.all,
        predicate: (query) => query.queryKey[1] === 'machines',
      });
      toast.success('Machine deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete machine');
      console.error('Error deleting machine:', error);
    },
  });
}

// =====================================================
// CUSTOMER ANALYTICS HOOKS
// =====================================================

// Get customer analytics
export function useCustomerAnalytics(customerId: string) {
  return useQuery({
    queryKey: customerContentKeys.analytics(customerId),
    queryFn: () => getCustomerAnalytics(customerId),
    enabled: !!customerId,
  });
}

// Get customer dashboard stats
export function useCustomerDashboardStats(customerId: string) {
  return useQuery({
    queryKey: customerContentKeys.dashboardStats(customerId),
    queryFn: () => getCustomerDashboardStats(customerId),
    enabled: !!customerId,
  });
}

// Track content event mutation
export function useTrackContentEvent() {
  return useMutation({
    mutationFn: (event: ContentAnalyticsEvent) => trackContentEvent(event),
    onError: (error) => {
      console.error('Error tracking content event:', error);
    },
  });
}

// =====================================================
// CUSTOMER CONTENT SEARCH HOOKS
// =====================================================

// Search customer content
export function useSearchCustomerContent(
  customerId: string,
  query: string,
  filters: Omit<CustomerContentFilter, 'customer_id' | 'search_query'> = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: customerContentKeys.search(customerId, query, { ...filters, page, limit }),
    queryFn: () => searchCustomerContent(customerId, query, filters, page, limit),
    enabled: !!customerId && !!query,
    placeholderData: (previousData) => previousData,
  });
}

// =====================================================
// CONTENT ACCESS HOOKS
// =====================================================

// Check content access
export function useContentAccess(userId: string, videoId: string) {
  return useQuery({
    queryKey: customerContentKeys.contentAccess(userId, videoId),
    queryFn: () => hasContentAccess(userId, videoId),
    enabled: !!userId && !!videoId,
  });
}

// =====================================================
// COMBINED HOOKS
// =====================================================

// Combined hook for customer with subscription and content
export function useCustomerWithDetails(customerId: string) {
  const customer = useCustomer(customerId);
  const subscription = useCustomerSubscription(customerId);
  const machines = useCustomerMachines(customerId);
  const dashboardStats = useCustomerDashboardStats(customerId);

  return {
    customer,
    subscription,
    machines,
    dashboardStats,
    isLoading: customer.isLoading || subscription.isLoading || machines.isLoading || dashboardStats.isLoading,
    error: customer.error || subscription.error || machines.error || dashboardStats.error,
  };
}

// Combined hook for user content with access check
export function useUserContentWithAccess(userId: string, videoId: string, filters: CustomerContentFilter = {}) {
  const content = useUserAccessibleContent(userId, filters);
  const hasAccess = useContentAccess(userId, videoId);

  return {
    content,
    hasAccess,
    isLoading: content.isLoading || hasAccess.isLoading,
    error: content.error || hasAccess.error,
  };
}

// Combined hook for customer content with analytics
export function useCustomerContentWithAnalytics(customerId: string, filters: CustomerContentFilter = {}) {
  const content = useCustomerContent(customerId, filters);
  const analytics = useCustomerAnalytics(customerId);
  const dashboardStats = useCustomerDashboardStats(customerId);

  return {
    content,
    analytics,
    dashboardStats,
    isLoading: content.isLoading || analytics.isLoading || dashboardStats.isLoading,
    error: content.error || analytics.error || dashboardStats.error,
  };
}
