/**
 * Subscription Plan Card Component
 * Generated: 2024-12-21T13:00:00Z
 */

import { motion } from 'motion/react';
import { Check, Star, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/types/billing';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  isPopular?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
  onUpgrade?: (plan: SubscriptionPlan) => void;
  currentPlanId?: string;
  className?: string;
}

export function SubscriptionPlanCard({
  plan,
  isSelected = false,
  isPopular = false,
  onSelect,
  onUpgrade,
  currentPlanId,
  className,
}: SubscriptionPlanCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  const isTrial = plan.plan_type === 'trial';
  const isEnterprise = plan.plan_type === 'enterprise';
  
  const formatPrice = (priceCents: number, currency: string, billingCycle: string) => {
    const price = priceCents / 100;
    const symbol = currency === 'USD' ? '$' : currency;
    const cycle = billingCycle === 'yearly' ? '/year' : '/month';
    
    if (price === 0) return 'Free';
    return `${symbol}${price.toFixed(0)}${cycle}`;
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'trial':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'basic':
        return <Check className="h-6 w-6 text-green-500" />;
      case 'professional':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'enterprise':
        return <Star className="h-6 w-6 text-gold-500" />;
      default:
        return <Check className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'trial':
        return 'border-blue-200 bg-blue-50';
      case 'basic':
        return 'border-green-200 bg-green-50';
      case 'professional':
        return 'border-purple-200 bg-purple-50';
      case 'enterprise':
        return 'border-gold-200 bg-gold-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn('relative', className)}
    >
      <Card
        className={cn(
          'relative h-full transition-all duration-200',
          isSelected && 'ring-2 ring-blue-500 shadow-lg',
          isPopular && 'border-blue-500 shadow-lg',
          isCurrentPlan && 'border-green-500 bg-green-50',
          !isSelected && !isPopular && !isCurrentPlan && 'hover:shadow-md',
          getPlanColor(plan.plan_type)
        )}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white px-3 py-1">
              Most Popular
            </Badge>
          </div>
        )}
        
        {isCurrentPlan && (
          <div className="absolute -top-3 right-4">
            <Badge className="bg-green-500 text-white px-3 py-1">
              Current Plan
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            {getPlanIcon(plan.plan_type)}
          </div>
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {plan.description}
          </CardDescription>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(plan.price_cents, plan.currency, plan.billing_cycle)}
            </div>
            {plan.billing_cycle === 'yearly' && (
              <div className="text-sm text-green-600 font-medium">
                Save 20% with annual billing
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Plan Limits */}
          <div className="space-y-2">
            {plan.max_users && (
              <div className="flex justify-between text-sm">
                <span>Users</span>
                <span className="font-medium">{plan.max_users.toLocaleString()}</span>
              </div>
            )}
            {plan.max_machines && (
              <div className="flex justify-between text-sm">
                <span>Machines</span>
                <span className="font-medium">{plan.max_machines.toLocaleString()}</span>
              </div>
            )}
            {plan.max_storage_gb && (
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span className="font-medium">{plan.max_storage_gb} GB</span>
              </div>
            )}
            {plan.max_videos && (
              <div className="flex justify-between text-sm">
                <span>Videos</span>
                <span className="font-medium">{plan.max_videos.toLocaleString()}</span>
              </div>
            )}
            {plan.max_courses && (
              <div className="flex justify-between text-sm">
                <span>Courses</span>
                <span className="font-medium">{plan.max_courses.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900">Features</h4>
            <div className="space-y-1">
              {Object.entries(plan.features).map(([key]) => (
                <div key={key} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          {isCurrentPlan ? (
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Current Plan
            </Button>
          ) : isTrial ? (
            <Button
              onClick={() => onSelect?.(plan)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Start Free Trial
            </Button>
          ) : isEnterprise ? (
            <Button
              onClick={() => onUpgrade?.(plan)}
              variant="outline"
              className="w-full"
            >
              Contact Sales
            </Button>
          ) : (
            <Button
              onClick={() => onSelect?.(plan)}
              className="w-full"
            >
              {isSelected ? 'Selected' : 'Choose Plan'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
