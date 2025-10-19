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
import { 
  Mail, 
  Building, 
  Phone, 
  Globe, 
  Save, 
  Edit3,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateUserProfile } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { ProfileUpdateForm } from '@/types/auth';

// Validation schema
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

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const updateProfileMutation = useUpdateUserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProfileUpdateForm>({
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

  const onSubmit = async (data: ProfileUpdateForm) => {
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

  const handleCancel = () => {
    reset();
    setIsEditing(false);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Profile Settings</h1>
          <p className="text-secondary-text mt-1">
            Manage your account settings and preferences
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
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

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-primary-text">Account Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-secondary-text" />
                    <span className="text-secondary-text">{user?.email}</span>
                  </div>
                  {user?.profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-secondary-text" />
                      <span className="text-secondary-text">{user.profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-secondary-text" />
                    <span className="text-secondary-text">{user?.profile?.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-secondary-text" />
                    <span className="text-secondary-text">{user?.profile?.timezone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-primary-text">Personal Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        {...register('fullName')}
                        disabled={!isEditing}
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        {...register('displayName')}
                        disabled={!isEditing}
                        placeholder="How you'd like to be addressed"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      {...register('bio')}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent disabled:bg-gray-50"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
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
                        {...register('company')}
                        disabled={!isEditing}
                        className={errors.company ? 'border-red-500' : ''}
                      />
                      {errors.company && (
                        <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        {...register('department')}
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
                        {...register('jobTitle')}
                        disabled={!isEditing}
                        placeholder="e.g., Software Engineer, Manager"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        disabled={!isEditing}
                        placeholder="+1 (555) 123-4567"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
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
                        value={watch('timezone')}
                        onValueChange={(value: string) => setValue('timezone', value)}
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
                        value={watch('language')}
                        onValueChange={(value: string) => setValue('language', value)}
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
                      value={watch('themePreference')}
                      onValueChange={(value: string) => setValue('themePreference', value as 'light' | 'dark' | 'system')}
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
                        checked={watch('emailNotifications')}
                        onCheckedChange={(checked: boolean) => setValue('emailNotifications', checked)}
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
                        checked={watch('pushNotifications')}
                        onCheckedChange={(checked: boolean) => setValue('pushNotifications', checked)}
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
                        checked={watch('marketingEmails')}
                        onCheckedChange={(checked: boolean) => setValue('marketingEmails', checked)}
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
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || updateProfileMutation.isPending}
                    >
                      {isSubmitting || updateProfileMutation.isPending ? (
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
        </div>
      </div>
    </div>
  );
}
