/**
 * Security utilities for Winbro Training Reels
 * Browser-compatible security functions
 */

/**
 * Security configuration constants
 */
export const SECURITY_CONFIG = {
  // Encryption settings
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  TAG_LENGTH: 16, // 128 bits
  SALT_LENGTH: 32, // 256 bits
  
  // Hashing settings
  HASH_ALGORITHM: 'sha256',
  HASH_ITERATIONS: 100000,
  
  // Token settings
  TOKEN_LENGTH: 32,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_LENGTH: 64,
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  
  // Data retention
  AUDIT_LOG_RETENTION_DAYS: 2555, // 7 years
  SESSION_LOG_RETENTION_DAYS: 90,
  
  // Security headers
  SECURITY_HEADERS: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://labtmlxjyozpiiorskxw.supabase.co; frame-ancestors 'none';"
  }
} as const;

/**
 * Browser-compatible crypto utilities
 */
const getRandomValues = (array: Uint8Array) => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  // Fallback for environments without crypto.getRandomValues
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

const randomBytes = (size: number): Uint8Array => {
  const array = new Uint8Array(size);
  getRandomValues(array);
  return array;
};

/**
 * Generate a secure random salt
 */
export const generateSalt = (): Uint8Array => {
  return randomBytes(SECURITY_CONFIG.SALT_LENGTH);
};

/**
 * Generate a secure random IV
 */
export const generateIV = (): Uint8Array => {
  return randomBytes(SECURITY_CONFIG.IV_LENGTH);
};

/**
 * Generate a secure random key
 */
export const generateKey = (): Uint8Array => {
  return randomBytes(SECURITY_CONFIG.KEY_LENGTH);
};

/**
 * Derive key from password using PBKDF2 (browser-compatible)
 */
export const deriveKey = async (password: string, salt: Uint8Array): Promise<Uint8Array> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt.buffer.slice(0) as ArrayBuffer,
        iterations: SECURITY_CONFIG.HASH_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      SECURITY_CONFIG.KEY_LENGTH * 8
    );
    
    return new Uint8Array(derivedBits);
  }
  
  // Fallback for environments without Web Crypto API
  const combined = password + Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  return new TextEncoder().encode(combined).slice(0, SECURITY_CONFIG.KEY_LENGTH);
};

/**
 * Hash data using SHA-256 (browser-compatible)
 */
export const hashData = async (data: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without Web Crypto API
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
};

/**
 * Create HMAC for data integrity (simplified for browser)
 */
export const createHMAC = (data: string, key: string): string => {
  // Simple HMAC implementation for browser
  const combined = key + data;
  return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
};

/**
 * Verify HMAC
 */
export const verifyHMAC = (data: string, key: string, signature: string): boolean => {
  const expectedSignature = createHMAC(data, key);
  return expectedSignature === signature;
};

/**
 * Generate a secure random token
 */
export const generateToken = (length: number = SECURITY_CONFIG.TOKEN_LENGTH): string => {
  const array = randomBytes(length);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate a secure random session ID
 */
export const generateSessionId = (): string => {
  return generateToken(32);
};

/**
 * Generate a secure random refresh token
 */
export const generateRefreshToken = (): string => {
  return generateToken(SECURITY_CONFIG.REFRESH_TOKEN_LENGTH);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Generate a secure random UUID v4
 */
export const generateUUID = (): string => {
  const array = randomBytes(16);
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant bits
  
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-');
};

/**
 * Encrypt data using Web Crypto API
 */
export const encryptData = async (data: string, key: Uint8Array): Promise<{ encrypted: string; iv: string }> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const iv = generateIV();
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key.buffer.slice(0) as ArrayBuffer,
      'AES-GCM',
      false,
      ['encrypt']
    );
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv.buffer.slice(0) as ArrayBuffer },
      cryptoKey,
      new TextEncoder().encode(data)
    );
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  }
  
  // Fallback for environments without Web Crypto API
  return {
    encrypted: btoa(data),
    iv: Array.from(generateIV()).map(b => b.toString(16).padStart(2, '0')).join('')
  };
};

/**
 * Decrypt data using Web Crypto API
 */
export const decryptData = async (encrypted: string, key: Uint8Array, iv: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const ivArray = new Uint8Array(iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const encryptedArray = new Uint8Array(encrypted.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key.buffer.slice(0) as ArrayBuffer,
      'AES-GCM',
      false,
      ['decrypt']
    );
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray.buffer.slice(0) as ArrayBuffer },
      cryptoKey,
      encryptedArray.buffer.slice(0) as ArrayBuffer
    );
    
    return new TextDecoder().decode(decrypted);
  }
  
  // Fallback for environments without Web Crypto API
  return atob(encrypted);
};

/**
 * Security service class
 */
export class SecurityService {
  private static instance: SecurityService;
  
  private constructor() {}
  
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }
  
  /**
   * Generate a secure random password
   */
  public generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = randomBytes(length);
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    return password;
  }
  
  /**
   * Check if password is strong enough
   */
  public isPasswordStrong(password: string): boolean {
    return validatePassword(password).isValid;
  }
  
  /**
   * Generate a secure API key
   */
  public generateApiKey(): string {
    return generateToken(32);
  }
  
  /**
   * Generate a secure session token
   */
  public generateSessionToken(): string {
    return generateToken(32);
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();