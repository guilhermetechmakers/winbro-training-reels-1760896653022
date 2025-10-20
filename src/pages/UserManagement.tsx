/**
 * User Management Page
 * Comprehensive user management with modern design patterns
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Shield, 
  Building, 
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  UserPlus
} from 'lucide-react';
import { useUsers, useUserRoles, useBulkUpdateUsers } from '@/hooks/useUserManagement';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  company: string;
  department: string;
  job_title: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  primary_role: {
    role_name: string;
    display_name: string;
    is_admin: boolean;
  };
  created_at: string;
  last_login: string;
  avatar_url?: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  limit: number;
  offset: number;
}

// =====================================================
// USER CARD COMPONENT
// =====================================================

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: string, selected: boolean) => void;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
}

function UserCard({ user, isSelected, onSelect, onEdit, onView }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (isAdmin: boolean) => {
    return isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={cn(
        "card card-hover transition-all duration-300",
        isSelected && "ring-2 ring-accent-blue bg-accent-blue/5"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(user.user_id, checked as boolean)}
                className="mt-1"
              />
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-lg">
                  {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-primary-text truncate">
                    {user.full_name}
                  </h3>
                  <Badge className={cn("text-xs", getStatusColor(user.status))}>
                    {user.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-secondary-text mb-2 truncate">
                  {user.email}
                </p>
                <div className="flex items-center space-x-4 text-sm text-secondary-text mb-3">
                  {user.company && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span className="truncate">{user.company}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="truncate">{user.department}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={cn("text-xs", getRoleColor(user.primary_role.is_admin))}>
                    {user.primary_role.display_name}
                  </Badge>
                  <span className="text-xs text-secondary-text">
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(user)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =====================================================
// USER STATS COMPONENT
// =====================================================

interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  pendingUsers: number;
}

function UserStats({ totalUsers, activeUsers, adminUsers, pendingUsers }: UserStatsProps) {
  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Administrators',
      value: adminUsers,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Pending Verification',
      value: pendingUsers,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary-text">{stat.value}</p>
                  <p className="text-secondary-text text-sm">{stat.label}</p>
                </div>
                <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// =====================================================
// MAIN USER MANAGEMENT COMPONENT
// =====================================================

export default function UserManagement() {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    limit: 20,
    offset: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [_showBulkActions, setShowBulkActions] = useState(false);
  const [_editingUser, setEditingUser] = useState<User | null>(null);
  const [_viewingUser, setViewingUser] = useState<User | null>(null);

  // Hooks
  const { data: usersData, isLoading, error } = useUsers(filters);
  const { data: rolesData } = useUserRoles();
  // const updateUserRoleMutation = useUpdateUserRole();
  // const updateUserStatusMutation = useUpdateUserStatus();
  const bulkUpdateUsersMutation = useBulkUpdateUsers();

  const users = usersData || [];
  const roles = rolesData || [];

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.primary_role.is_admin).length;
  const pendingUsers = users.filter(u => u.status === 'pending_verification').length;

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, offset: 0 }));
  };

  const handleRoleFilter = (value: string) => {
    setFilters(prev => ({ ...prev, role: value, offset: 0 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, offset: 0 }));
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(u => u.user_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'suspend', roleId?: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const updates: { status?: string; role_id?: string } = {};
      
      if (action === 'activate') updates.status = 'active';
      if (action === 'deactivate') updates.status = 'inactive';
      if (action === 'suspend') updates.status = 'suspended';
      if (roleId) updates.role_id = roleId;

      await bulkUpdateUsersMutation.mutateAsync({
        userIds: selectedUsers,
        updates
      });

      toast.success(`${selectedUsers.length} users updated successfully`);
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      toast.error('Failed to update users');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
  };

  const handleRefresh = () => {
    // Refresh data
    window.location.reload();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Card className="card max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-text mb-2">Error Loading Users</h3>
            <p className="text-secondary-text mb-4">
              There was an error loading the user data.
            </p>
            <Button onClick={handleRefresh} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-text mb-2">User Management</h1>
              <p className="text-secondary-text">Manage users, roles, and permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button className="btn-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <UserStats
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          adminUsers={adminUsers}
          pendingUsers={pendingUsers}
        />

        {/* Filters and Search */}
        <Card className="card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    placeholder="Search users by name, email, or company..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={filters.role} onValueChange={handleRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending_verification">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="card border-accent-blue">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-primary-text">
                      {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleBulkAction('activate')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('deactivate')}
                      >
                        Deactivate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('suspend')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedUsers([])}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Users List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : users.length > 0 ? (
            <>
              {/* Select All */}
              <Card className="card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedUsers.length === users.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium text-primary-text">
                      Select All ({users.length} users)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* User Cards */}
              {users.map((user) => (
                <UserCard
                  key={user.user_id}
                  user={user}
                  isSelected={selectedUsers.includes(user.user_id)}
                  onSelect={handleSelectUser}
                  onEdit={handleEditUser}
                  onView={handleViewUser}
                />
              ))}
            </>
          ) : (
            <Card className="card">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary-text mb-2">No Users Found</h3>
                <p className="text-secondary-text mb-6">
                  {filters.search || filters.role || filters.status
                    ? 'Try adjusting your search filters'
                    : 'Get started by inviting your first user'
                  }
                </p>
                <Button className="btn-primary">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
