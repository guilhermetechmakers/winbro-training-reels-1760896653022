import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserManagement() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">User Management</h1>
          <p className="text-secondary-text">Manage users, roles, invites and seat allocations</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users, roles, invites and seat allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">User Management Coming Soon</h3>
              <p className="text-secondary-text">This feature will allow you to manage users, roles, and permissions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}