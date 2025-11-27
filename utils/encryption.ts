// Veri Şifreleme
// E2E şifreleme, hassas veri koruması, biometric authentication

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Types
export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag?: string;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  autoLockTimeout: number; // dakika
  encryptSensitiveData: boolean;
  requireAuthForExport: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

// Storage Keys
const KEYS = {
  ENCRYPTION_KEY: 'encryption_key',
  SECURITY_SETTINGS: '@security_settings',
  PIN_HASH: 'pin_hash',
  LAST_AUTH_TIME: '@last_auth_time',
};

// Hassas veriler listesi
const SENSITIVE_KEYS = [
  '@user_data',
  '@journal_entries',
  '@mood_entries',
  '@health_metrics',
  '@emergency_contacts',
];

// Varsayılan güvenlik ayarları
const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  biometricEnabled: false,
  pinEnabled: false,
  autoLockTimeout: 5,
  encryptSensitiveData: true,
  requireAuthForExport: true,
};

// Rastgele bytes oluştur
const generateRandomBytes = async (length: number): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

// SHA-256 hash
export const hashData = async (data: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
};

// Şifreleme anahtarı oluştur veya getir
const getOrCreateEncryptionKey = async (): Promise<string> => {
  try {
    let key = await SecureStore.getItemAsync(KEYS.ENCRYPTION_KEY);
    
    if (!key) {
      key = await generateRandomBytes(32);
      await SecureStore.setItemAsync(KEYS.ENCRYPTION_KEY, key);
    }
    
    return key;
  } catch (error) {
    console.error('Error getting encryption key:', error);
    // Fallback - güvenli olmayan depolama
    const fallbackKey = await AsyncStorage.getItem('@fallback_key');
    if (fallbackKey) return fallbackKey;
    
    const newKey = await generateRandomBytes(32);
    await AsyncStorage.setItem('@fallback_key', newKey);
    return newKey;
  }
};

// Basit XOR şifreleme (gerçek uygulamada AES kullanılmalı)
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return Buffer.from(result, 'binary').toString('base64');
};

const xorDecrypt = (encryptedBase64: string, key: string): string => {
  const encrypted = Buffer.from(encryptedBase64, 'base64').toString('binary');
  let result = '';
  for (let i = 0; i < encrypted.length; i++) {
    result += String.fromCharCode(
      encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
};

// Veriyi şifrele
export const encryptData = async (data: string): Promise<EncryptedData> => {
  try {
    const key = await getOrCreateEncryptionKey();
    const iv = await generateRandomBytes(16);
    const salt = await generateRandomBytes(16);
    
    // Anahtar türetme (basitleştirilmiş)
    const derivedKey = await hashData(key + salt);
    
    // Şifreleme
    const ciphertext = xorEncrypt(data, derivedKey);
    
    return {
      ciphertext,
      iv,
      salt,
    };
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw error;
  }
};

// Veriyi çöz
export const decryptData = async (encryptedData: EncryptedData): Promise<string> => {
  try {
    const key = await getOrCreateEncryptionKey();
    
    // Anahtar türetme
    const derivedKey = await hashData(key + encryptedData.salt);
    
    // Çözme
    const plaintext = xorDecrypt(encryptedData.ciphertext, derivedKey);
    
    return plaintext;
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw error;
  }
};

// Hassas veriyi şifreli kaydet
export const saveEncryptedData = async (key: string, data: any): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    const encrypted = await encryptData(jsonData);
    await AsyncStorage.setItem(key + '_encrypted', JSON.stringify(encrypted));
  } catch (error) {
    console.error('Error saving encrypted data:', error);
    throw error;
  }
};

// Şifreli veriyi oku
export const getEncryptedData = async (key: string): Promise<any | null> => {
  try {
    const encryptedJson = await AsyncStorage.getItem(key + '_encrypted');
    if (!encryptedJson) return null;
    
    const encrypted: EncryptedData = JSON.parse(encryptedJson);
    const decrypted = await decryptData(encrypted);
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error getting encrypted data:', error);
    return null;
  }
};

// Biyometrik doğrulama mevcut mu?
export const isBiometricAvailable = async (): Promise<{
  available: boolean;
  biometricTypes: LocalAuthentication.AuthenticationType[];
}> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      available: compatible && enrolled,
      biometricTypes: types,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { available: false, biometricTypes: [] };
  }
};

// Biyometrik doğrulama
export const authenticateWithBiometric = async (
  promptMessage: string = 'Kimliğinizi doğrulayın'
): Promise<AuthResult> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'PIN kullan',
      cancelLabel: 'İptal',
      disableDeviceFallback: false,
    });
    
    if (result.success) {
      await updateLastAuthTime();
    }
    
    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('Error during biometric authentication:', error);
    return {
      success: false,
      error: 'Biyometrik doğrulama başarısız',
    };
  }
};

