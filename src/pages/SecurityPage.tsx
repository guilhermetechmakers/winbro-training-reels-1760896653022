/**
 * Security Page
 * Main security management page with dashboard, settings, and monitoring
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Settings, 
  Activity, 
  Search,
  FileText,
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { SecuritySettings } from '@/components/security/SecuritySettings';
import { VulnerabilityDashboard } from '@/components/security/VulnerabilityDashboard';

export const SecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const securityTabs = [
    {
      id: 'dashboard',
      label: 'Security Dashboard',
      icon: Shield,
      description: 'Overview of security metrics and events'
    },
    {
      id: 'vulnerabilities',
      label: 'Vulnerabilities',
      icon: Search,
      description: 'Vulnerability scanning and management'
    },
    {
      id: 'settings',
      label: 'Security Settings',
      icon: Settings,
      description: 'Configure security policies and compliance'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Security Center</h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive security management and monitoring
              </p>
            </div>
          </div>

          {/* Security Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Security Status: Good</p>
                    <p className="text-sm text-green-700">
                      All security systems are operational and up to date
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Activity className="h-3 w-3 mr-1" />
                    Monitoring Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              {securityTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="vulnerabilities" className="space-y-6">
              <VulnerabilityDashboard />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Security Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                Security Features
              </CardTitle>
              <CardDescription>
                Comprehensive security capabilities protecting your Winbro Training Reels platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Data Encryption</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AES-256 encryption for data at rest and TLS 1.3 for data in transit
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Real-time Monitoring</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    24/7 security monitoring with automated threat detection and alerting
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Vulnerability Scanning</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automated scanning for dependencies, code, and infrastructure vulnerabilities
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Secrets Management</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure storage and rotation of API keys, passwords, and certificates
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold">Audit Logging</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive audit trails for compliance and security investigations
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold">Compliance</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    SOC2, GDPR, and other compliance frameworks with automated reporting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};