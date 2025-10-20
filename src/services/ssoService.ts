/**
 * SSO and SCIM Service for Winbro Training Reels
 * Handles Single Sign-On and SCIM provisioning for enterprise customers
 */

import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/security';
// import type { Database } from '@/lib/supabase';

// Database types - these tables don't exist yet
// type SSOProvider = any;
// type SCIMConfig = any;

export interface SSOProviderConfig {
  name: string;
  displayName: string;
  providerType: 'saml' | 'oidc' | 'oauth2';
  enabled: boolean;
  config: {
    entityId?: string;
    ssoUrl?: string;
    x509Certificate?: string;
    clientId?: string;
    clientSecret?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scope?: string[];
    attributeMapping?: Record<string, string>;
  };
  customerId?: string;
}

export interface SCIMConfiguration {
  customerId: string;
  enabled: boolean;
  endpoint: string;
  bearerToken: string;
  userMapping: Record<string, string>;
  groupMapping: Record<string, string>;
  autoProvision: boolean;
  autoDeprovision: boolean;
}

export interface SSOUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  groups: string[];
  attributes: Record<string, any>;
}

export interface SCIMUser {
  id: string;
  userName: string;
  emails: Array<{ value: string; primary: boolean }>;
  name: {
    givenName: string;
    familyName: string;
    formatted: string;
  };
  groups: Array<{ value: string; display: string }>;
  active: boolean;
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
  };
}

export class SSOService {
  private static instance: SSOService;
  private ssoProviders = new Map<string, SSOProviderConfig>();
  private scimConfigs = new Map<string, SCIMConfiguration>();

  private constructor() {
    this.loadConfigurations();
  }

  public static getInstance(): SSOService {
    if (!SSOService.instance) {
      SSOService.instance = new SSOService();
    }
    return SSOService.instance;
  }

  /**
   * Load SSO and SCIM configurations
   */
  private async loadConfigurations(): Promise<void> {
    try {
      // Load SSO providers
      const { data: providers, error: providersError } = await supabase
        .from('sso_providers')
        .select('*')
        .eq('enabled', true);

      if (providersError) {
        console.error('Failed to load SSO providers:', providersError);
        return;
      }

      providers?.forEach(provider => {
        this.ssoProviders.set(provider.id, {
          name: provider.name,
          displayName: provider.display_name,
          providerType: provider.provider_type as 'saml' | 'oidc' | 'oauth2',
          enabled: provider.enabled,
          config: provider.config as any,
          customerId: provider.customer_id || undefined
        });
      });

      // Load SCIM configurations
      const { data: scimConfigs, error: scimError } = await supabase
        .from('scim_configs')
        .select('*')
        .eq('enabled', true);

      if (scimError) {
        console.error('Failed to load SCIM configs:', scimError);
        return;
      }

      scimConfigs?.forEach(config => {
        this.scimConfigs.set(config.customer_id, {
          customerId: config.customer_id,
          enabled: config.enabled,
          endpoint: config.endpoint,
          bearerToken: config.bearer_token,
          userMapping: config.user_mapping as Record<string, string>,
          groupMapping: config.group_mapping as Record<string, string>,
          autoProvision: config.auto_provision,
          autoDeprovision: config.auto_deprovision
        });
      });
    } catch (error) {
      console.error('Failed to load configurations:', error);
    }
  }

  /**
   * Get available SSO providers for customer
   */
  public getSSOProviders(customerId?: string): SSOProviderConfig[] {
    return Array.from(this.ssoProviders.values()).filter(provider => 
      !provider.customerId || provider.customerId === customerId
    );
  }

  /**
   * Get SSO provider by ID
   */
  public getSSOProvider(providerId: string): SSOProviderConfig | null {
    return this.ssoProviders.get(providerId) || null;
  }

