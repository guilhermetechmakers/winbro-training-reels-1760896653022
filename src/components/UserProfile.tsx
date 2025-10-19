import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Edit3,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Shield,
  Users,
  Activity,
  Smartphone,
  Monitor,
  Trash2,
  LogOut,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateUserProfile } from '@/hooks/useAuth';
import { 
  useChangePassword,
  useSetupTwoFactor,
  useVerifyTwoFactor,
  useDisableTwoFactor,
  useUserSessions,
  useRevokeSession,
  useRevokeAllOtherSessions,
  useUserSubscription,
  useRequestSeats,
  useActivityLog
} from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import type { ProfileUpdateForm } from '@/types/auth';
import type { ChangePasswordForm, TwoFactorVerification, SeatRequest } from '@/types/sessions';

// Validation schemas
const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  displayName: z
    .string()
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  company: z
    .string()
    .min(1, 'Company is required')
    .min(2, 'Company must be at least 2 characters'),
  department: z
    .string()
    .optional(),
  jobTitle: z
    .string()
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .min(1, 'Timezone is required'),
  language: z
    .string()
    .min(1, 'Language is required'),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  themePreference: z.enum(['light', 'dark', 'system']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const twoFactorSchema = z.object({
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
  backupCode: z.string().optional(),
}).refine((data) => data.code || data.backupCode, {
  message: "Either verification code or backup code is required",
});

const seatRequestSchema = z.object({
  requested_seats: z.number().min(1, 'Must request at least 1 seat'),
  reason: z.string().min(10, 'Please provide a reason for the request'),
});

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showSeatRequest, setShowSeatRequest] = useState(false);
  
  // Mutations
  const updateProfileMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();
  const setupTwoFactorMutation = useSetupTwoFactor();
  const verifyTwoFactorMutation = useVerifyTwoFactor();
  const disableTwoFactorMutation = useDisableTwoFactor();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllOtherSessions();
  const requestSeatsMutation = useRequestSeats();
  
  // Queries
  const { data: sessionsData, isLoading: sessionsLoading } = useUserSessions(user?.id || '');
  const { data: subscriptionData, isLoading: subscriptionLoading } = useUserSubscription(user?.id || '');
  const { data: activityData, isLoading: activityLoading } = useActivityLog(user?.id || '');

  // Profile form
  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.profile?.full_name || '',
      displayName: user?.profile?.display_name || '',
      bio: user?.profile?.bio || '',
      company: user?.profile?.company || '',
      department: user?.profile?.department || '',
      jobTitle: user?.profile?.job_title || '',
      phone: user?.profile?.phone || '',
      timezone: user?.profile?.timezone || 'UTC',
      language: user?.profile?.language || 'en',
      emailNotifications: user?.profile?.email_notifications ?? true,
      pushNotifications: user?.profile?.push_notifications ?? true,
      marketingEmails: user?.profile?.marketing_emails ?? false,
      themePreference: user?.profile?.theme_preference || 'system',
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Two-factor form
  const twoFactorForm = useForm<TwoFactorVerification>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
      backupCode: '',
    },
  });

  // Seat request form
  const seatRequestForm = useForm<SeatRequest>({
    resolver: zodResolver(seatRequestSchema),
    defaultValues: {
      requested_seats: 1,
      reason: '',
    },
  });

  // Form submission handlers
  const onProfileSubmit = async (data: ProfileUpdateForm) => {
    try {
      await updateProfileMutation.mutateAsync({
        full_name: data.fullName,
        display_name: data.displayName || null,
        bio: data.bio || null,
        company: data.company,
        department: data.department || null,
        job_title: data.jobTitle || null,
        phone: data.phone || null,
        timezone: data.timezone,
        language: data.language,
        email_notifications: data.emailNotifications,
        push_notifications: data.pushNotifications,
        marketing_emails: data.marketingEmails,
        theme_preference: data.themePreference,
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const onTwoFactorSetup = async () => {
    try {
      await setupTwoFactorMutation.mutateAsync();
      setShowTwoFactorSetup(true);
      toast.success('Two-factor authentication setup initiated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to setup 2FA');
    }
  };

  const onTwoFactorVerify = async (data: TwoFactorVerification) => {
    try {
      await verifyTwoFactorMutation.mutateAsync(data);
      toast.success('Two-factor authentication enabled!');
      setShowTwoFactorSetup(false);
      twoFactorForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify 2FA');
    }
  };

  const onDisableTwoFactor = async () => {
    try {
      await disableTwoFactorMutation.mutateAsync();
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable 2FA');
    }
  };

  const onSeatRequest = async (data: SeatRequest) => {
    try {
      await requestSeatsMutation.mutateAsync(data);
      toast.success('Seat request submitted successfully!');
      setShowSeatRequest(false);
      seatRequestForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit seat request');
    }
  };

  const handleCancel = () => {
    profileForm.reset();
    setIsEditing(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllSessionsMutation.mutateAsync();
      toast.success('All other sessions revoked successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke sessions');
    }
  };

  const handleAvatarUpload = async (_file: File) => {
    setIsUploading(true);
    try {
      // TODO: Implement avatar upload to Supabase Storage
      toast.info('Avatar upload coming soon!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Utility functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const getDeviceIcon = (device: string) => {
    return device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  };

  const formatLastActivity = (lastActivity: string) => {
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activity.toLocaleDateString();
  };

  const formatLocation = (location: any) => {
    if (!location) return 'Unknown';
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    return parts.join(', ') || 'Unknown location';
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Profile Settings</h1>
          <p className="text-secondary-text mt-1">
            Manage your account settings, security, and preferences
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Overview Card */}
      <Card className="card">
        <CardHeader className="text-center">
          <div className="relative inline-block">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={user?.profile?.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.profile?.full_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </div>
          <CardTitle className="text-xl">
            {user?.profile?.display_name || user?.profile?.full_name || 'User'}
          </CardTitle>
          <CardDescription>
            {user?.profile?.job_title && user?.profile?.department
              ? `${user.profile.job_title} at ${user.profile.department}`
              : user?.profile?.company || 'No company specified'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-text">Status</span>
            <Badge className={getStatusColor(user?.profile?.status || 'active')}>
              {user?.profile?.status || 'active'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-text">Role</span>
            <Badge variant="outline">
              {user?.primary_role?.role_name || 'learner'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-text">Email Verified</span>
            {user?.profile?.email_verified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-text">2FA Enabled</span>
            {user?.profile?.two_factor_enabled ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary-text">Personal Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        {...profileForm.register('fullName')}
                        disabled={!isEditing}
                        className={profileForm.formState.errors.fullName ? 'border-red-500' : ''}
                      />
                      {profileForm.formState.errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        {...profileForm.register('displayName')}
                        disabled={!isEditing}
                        placeholder="How you'd like to be addressed"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...profileForm.register('bio')}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.bio.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary-text">Professional Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        {...profileForm.register('company')}
                        disabled={!isEditing}
                        className={profileForm.formState.errors.company ? 'border-red-500' : ''}
                      />
                      {profileForm.formState.errors.company && (
                        <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.company.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        {...profileForm.register('department')}
                        disabled={!isEditing}
                        placeholder="e.g., Engineering, Sales"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        {...profileForm.register('jobTitle')}
                        disabled={!isEditing}
                        placeholder="e.g., Software Engineer, Manager"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...profileForm.register('phone')}
                        disabled={!isEditing}
                        placeholder="+1 (555) 123-4567"
                        className={profileForm.formState.errors.phone ? 'border-red-500' : ''}
                      />
                      {profileForm.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary-text">Preferences</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={profileForm.watch('timezone')}
                        onValueChange={(value: string) => profileForm.setValue('timezone', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={profileForm.watch('language')}
                        onValueChange={(value: string) => profileForm.setValue('language', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="themePreference">Theme Preference</Label>
                    <Select
                      value={profileForm.watch('themePreference')}
                      onValueChange={(value: string) => profileForm.setValue('themePreference', value as 'light' | 'dark' | 'system')}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary-text">Notification Preferences</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-secondary-text">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={profileForm.watch('emailNotifications')}
                        onCheckedChange={(checked: boolean) => profileForm.setValue('emailNotifications', checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-secondary-text">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={profileForm.watch('pushNotifications')}
                        onCheckedChange={(checked: boolean) => profileForm.setValue('pushNotifications', checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                        <p className="text-sm text-secondary-text">
                          Receive product updates and marketing communications
                        </p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={profileForm.watch('marketingEmails')}
                        onCheckedChange={(checked: boolean) => profileForm.setValue('marketingEmails', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={profileForm.formState.isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={profileForm.formState.isSubmitting || updateProfileMutation.isPending}
                    >
                      {profileForm.formState.isSubmitting || updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Management */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Management
                </CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register('currentPassword')}
                      className={passwordForm.formState.errors.currentPassword ? 'border-red-500' : ''}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword')}
                      className={passwordForm.formState.errors.newPassword ? 'border-red-500' : ''}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                      className={passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting || changePasswordMutation.isPending}
                    className="w-full"
                  >
                    {passwordForm.formState.isSubmitting || changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-secondary-text">
                      {user?.profile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  {user?.profile?.two_factor_enabled ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>

                {!user?.profile?.two_factor_enabled ? (
                  <Button
                    onClick={onTwoFactorSetup}
                    disabled={setupTwoFactorMutation.isPending}
                    className="w-full"
                  >
                    {setupTwoFactorMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Enable 2FA
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={onDisableTwoFactor}
                    disabled={disableTwoFactorMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {disableTwoFactorMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Disable 2FA
                      </>
                    )}
                  </Button>
                )}

                {showTwoFactorSetup && setupTwoFactorMutation.data && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="font-medium mb-2">Scan this QR code with your authenticator app</p>
                      <div className="flex justify-center">
                        <img src={setupTwoFactorMutation.data.setup.qrCode} alt="2FA QR Code" className="w-32 h-32" />
                      </div>
                    </div>
                    
                    <form onSubmit={twoFactorForm.handleSubmit(onTwoFactorVerify)} className="space-y-4">
                      <div>
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                          id="code"
                          {...twoFactorForm.register('code')}
                          placeholder="Enter 6-digit code"
                          className={twoFactorForm.formState.errors.code ? 'border-red-500' : ''}
                        />
                        {twoFactorForm.formState.errors.code && (
                          <p className="text-red-500 text-sm mt-1">{twoFactorForm.formState.errors.code.message}</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowTwoFactorSetup(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={twoFactorForm.formState.isSubmitting || verifyTwoFactorMutation.isPending}
                          className="flex-1"
                        >
                          {twoFactorForm.formState.isSubmitting || verifyTwoFactorMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify & Enable'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subscription & Seats
              </CardTitle>
              <CardDescription>
                Manage your subscription and seat allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : subscriptionData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-text">{subscriptionData.subscription.seats_allocated}</p>
                      <p className="text-sm text-secondary-text">Total Seats</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-text">{subscriptionData.subscription.seats_used}</p>
                      <p className="text-sm text-secondary-text">Used Seats</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-text">{subscriptionData.subscription.seats_available}</p>
                      <p className="text-sm text-secondary-text">Available Seats</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-secondary-text">{subscriptionData.subscription.plan_name}</p>
                      </div>
                      <Badge className={subscriptionData.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {subscriptionData.subscription.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Billing Cycle</p>
                        <p className="text-sm text-secondary-text capitalize">{subscriptionData.subscription.billing_cycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Next Billing Date</p>
                        <p className="text-sm text-secondary-text">
                          {new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {subscriptionData.can_request_seats && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setShowSeatRequest(true)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Request Additional Seats
                      </Button>
                    </div>
                  )}

                  {showSeatRequest && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <form onSubmit={seatRequestForm.handleSubmit(onSeatRequest)} className="space-y-4">
                        <div>
                          <Label htmlFor="requested_seats">Number of Additional Seats</Label>
                          <Input
                            id="requested_seats"
                            type="number"
                            min="1"
                            max={subscriptionData.max_seats_requestable}
                            {...seatRequestForm.register('requested_seats', { valueAsNumber: true })}
                            className={seatRequestForm.formState.errors.requested_seats ? 'border-red-500' : ''}
                          />
                          {seatRequestForm.formState.errors.requested_seats && (
                            <p className="text-red-500 text-sm mt-1">{seatRequestForm.formState.errors.requested_seats.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="reason">Reason for Request</Label>
                          <Textarea
                            id="reason"
                            {...seatRequestForm.register('reason')}
                            placeholder="Please explain why you need additional seats..."
                            className={seatRequestForm.formState.errors.reason ? 'border-red-500' : ''}
                          />
                          {seatRequestForm.formState.errors.reason && (
                            <p className="text-red-500 text-sm mt-1">{seatRequestForm.formState.errors.reason.message}</p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowSeatRequest(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={seatRequestForm.formState.isSubmitting || requestSeatsMutation.isPending}
                            className="flex-1"
                          >
                            {seatRequestForm.formState.isSubmitting || requestSeatsMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Request'
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Unable to load subscription information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : sessionsData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-text">
                      {sessionsData.active_count} of {sessionsData.total} sessions active
                    </p>
                    <Button
                      onClick={handleRevokeAllSessions}
                      disabled={revokeAllSessionsMutation.isPending}
                      variant="outline"
                      size="sm"
                    >
                      {revokeAllSessionsMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Revoking...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          Revoke All Others
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {sessionsData.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(session.device_info.device || 'Desktop')}
                          <div>
                            <p className="font-medium">
                              {session.device_info.browser} on {session.device_info.os}
                            </p>
                            <p className="text-sm text-secondary-text">
                              {formatLocation(session.location)} • {formatLastActivity(session.last_activity)}
                            </p>
                            {session.ip_address && (
                              <p className="text-xs text-gray-400">IP: {session.ip_address}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.is_active && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {session.is_active && (
                            <Button
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={revokeSessionMutation.isPending}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Unable to load session information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>
                View your recent account activity and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : activityData ? (
                <div className="space-y-3">
                  {activityData.entries.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium capitalize">
                            {entry.action.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-secondary-text">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-secondary-text">
                          {entry.resource_type} • {entry.ip_address}
                        </p>
                        {entry.details && Object.keys(entry.details).length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {JSON.stringify(entry.details, null, 2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Unable to load activity log</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
