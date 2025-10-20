import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  Settings,
  Eye,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useCustomers,
  useCreateCustomer,
  useDeleteCustomer,
  useCustomerMachines,
  useAddMachine
} from '@/hooks/useCustomerContent';
import type { Customer, CustomerInsert, CustomerMachineInsert } from '@/types/customer';

interface CustomerManagementProps {
  onCustomerSelect?: (customer: Customer) => void;
}

export default function CustomerManagement({ onCustomerSelect }: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMachineDialogOpen, setIsMachineDialogOpen] = useState(false);

  // Queries
  const { data: customersData } = useCustomers(1, 50, {
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    subscription_tier: tierFilter !== 'all' ? tierFilter : undefined
  });

  const { data: customerMachines } = useCustomerMachines(selectedCustomer?.id || '');

  // Mutations
  const createCustomerMutation = useCreateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  const addMachineMutation = useAddMachine();

  // Form states
  const [newCustomer, setNewCustomer] = useState<CustomerInsert>({
    name: '',
    contact_email: '',
    subscription_tier: 'basic',
    status: 'active',
    max_seats: 5,
    max_storage_gb: 10
  });

  const [newMachine, setNewMachine] = useState<CustomerMachineInsert>({
    customer_id: '',
    machine_model: '',
    status: 'active'
  });

  // Handle customer creation
  const handleCreateCustomer = async () => {
    try {
      await createCustomerMutation.mutateAsync(newCustomer);
      setNewCustomer({
        name: '',
        contact_email: '',
        subscription_tier: 'basic',
        status: 'active',
        max_seats: 5,
        max_storage_gb: 10
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };


  // Handle customer deletion
  const handleDeleteCustomer = async (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      try {
        await deleteCustomerMutation.mutateAsync(customer.id);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  // Handle machine addition
  const handleAddMachine = async () => {
    if (!selectedCustomer) return;
    
    try {
      await addMachineMutation.mutateAsync({
        ...newMachine,
        customer_id: selectedCustomer.id
      });
      setNewMachine({
        customer_id: '',
        machine_model: '',
        status: 'active'
      });
      setIsMachineDialogOpen(false);
    } catch (error) {
      console.error('Error adding machine:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h2 className="text-2xl font-bold text-primary-text">Customer Management</h2>
          <p className="text-secondary-text">
            Manage customers and their content access
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent-blue hover:bg-accent-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.contact_email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="Enter contact email"
                  />
                </div>
                <div>
                  <Label htmlFor="tier">Subscription Tier</Label>
                  <Select
                    value={newCustomer.subscription_tier}
                    onValueChange={(value) => setNewCustomer(prev => ({ ...prev, subscription_tier: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seats">Max Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={newCustomer.max_seats}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, max_seats: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storage">Max Storage (GB)</Label>
                    <Input
                      id="storage"
                      type="number"
                      value={newCustomer.max_storage_gb}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, max_storage_gb: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCustomer} className="bg-accent-blue hover:bg-accent-blue/90">
                    Create Customer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customersData?.customers.map((customer: any) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-blue rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <p className="text-sm text-secondary-text">{customer.contact_email}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        // Edit functionality would be implemented here
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCustomer(customer)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                    <Badge className={getTierColor(customer.subscription_tier)}>
                      {customer.subscription_tier}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-text">Max Seats:</span>
                      <p className="font-medium">{customer.max_seats}</p>
                    </div>
                    <div>
                      <span className="text-secondary-text">Storage:</span>
                      <p className="font-medium">{customer.max_storage_gb} GB</p>
                    </div>
                  </div>

                  <div className="text-sm text-secondary-text">
                    <span>Created:</span> {formatDate(customer.created_at)}
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      onCustomerSelect?.(customer);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCustomer.name} - Customer Details</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="machines">Machines</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm text-secondary-text">Company Name</Label>
                        <p className="font-medium">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-secondary-text">Contact Email</Label>
                        <p className="font-medium">{selectedCustomer.contact_email}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-secondary-text">Status</Label>
                        <Badge className={getStatusColor(selectedCustomer.status)}>
                          {selectedCustomer.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm text-secondary-text">Subscription Tier</Label>
                        <Badge className={getTierColor(selectedCustomer.subscription_tier)}>
                          {selectedCustomer.subscription_tier}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm text-secondary-text">Max Seats</Label>
                        <p className="font-medium">{selectedCustomer.max_seats}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-secondary-text">Max Storage</Label>
                        <p className="font-medium">{selectedCustomer.max_storage_gb} GB</p>
                      </div>
                      <div>
                        <Label className="text-sm text-secondary-text">Created</Label>
                        <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-secondary-text">Last Updated</Label>
                        <p className="font-medium">{formatDate(selectedCustomer.updated_at)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="machines" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customer Machines</h3>
                  <Dialog open={isMachineDialogOpen} onOpenChange={setIsMachineDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Machine
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Machine</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="machine_model">Machine Model</Label>
                          <Input
                            id="machine_model"
                            value={newMachine.machine_model}
                            onChange={(e) => setNewMachine(prev => ({ ...prev, machine_model: e.target.value }))}
                            placeholder="Enter machine model"
                          />
                        </div>
                        <div>
                          <Label htmlFor="machine_type">Machine Type</Label>
                          <Input
                            id="machine_type"
                            value={newMachine.machine_type || ''}
                            onChange={(e) => setNewMachine(prev => ({ ...prev, machine_type: e.target.value }))}
                            placeholder="Enter machine type"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newMachine.location || ''}
                            onChange={(e) => setNewMachine(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter location"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsMachineDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddMachine} className="bg-accent-blue hover:bg-accent-blue/90">
                            Add Machine
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerMachines?.map((machine) => (
                    <Card key={machine.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">{machine.machine_model}</h4>
                          {machine.machine_type && (
                            <p className="text-sm text-secondary-text">{machine.machine_type}</p>
                          )}
                          {machine.location && (
                            <p className="text-sm text-secondary-text">{machine.location}</p>
                          )}
                          <Badge className={getStatusColor(machine.status)}>
                            {machine.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <p className="text-secondary-text">Content management will be implemented here.</p>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <p className="text-secondary-text">Analytics will be implemented here.</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