  /**
   * Create SSO provider
   */
  public async createSSOProvider(config: SSOProviderConfig): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sso_providers')
        .insert({
          name: config.name,
          display_name: config.displayName,
          provider_type: config.providerType,
          enabled: config.enabled,
          config: config.config,
          customer_id: config.customerId || null
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create SSO provider:', error);
        throw error;
      }

      // Reload configurations
      await this.loadConfigurations();

      return data.id;
    } catch (error) {
      console.error('Create SSO provider failed:', error);
      throw error;
    }
  }

  /**
   * Update SSO provider
   */
  public async updateSSOProvider(providerId: string, config: Partial<SSOProviderConfig>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (config.name) updateData.name = config.name;
      if (config.displayName) updateData.display_name = config.displayName;
      if (config.providerType) updateData.provider_type = config.providerType;
      if (config.enabled !== undefined) updateData.enabled = config.enabled;
      if (config.config) updateData.config = config.config;
      if (config.customerId !== undefined) updateData.customer_id = config.customerId;

      const { error } = await supabase
        .from('sso_providers')
        .update(updateData)
        .eq('id', providerId);

      if (error) {
        console.error('Failed to update SSO provider:', error);
        throw error;
      }

      // Reload configurations
      await this.loadConfigurations();
    } catch (error) {
      console.error('Update SSO provider failed:', error);
      throw error;
    }
  }

  /**
   * Delete SSO provider
   */
  public async deleteSSOProvider(providerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sso_providers')
        .delete()
        .eq('id', providerId);

      if (error) {
        console.error('Failed to delete SSO provider:', error);
        throw error;
      }

      // Reload configurations
      await this.loadConfigurations();
    } catch (error) {
      console.error('Delete SSO provider failed:', error);
      throw error;
    }
  }

  /**
   * Generate SAML SSO URL
   */
  public generateSAMLSSOUrl(providerId: string, relayState?: string): string {
    const provider = this.getSSOProvider(providerId);
    if (!provider || provider.providerType !== 'saml') {
      throw new Error('Invalid SAML provider');
    }

    const config = provider.config;
    if (!config.ssoUrl || !config.entityId) {
      throw new Error('SAML configuration incomplete');
    }

    // In a real implementation, you would generate a proper SAML request
    // For now, we'll return a placeholder URL
    const samlRequest = btoa(`<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" 
      ID="${generateToken()}" 
      Version="2.0" 
      IssueInstant="${new Date().toISOString()}" 
      Destination="${config.ssoUrl}">
      <saml:Issuer>${config.entityId}</saml:Issuer>
    </samlp:AuthnRequest>`);

    const params = new URLSearchParams({
      SAMLRequest: samlRequest,
      ...(relayState && { RelayState: relayState })
    });

    return `${config.ssoUrl}?${params.toString()}`;
  }

  /**
   * Generate OIDC/OAuth2 SSO URL
   */
  public generateOIDCSSOUrl(providerId: string, state?: string): string {
    const provider = this.getSSOProvider(providerId);
    if (!provider || (provider.providerType !== 'oidc' && provider.providerType !== 'oauth2')) {
      throw new Error('Invalid OIDC/OAuth2 provider');
    }

    const config = provider.config;
    if (!config.authorizationUrl || !config.clientId) {
      throw new Error('OIDC/OAuth2 configuration incomplete');
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: `${window.location.origin}/auth/sso/callback`,
      scope: (config.scope || ['openid', 'email', 'profile']).join(' '),
      ...(state && { state }),
      ...(config.scope?.includes('openid') && { nonce: generateToken() })
    });

    return `${config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Process SSO callback
   */
  public async processSSOCallback(
    providerId: string,
    code: string,
    _state?: string
  ): Promise<{ user: SSOUser; isNewUser: boolean }> {
    const provider = this.getSSOProvider(providerId);
    if (!provider) {
      throw new Error('SSO provider not found');
    }

    try {
      let ssoUser: SSOUser;

      if (provider.providerType === 'saml') {
        ssoUser = await this.processSAMLCallback(provider, code);
      } else {
        ssoUser = await this.processOIDCCallback(provider, code);
      }

      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', ssoUser.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      const isNewUser = !existingUser;

      if (isNewUser) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: ssoUser.email,
            full_name: ssoUser.displayName,
            role: 'learner', // Default role
            company: provider.customerId || 'Unknown',
            email_verified: true
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Auto-provision if SCIM is configured
        if (provider.customerId) {
          const scimConfig = this.scimConfigs.get(provider.customerId);
          if (scimConfig?.autoProvision) {
            await this.provisionUser(newUser.id, ssoUser, scimConfig);
          }
        }
      } else {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: ssoUser.displayName,
            email_verified: true
          })
          .eq('id', existingUser.id);

        if (updateError) {
          throw updateError;
        }
      }

      return { user: ssoUser, isNewUser };
    } catch (error) {
      console.error('SSO callback processing failed:', error);
      throw error;
    }
  }

  /**
   * Process SAML callback
   */
  private async processSAMLCallback(_provider: SSOProviderConfig, _samlResponse: string): Promise<SSOUser> {
    // In a real implementation, you would:
    // 1. Decode and validate the SAML response
    // 2. Verify the digital signature
    // 3. Extract user attributes
    
    // For now, we'll return a mock user
    return {
      id: generateToken(),
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      groups: [],
      attributes: {}
    };
  }

  /**
   * Process OIDC callback
   */
  private async processOIDCCallback(provider: SSOProviderConfig, code: string): Promise<SSOUser> {
    const config = provider.config;
    
    // Exchange code for token
    const tokenResponse = await fetch(config.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: `${window.location.origin}/auth/sso/callback`
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userInfoResponse = await fetch(config.userInfoUrl!, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();

    // Map attributes based on configuration
    const attributeMapping = config.attributeMapping || {};
    const email = userInfo[attributeMapping.email || 'email'];
    const firstName = userInfo[attributeMapping.firstName || 'given_name'];
    const lastName = userInfo[attributeMapping.lastName || 'family_name'];
    const groups = userInfo[attributeMapping.groups || 'groups'] || [];

    return {
      id: userInfo.sub || userInfo.id,
      email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      groups,
      attributes: userInfo
    };
  }

  /**
   * Configure SCIM for customer
   */
  public async configureSCIM(config: SCIMConfiguration): Promise<void> {
    try {
      const { error } = await supabase
        .from('scim_configs')
        .upsert({
          customer_id: config.customerId,
          enabled: config.enabled,
          endpoint: config.endpoint,
          bearer_token: config.bearerToken,
          user_mapping: config.userMapping,
          group_mapping: config.groupMapping,
          auto_provision: config.autoProvision,
          auto_deprovision: config.autoDeprovision
        });

      if (error) {
        console.error('Failed to configure SCIM:', error);
        throw error;
      }

      // Reload configurations
      await this.loadConfigurations();
    } catch (error) {
      console.error('Configure SCIM failed:', error);
      throw error;
    }
  }

  /**
   * Provision user via SCIM
   */
  public async provisionUser(
    userId: string,
    ssoUser: SSOUser,
    scimConfig: SCIMConfiguration
  ): Promise<void> {
    try {
      const scimUser: SCIMUser = {
        id: userId,
        userName: ssoUser.email,
        emails: [{ value: ssoUser.email, primary: true }],
        name: {
          givenName: ssoUser.firstName,
          familyName: ssoUser.lastName,
          formatted: ssoUser.displayName
        },
        groups: ssoUser.groups.map(group => ({ value: group, display: group })),
        active: true,
        meta: {
          resourceType: 'User',
          created: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      const response = await fetch(`${scimConfig.endpoint}/Users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${scimConfig.bearerToken}`,
          'Content-Type': 'application/scim+json'
        },
        body: JSON.stringify(scimUser)
      });

      if (!response.ok) {
        throw new Error(`SCIM provisioning failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('SCIM provisioning failed:', error);
      throw error;
    }
  }

  /**
   * Deprovision user via SCIM
   */
  public async deprovisionUser(
    userId: string,
    scimConfig: SCIMConfiguration
  ): Promise<void> {
    try {
      const response = await fetch(`${scimConfig.endpoint}/Users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${scimConfig.bearerToken}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`SCIM deprovisioning failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('SCIM deprovisioning failed:', error);
      throw error;
    }
  }

  /**
   * Sync users from SCIM
   */
  public async syncUsersFromSCIM(customerId: string): Promise<void> {
    const scimConfig = this.scimConfigs.get(customerId);
    if (!scimConfig) {
      throw new Error('SCIM not configured for customer');
    }

    try {
      const response = await fetch(`${scimConfig.endpoint}/Users`, {
        headers: {
          'Authorization': `Bearer ${scimConfig.bearerToken}`,
          'Accept': 'application/scim+json'
        }
      });

      if (!response.ok) {
        throw new Error(`SCIM sync failed: ${response.statusText}`);
      }

      const data = await response.json();
      const scimUsers: SCIMUser[] = data.Resources || [];

      for (const scimUser of scimUsers) {
        await this.syncSCIMUser(scimUser, scimConfig);
      }
    } catch (error) {
      console.error('SCIM sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync individual SCIM user
   */
  private async syncSCIMUser(scimUser: SCIMUser, scimConfig: SCIMConfiguration): Promise<void> {
    try {
      const email = scimUser.emails.find(e => e.primary)?.value || scimUser.emails[0]?.value;
      if (!email) return;

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        // Update existing user
        await supabase
          .from('users')
          .update({
            full_name: scimUser.name.formatted,
            email_verified: true
          })
          .eq('id', existingUser.id);
      } else if (scimUser.active) {
        // Create new user
        await supabase
          .from('users')
          .insert({
            email,
            full_name: scimUser.name.formatted,
            role: 'learner',
            company: scimConfig.customerId,
            email_verified: true
          });
      }
    } catch (error) {
      console.error('Failed to sync SCIM user:', error);
    }
  }

  /**
   * Get SCIM configuration for customer
   */
  public getSCIMConfig(customerId: string): SCIMConfiguration | null {
    return this.scimConfigs.get(customerId) || null;
  }

  /**
   * Test SCIM connection
   */
  public async testSCIMConnection(customerId: string): Promise<boolean> {
    const scimConfig = this.scimConfigs.get(customerId);
    if (!scimConfig) {
      return false;
    }

    try {
      const response = await fetch(`${scimConfig.endpoint}/Users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${scimConfig.bearerToken}`,
          'Accept': 'application/scim+json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('SCIM connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ssoService = SSOService.getInstance();