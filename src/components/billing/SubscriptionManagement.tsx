/**
 * Subscription Management Component
 * Generated: 2024-12-21T13:00:00Z
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, HardDrive, Video, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { useSubscriptionPlans, useCurrentSubscription, useSubscriptionUsage, useCreateSubscription, useCancelSubscription } from '@/hooks/useBilling';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/types/billing';

interface SubscriptionManagementProps {
  organizationId: string;
  className?: string;
}

export function SubscriptionManagement({ organizationId, className }: SubscriptionManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentSubscription(organizationId);
  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage(currentSubscription?.id || '');
  
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();

  const isLoading = plansLoading || subscriptionLoading || usageLoading;

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !organizationId) return;

    try {
      const subscriptionData = {
        organization_id: organizationId,
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        price_cents: selectedPlan.price_cents,
        currency: selectedPlan.currency,
        seats_limit: selectedPlan.max_users,
        machines_limit: selectedPlan.max_machines,
      };

      await createSubscription.mutateAsync(subscriptionData);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      await cancelSubscription.mutateAsync(currentSubscription.id);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUsagePercentage = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };


  const filteredPlans = plans?.filter(plan => plan.billing_cycle === billingCycle) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600">
          Manage your subscription plan and billing settings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {currentSubscription ? (
            <div className="space-y-6">
              {/* Current Subscription Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentSubscription.plan.name}</CardTitle>
                      <CardDescription>
                        {currentSubscription.plan.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        currentSubscription.status === 'active' && 'bg-green-500',
                        currentSubscription.status === 'trial' && 'bg-blue-500',
                        currentSubscription.status === 'past_due' && 'bg-red-500'
                      )}
                    >
                      {currentSubscription.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(currentSubscription.price_cents / 100).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">
                        per {currentSubscription.billing_cycle}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatDate(currentSubscription.current_period_end)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Next billing date
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {currentSubscription.currency}
                      </div>
                      <div className="text-sm text-gray-600">
                        Currency
                      </div>
                    </div>
                  </div>

                  {currentSubscription.status === 'trial' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your trial ends on {formatDate(currentSubscription.trial_end || '')}. 
                        Choose a plan to continue using the service.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={cancelSubscription.isPending}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Overview */}
              {usage && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Users</div>
                          <div className="text-2xl font-bold">
                            {usage.seats_used} / {currentSubscription.seats_limit || '∞'}
                          </div>
                          {currentSubscription.seats_limit && (
                            <Progress 
                              value={getUsagePercentage(usage.seats_used, currentSubscription.seats_limit)}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Storage</div>
                          <div className="text-2xl font-bold">
                            {usage.storage_used_gb.toFixed(1)} GB
                          </div>
                          {currentSubscription.plan.max_storage_gb && (
                            <Progress 
                              value={getUsagePercentage(usage.storage_used_gb, currentSubscription.plan.max_storage_gb)}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Videos</div>
                          <div className="text-2xl font-bold">
                            {usage.videos_used} / {currentSubscription.plan.max_videos || '∞'}
                          </div>
                          {currentSubscription.plan.max_videos && (
                            <Progress 
                              value={getUsagePercentage(usage.videos_used, currentSubscription.plan.max_videos)}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-600">Courses</div>
                          <div className="text-2xl font-bold">
                            {usage.courses_used} / {currentSubscription.plan.max_courses || '∞'}
                          </div>
                          {currentSubscription.plan.max_courses && (
                            <Progress 
                              value={getUsagePercentage(usage.courses_used, currentSubscription.plan.max_courses)}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">📊</div>
                  <h3 className="text-xl font-semibold">No Active Subscription</h3>
                  <p className="text-gray-600">
                    Choose a plan to get started with Winbro Training Reels
                  </p>
                  <Button onClick={() => document.getElementById('plans-tab')?.click()}>
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Yearly
                <Badge className="ml-2 bg-green-500 text-white text-xs">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan, index) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan?.id === plan.id}
                isPopular={index === 1} // Mark middle plan as popular
                currentPlanId={currentSubscription?.plan.id}
                onSelect={handlePlanSelect}
                className="h-full"
              />
            ))}
          </div>

          {/* Selected Plan Actions */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">{selectedPlan.name}</div>
                      <div className="text-sm text-gray-600">
                        ${(selectedPlan.price_cents / 100).toFixed(0)} / {selectedPlan.billing_cycle}
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubscribe}
                      disabled={createSubscription.isPending}
                      className="ml-auto"
                    >
                      {createSubscription.isPending ? 'Processing...' : 'Subscribe Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          {usage ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Usage Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span className="font-medium">{usage.seats_used}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Limit</span>
                        <span className="font-medium">{currentSubscription?.seats_limit || 'Unlimited'}</span>
                      </div>
                      {currentSubscription?.seats_limit && (
                        <Progress 
                          value={getUsagePercentage(usage.seats_used, currentSubscription.seats_limit)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span className="font-medium">{usage.storage_used_gb.toFixed(1)} GB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Limit</span>
                        <span className="font-medium">{currentSubscription?.plan.max_storage_gb || 'Unlimited'} GB</span>
                      </div>
                      {currentSubscription?.plan.max_storage_gb && (
                        <Progress 
                          value={getUsagePercentage(usage.storage_used_gb, currentSubscription.plan.max_storage_gb)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span className="font-medium">{usage.videos_used}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Limit</span>
                        <span className="font-medium">{currentSubscription?.plan.max_videos || 'Unlimited'}</span>
                      </div>
                      {currentSubscription?.plan.max_videos && (
                        <Progress 
                          value={getUsagePercentage(usage.videos_used, currentSubscription.plan.max_videos)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span className="font-medium">{usage.courses_used}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Limit</span>
                        <span className="font-medium">{currentSubscription?.plan.max_courses || 'Unlimited'}</span>
                      </div>
                      {currentSubscription?.plan.max_courses && (
                        <Progress 
                          value={getUsagePercentage(usage.courses_used, currentSubscription.plan.max_courses)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">📊</div>
                  <h3 className="text-xl font-semibold">No Usage Data</h3>
                  <p className="text-gray-600">
                    Usage data will appear here once you have an active subscription
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