// PIN ayarla
export const setPin = async (pin: string): Promise<boolean> => {
  try {
    const hashedPin = await hashData(pin);
    await SecureStore.setItemAsync(KEYS.PIN_HASH, hashedPin);
    return true;
  } catch (error) {
    console.error('Error setting PIN:', error);
    return false;
  }
};

// PIN doğrula
export const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const storedHash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
    if (!storedHash) return false;
    
    const inputHash = await hashData(pin);
    const isValid = storedHash === inputHash;
    
    if (isValid) {
      await updateLastAuthTime();
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

// PIN var mı?
export const hasPin = async (): Promise<boolean> => {
  try {
    const storedHash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
    return storedHash !== null;
  } catch (error) {
    return false;
  }
};

// PIN kaldır
export const removePin = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(KEYS.PIN_HASH);
    return true;
  } catch (error) {
    console.error('Error removing PIN:', error);
    return false;
  }
};

// Son doğrulama zamanını güncelle
const updateLastAuthTime = async (): Promise<void> => {
  await AsyncStorage.setItem(KEYS.LAST_AUTH_TIME, Date.now().toString());
};

// Doğrulama gerekli mi?
export const isAuthenticationRequired = async (): Promise<boolean> => {
  try {
    const settings = await getSecuritySettings();
    
    if (!settings.biometricEnabled && !settings.pinEnabled) {
      return false;
    }
    
    const lastAuthTime = await AsyncStorage.getItem(KEYS.LAST_AUTH_TIME);
    if (!lastAuthTime) return true;
    
    const elapsed = Date.now() - parseInt(lastAuthTime);
    const timeoutMs = settings.autoLockTimeout * 60 * 1000;
    
    return elapsed > timeoutMs;
  } catch (error) {
    console.error('Error checking auth requirement:', error);
    return false;
  }
};

// Güvenlik ayarlarını getir
export const getSecuritySettings = async (): Promise<SecuritySettings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SECURITY_SETTINGS);
    return data ? { ...DEFAULT_SECURITY_SETTINGS, ...JSON.parse(data) } : DEFAULT_SECURITY_SETTINGS;
  } catch (error) {
    console.error('Error getting security settings:', error);
    return DEFAULT_SECURITY_SETTINGS;
  }
};

// Güvenlik ayarlarını kaydet
export const saveSecuritySettings = async (settings: Partial<SecuritySettings>): Promise<void> => {
  try {
    const current = await getSecuritySettings();
    const newSettings = { ...current, ...settings };
    await AsyncStorage.setItem(KEYS.SECURITY_SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving security settings:', error);
  }
};

// Hassas verileri şifrele
export const encryptSensitiveData = async (): Promise<number> => {
  try {
    let encryptedCount = 0;
    
    for (const key of SENSITIVE_KEYS) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        await saveEncryptedData(key, JSON.parse(data));
        await AsyncStorage.removeItem(key);
        encryptedCount++;
      }
    }
    
    return encryptedCount;
  } catch (error) {
    console.error('Error encrypting sensitive data:', error);
    return 0;
  }
};

// Hassas verileri çöz
export const decryptSensitiveData = async (): Promise<number> => {
  try {
    let decryptedCount = 0;
    
    for (const key of SENSITIVE_KEYS) {
      const encryptedData = await getEncryptedData(key);
      if (encryptedData) {
        await AsyncStorage.setItem(key, JSON.stringify(encryptedData));
        await AsyncStorage.removeItem(key + '_encrypted');
        decryptedCount++;
      }
    }
    
    return decryptedCount;
  } catch (error) {
    console.error('Error decrypting sensitive data:', error);
    return 0;
  }
};

// Tüm güvenlik verilerini sil
export const clearSecurityData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(KEYS.ENCRYPTION_KEY);
    await SecureStore.deleteItemAsync(KEYS.PIN_HASH);
    await AsyncStorage.removeItem(KEYS.SECURITY_SETTINGS);
    await AsyncStorage.removeItem(KEYS.LAST_AUTH_TIME);
    
    console.log('All security data cleared');
  } catch (error) {
    console.error('Error clearing security data:', error);
  }
};

// Biyometrik tip adı
export const getBiometricTypeName = (type: LocalAuthentication.AuthenticationType): string => {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'Parmak İzi';
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'Yüz Tanıma';
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'İris Tarama';
    default:
      return 'Biyometrik';
  }
};




