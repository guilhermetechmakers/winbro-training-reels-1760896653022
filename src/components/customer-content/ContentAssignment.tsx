import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Settings,
  Users,
  Building
} from 'lucide-react';
import {
  useCustomers,
  useAssignContent,
  useBulkAssignContent,
  useAutoAssignContentByMachines
} from '@/hooks/useCustomerContent';
import type { ContentAssignmentRequest } from '@/types/customer';

interface ContentAssignmentProps {
  videoId?: string;
  onAssignmentComplete?: () => void;
}

export default function ContentAssignment({ videoId, onAssignmentComplete }: ContentAssignmentProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [assignmentType, setAssignmentType] = useState<'manual' | 'automatic' | 'subscription'>('manual');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'standard' | 'premium' | 'exclusive'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Queries
  const { data: customersData, isLoading: customersLoading } = useCustomers(1, 100, {
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    subscription_tier: tierFilter !== 'all' ? tierFilter : undefined
  });

  // Mutations
  const assignContentMutation = useAssignContent();
  const bulkAssignContentMutation = useBulkAssignContent();
  const autoAssignMutation = useAutoAssignContentByMachines();

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customersData?.customers) return [];
    return customersData.customers;
  }, [customersData]);

  // Handle customer selection
  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c: any) => c.id));
    }
  };

  // Handle assignment
  const handleAssignContent = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    if (!videoId) {
      toast.error('No video selected for assignment');
      return;
    }

    try {
      const assignments: ContentAssignmentRequest[] = selectedCustomers.map(customerId => ({
        customer_id: customerId,
        video_ids: [videoId],
        assignment_type: assignmentType,
        assignment_reason: assignmentReason,
        is_featured: isFeatured,
        access_level: accessLevel,
        assigned_by: 'current-user-id' // This would come from auth context
      }));

      await bulkAssignContentMutation.mutateAsync({
        assignments,
        auto_assign_by_machines: false,
        notify_customers: true
      });

      toast.success(`Content assigned to ${selectedCustomers.length} customer(s)`);
      setSelectedCustomers([]);
      onAssignmentComplete?.();
    } catch (error) {
      console.error('Error assigning content:', error);
      toast.error('Failed to assign content');
    }
  };

  // Handle auto-assignment
  const handleAutoAssign = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    try {
      const promises = selectedCustomers.map(customerId => 
        autoAssignMutation.mutateAsync(customerId)
      );
      
      const results = await Promise.all(promises);
      const totalAssigned = results.reduce((sum, count) => sum + count, 0);
      
      toast.success(`Auto-assigned ${totalAssigned} content items based on machine models`);
      onAssignmentComplete?.();
    } catch (error) {
      console.error('Error auto-assigning content:', error);
      toast.error('Failed to auto-assign content');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">Content Assignment</h2>
          <p className="text-secondary-text">
            Assign content to customers and manage access levels
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleAutoAssign}
            disabled={selectedCustomers.length === 0 || autoAssignMutation.isPending}
          >
            <Settings className="h-4 w-4 mr-2" />
            Auto-Assign by Machines
          </Button>
          <Button
            onClick={handleAssignContent}
            disabled={selectedCustomers.length === 0 || assignContentMutation.isPending}
            className="bg-accent-blue hover:bg-accent-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign to Selected ({selectedCustomers.length})
          </Button>
        </div>
      </div>

      {/* Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignment-type">Assignment Type</Label>
              <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="access-level">Access Level</Label>
              <Select value={accessLevel} onValueChange={(value: any) => setAccessLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignment-reason">Assignment Reason</Label>
            <Textarea
              id="assignment-reason"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="Enter reason for assignment..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={isFeatured}
              onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
            />
            <Label htmlFor="featured">Mark as Featured Content</Label>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-icon-gray" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Customers</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedCustomers.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Badge variant="outline">
                {selectedCustomers.length} selected
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-blue" />
                <span className="text-secondary-text">Loading customers...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer: any) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedCustomers.includes(customer.id)
                        ? 'ring-2 ring-accent-blue bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleCustomerToggle(customer.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleCustomerToggle(customer.id)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-4 w-4 text-icon-gray" />
                            <h3 className="font-medium text-primary-text truncate">
                              {customer.name}
                            </h3>
                          </div>
                          
                          <p className="text-sm text-secondary-text mb-2 truncate">
                            {customer.contact_email}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                            <Badge className={getTierColor(customer.subscription_tier)}>
                              {customer.subscription_tier}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-secondary-text">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {customer.max_seats} seats
                            </div>
                            <div className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              {customer.max_storage_gb} GB storage
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
