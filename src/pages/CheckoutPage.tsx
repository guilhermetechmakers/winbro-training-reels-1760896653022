import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Checkout</h1>
          <p className="text-secondary-text">Purchase subscriptions, seats, and add-ons</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Purchase subscriptions, seats, and add-ons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Checkout Coming Soon</h3>
              <p className="text-secondary-text">This feature will handle subscription and payment processing.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}