/**
 * Billing Page Component
 * Generated: 2024-12-21T13:00:00Z
 */

import { motion } from 'motion/react';
import { SubscriptionManagement } from '@/components/billing/SubscriptionManagement';
import { BillingHistory } from '@/components/billing/BillingHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBillingSummary } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/AuthContext';

export function BillingPage() {
  const { user } = useAuth();
  
  // For now, we'll use a mock organization ID
  // In a real app, this would come from the user's organization
  const organizationId = user?.id || 'mock-org-id';

  const { isLoading } = useBillingSummary(organizationId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <SubscriptionManagement organizationId={organizationId} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingHistory organizationId={organizationId} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
