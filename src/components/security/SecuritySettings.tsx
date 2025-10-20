/**
 * Security Settings Component
 * Manage security policies, configurations, and compliance settings
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  CheckCircle, 
  XCircle,
  Save,
  RotateCcw,
  Download,
  Upload,
  Key,
  FileText,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { securityConfig } from '@/settings/securityConfig';
import type { SecurityPolicy, SecuritySettings as SecuritySettingsType } from '@/settings/securityConfig';

interface SecuritySettingsComponentProps {
  className?: string;
}

export const SecuritySettings: React.FC<SecuritySettingsComponentProps> = ({ className }) => {
  const [settings, setSettings] = useState<SecuritySettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('policies');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = securityConfig.getSettings();
      setSettings(currentSettings);
    } catch (err) {
      setError('Failed to load security settings');
      console.error('Security settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      
      const validation = securityConfig.validateConfiguration();
      if (!validation.isValid) {
        setError(`Configuration validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      await securityConfig.updateSettings(settings);
      setSuccess('Security settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save security settings');
      console.error('Save settings error:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setError(null);
      await securityConfig.resetToDefaults();
      await loadSettings();
      setSuccess('Settings reset to defaults');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to reset settings');
      console.error('Reset settings error:', err);
    }
  };

  const exportConfiguration = () => {
    if (!settings) return;
    
    const configJson = securityConfig.exportConfiguration();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'winbro-security-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const configJson = e.target?.result as string;
        const result = await securityConfig.importConfiguration(configJson);
        
        if (result.success) {
          await loadSettings();
          setSuccess('Configuration imported successfully');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(`Import failed: ${result.errors.join(', ')}`);
        }
      } catch (err) {
        setError('Failed to import configuration');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  };

  const updatePolicy = (policyName: string, updates: Partial<SecurityPolicy>) => {
    if (!settings) return;

    const updatedPolicies = settings.policies.map(policy =>
      policy.name === policyName ? { ...policy, ...updates } : policy
    );

    setSettings({
      ...settings,
      policies: updatedPolicies
    });
  };

  const updateEncryptionConfig = (updates: Partial<SecuritySettingsType['encryption']>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      encryption: { ...settings.encryption, ...updates }
    });
  };

  const updateAuditConfig = (updates: Partial<SecuritySettingsType['audit']>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      audit: { ...settings.audit, ...updates }
    });
  };

  const updateRateLimitConfig = (updates: Partial<SecuritySettingsType['rateLimit']>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      rateLimit: { ...settings.rateLimit, ...updates }
    });
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load security settings</p>
            <Button onClick={loadSettings} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-muted-foreground">
            Configure security policies, encryption, and compliance settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportConfiguration} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="import-config">
            <Button asChild variant="outline" size="sm">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="import-config"
            type="file"
            accept=".json"
            onChange={importConfiguration}
            className="hidden"
          />
          <Button onClick={resetToDefaults} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-4 w-4 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="audit">Audit & Logging</TabsTrigger>
          <TabsTrigger value="rate-limit">Rate Limiting</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="space-y-4">
            {settings.policies.map((policy: SecurityPolicy, index: number) => (
              <motion.div
                key={policy.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-lg">{policy.name}</CardTitle>
                          <CardDescription>{policy.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                          {policy.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge variant={
                          policy.severity === 'critical' ? 'destructive' :
                          policy.severity === 'high' ? 'destructive' :
                          policy.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {policy.severity}
                        </Badge>
                        <Switch
                          checked={policy.enabled}
                          onCheckedChange={(enabled) => updatePolicy(policy.name, { enabled })}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {policy.rules.map((rule: any) => (
                        <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {rule.enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="font-medium">{rule.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {rule.description}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={rule.action === 'block' ? 'destructive' : 'default'}>
                              {rule.action}
                            </Badge>
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={(enabled) => {
                                const updatedRules = policy.rules.map((r: any) =>
                                  r.id === rule.id ? { ...r, enabled } : r
                                );
                                updatePolicy(policy.name, { rules: updatedRules });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Encryption Configuration
              </CardTitle>
              <CardDescription>
                Configure data encryption settings and key management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="encryption-algorithm">Algorithm</Label>
                  <Input
                    id="encryption-algorithm"
                    value={settings.encryption.algorithm}
                    onChange={(e) => updateEncryptionConfig({ algorithm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-length">Key Length (bits)</Label>
                  <Input
                    id="key-length"
                    type="number"
                    value={settings.encryption.keyLength}
                    onChange={(e) => updateEncryptionConfig({ keyLength: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iv-length">IV Length (bits)</Label>
                  <Input
                    id="iv-length"
                    type="number"
                    value={settings.encryption.ivLength}
                    onChange={(e) => updateEncryptionConfig({ ivLength: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-rotation">Key Rotation (days)</Label>
                  <Input
                    id="key-rotation"
                    type="number"
                    value={settings.encryption.keyRotationDays}
                    onChange={(e) => updateEncryptionConfig({ keyRotationDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-prefix">Customer Key Prefix</Label>
                <Input
                  id="key-prefix"
                  value={settings.encryption.customerKeyPrefix}
                  onChange={(e) => updateEncryptionConfig({ customerKeyPrefix: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Audit & Logging Configuration
              </CardTitle>
              <CardDescription>
                Configure audit logging and data retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all system activities and user actions
                  </p>
                </div>
                <Switch
                  checked={settings.audit.enabled}
                  onCheckedChange={(enabled) => updateAuditConfig({ enabled })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={settings.audit.retentionDays}
                    onChange={(e) => updateAuditConfig({ retentionDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select
                    value={settings.audit.logLevel}
                    onValueChange={(value: any) => updateAuditConfig({ logLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warn</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sensitive Fields</Label>
                <Textarea
                  value={settings.audit.sensitiveFields.join(', ')}
                  onChange={(e) => updateAuditConfig({ 
                    sensitiveFields: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                  })}
                  placeholder="password, token, secret, key, ssn, creditCard"
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of fields to mask in logs
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Rate Limiting Configuration
              </CardTitle>
              <CardDescription>
                Configure rate limiting and brute force protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Protect against brute force attacks and abuse
                  </p>
                </div>
                <Switch
                  checked={settings.rateLimit.enabled}
                  onCheckedChange={(enabled) => updateRateLimitConfig({ enabled })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="window-ms">Window (milliseconds)</Label>
                  <Input
                    id="window-ms"
                    type="number"
                    value={settings.rateLimit.windowMs}
                    onChange={(e) => updateRateLimitConfig({ windowMs: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={settings.rateLimit.maxAttempts}
                    onChange={(e) => updateRateLimitConfig({ maxAttempts: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (ms)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={settings.rateLimit.lockoutDurationMs}
                    onChange={(e) => updateRateLimitConfig({ lockoutDurationMs: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Whitelist IPs</Label>
                <Textarea
                  value={settings.rateLimit.whitelist.join('\n')}
                  onChange={(e) => updateRateLimitConfig({ 
                    whitelist: e.target.value.split('\n').map(ip => ip.trim()).filter(Boolean)
                  })}
                  placeholder="192.168.1.1&#10;10.0.0.1"
                />
                <p className="text-sm text-muted-foreground">
                  One IP address per line
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Compliance Configuration
              </CardTitle>
              <CardDescription>
                Configure compliance standards and reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Compliance Monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor compliance with security standards
                  </p>
                </div>
                <Switch
                  checked={settings.compliance.enabled}
                  onCheckedChange={(enabled) => setSettings({
                    ...settings,
                    compliance: { ...settings.compliance, enabled }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Compliance Standards</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.compliance.standards.map((standard: string) => (
                    <Badge key={standard} variant="outline">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporting-interval">Reporting Interval</Label>
                <Select
                  value={settings.compliance.reportingInterval}
                  onValueChange={(value: any) => setSettings({
                    ...settings,
                    compliance: { ...settings.compliance, reportingInterval: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Data Retention Policies</Label>
                <div className="space-y-3">
                  {settings.compliance.retentionPolicies.map((policy: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{policy.dataType}</p>
                        <p className="text-sm text-muted-foreground">
                          Retention: {policy.retentionDays} days
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                          {policy.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={policy.enabled}
                          onCheckedChange={(enabled) => {
                            const updatedPolicies = settings.compliance.retentionPolicies.map((p: any, i: number) =>
                              i === index ? { ...p, enabled } : p
                            );
                            setSettings({
                              ...settings,
                              compliance: { ...settings.compliance, retentionPolicies: updatedPolicies }
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};