// Offline Mod Yönetimi
// İnternetsiz çalışma, otomatik senkronizasyon, cache yönetimi

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Types
export interface OfflineAction {
  id: string;
  type: ActionType;
  key: string;
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}

export type ActionType = 'create' | 'update' | 'delete';

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: string;
  expiresAt: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OfflineStatus {
  isOnline: boolean;
  lastOnlineAt: string | null;
  pendingActions: number;
  cacheSize: number;
  lastSyncAttempt: string | null;
}

export interface CacheConfig {
  maxSize: number; // byte
  defaultTTL: number; // saniye
  priorityTTL: {
    high: number;
    medium: number;
    low: number;
  };
}

// Storage Keys
const KEYS = {
  OFFLINE_QUEUE: '@offline_queue',
  CACHE: '@offline_cache',
  OFFLINE_STATUS: '@offline_status',
  CACHE_CONFIG: '@cache_config',
};

// Varsayılan cache yapılandırması
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50 MB
  defaultTTL: 24 * 60 * 60, // 24 saat
  priorityTTL: {
    high: 7 * 24 * 60 * 60, // 7 gün
    medium: 3 * 24 * 60 * 60, // 3 gün
    low: 24 * 60 * 60, // 1 gün
  },
};

// Kritik veriler (offline'da da çalışmalı)
const CRITICAL_KEYS = [
  '@user_data',
  '@mood_entries',
  '@journal_entries',
  '@breathing_techniques',
  '@distraction_activities',
  '@motivational_quotes',
  '@emergency_contacts',
];

// Ağ durumunu kontrol et
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

// Ağ durumu dinleyicisi ekle
export const addNetworkListener = (
  callback: (isOnline: boolean) => void
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    callback(state.isConnected ?? false);
  });
  return unsubscribe;
};

// Offline durumunu getir
export const getOfflineStatus = async (): Promise<OfflineStatus> => {
  try {
    const [isOnline, queue, cache] = await Promise.all([
      checkNetworkStatus(),
      getOfflineQueue(),
      getCacheEntries(),
    ]);

    const cacheSize = JSON.stringify(cache).length;
    const data = await AsyncStorage.getItem(KEYS.OFFLINE_STATUS);
    const status = data ? JSON.parse(data) : {};

    return {
      isOnline,
      lastOnlineAt: status.lastOnlineAt || null,
      pendingActions: queue.filter(a => a.status === 'pending').length,
      cacheSize,
      lastSyncAttempt: status.lastSyncAttempt || null,
    };
  } catch (error) {
    console.error('Error getting offline status:', error);
    return {
      isOnline: false,
      lastOnlineAt: null,
      pendingActions: 0,
      cacheSize: 0,
      lastSyncAttempt: null,
    };
  }
};

// Offline durumunu güncelle
export const updateOfflineStatus = async (updates: Partial<OfflineStatus>): Promise<void> => {
  try {
    const current = await getOfflineStatus();
    const newStatus = { ...current, ...updates };
    await AsyncStorage.setItem(KEYS.OFFLINE_STATUS, JSON.stringify(newStatus));
  } catch (error) {
    console.error('Error updating offline status:', error);
  }
};

// Offline kuyruğa ekle
export const addToOfflineQueue = async (
  type: ActionType,
  key: string,
  data: any
): Promise<void> => {
  try {
    const queue = await getOfflineQueue();

    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      key,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };

    queue.push(action);
    await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to offline queue:', error);
  }
};

// Offline kuyruğu getir
export const getOfflineQueue = async (): Promise<OfflineAction[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.OFFLINE_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
};

// Offline kuyruğu işle
export const processOfflineQueue = async (): Promise<{ success: number; failed: number }> => {
  try {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      return { success: 0, failed: 0 };
    }

    const queue = await getOfflineQueue();
    const pendingActions = queue.filter(a => a.status === 'pending' || a.status === 'failed');

    let success = 0;
    let failed = 0;

    for (const action of pendingActions) {
      try {
        // İşlemi gerçekleştir (simülasyon)
        await processAction(action);

        // Başarılı olarak işaretle
        action.status = 'synced';
        success++;
      } catch (error) {
        action.retryCount++;
        action.status = action.retryCount >= 3 ? 'failed' : 'pending';
        failed++;
      }
    }

    // Kuyruğu güncelle (synced olanları kaldır)
    const updatedQueue = queue.filter(a => a.status !== 'synced');
    await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(updatedQueue));

    await updateOfflineStatus({
      lastSyncAttempt: new Date().toISOString(),
      lastOnlineAt: new Date().toISOString(),
    });

    return { success, failed };
  } catch (error) {
    console.error('Error processing offline queue:', error);
    return { success: 0, failed: 0 };
  }
};

// İşlemi gerçekleştir (simülasyon)
const processAction = async (action: OfflineAction): Promise<void> => {
  // Gerçek uygulamada burada API çağrısı yapılır
  await new Promise(resolve => setTimeout(resolve, 500));

  // %10 başarısızlık simülasyonu
  if (Math.random() < 0.1) {
    throw new Error('Sync failed');
  }
};

// Cache'e ekle
export const addToCache = async (
  key: string,
  data: any,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> => {
  try {
    const config = await getCacheConfig();
    const cache = await getCacheEntries();

    const ttl = config.priorityTTL[priority];
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    const entry: CacheEntry = {
      key,
      data,
      timestamp: new Date().toISOString(),
      expiresAt,
      priority,
    };

    // Aynı key varsa güncelle
    const existingIndex = cache.findIndex(e => e.key === key);
    if (existingIndex !== -1) {
      cache[existingIndex] = entry;
    } else {
      cache.push(entry);
    }

    // Cache boyutu kontrolü
    await enforceCacheLimit(cache, config.maxSize);

    await AsyncStorage.setItem(KEYS.CACHE, JSON.stringify(cache));
  } catch (error) {
    console.error('Error adding to cache:', error);
  }
};

// Cache'den getir
export const getFromCache = async (key: string): Promise<any | null> => {
  try {
    const cache = await getCacheEntries();
    const entry = cache.find(e => e.key === key);

    if (!entry) return null;

    // Süresi dolmuş mu kontrol et
    if (new Date(entry.expiresAt) < new Date()) {
      await removeFromCache(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
};

// Cache'den sil
export const removeFromCache = async (key: string): Promise<void> => {
  try {
    const cache = await getCacheEntries();
    const filtered = cache.filter(e => e.key !== key);
    await AsyncStorage.setItem(KEYS.CACHE, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
};

// Tüm cache girişlerini getir
export const getCacheEntries = async (): Promise<CacheEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CACHE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting cache entries:', error);
    return [];
  }
};

// Süresi dolmuş cache'leri temizle
export const cleanExpiredCache = async (): Promise<number> => {
  try {
    const cache = await getCacheEntries();
    const now = new Date();
    const validEntries = cache.filter(e => new Date(e.expiresAt) > now);
    const removedCount = cache.length - validEntries.length;

    await AsyncStorage.setItem(KEYS.CACHE, JSON.stringify(validEntries));

    return removedCount;
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    return 0;
  }
};

// Cache boyut limitini uygula
const enforceCacheLimit = async (
  cache: CacheEntry[],
  maxSize: number
): Promise<void> => {
  let currentSize = JSON.stringify(cache).length;

  while (currentSize > maxSize && cache.length > 0) {
    // Önce düşük öncelikli ve eski olanları sil
    cache.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    cache.shift();
    currentSize = JSON.stringify(cache).length;
  }
};

// Cache yapılandırmasını getir
export const getCacheConfig = async (): Promise<CacheConfig> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CACHE_CONFIG);
    return data ? { ...DEFAULT_CACHE_CONFIG, ...JSON.parse(data) } : DEFAULT_CACHE_CONFIG;
  } catch (error) {
    console.error('Error getting cache config:', error);
    return DEFAULT_CACHE_CONFIG;
  }
};

// Cache yapılandırmasını kaydet
export const saveCacheConfig = async (config: Partial<CacheConfig>): Promise<void> => {
  try {
    const current = await getCacheConfig();
    const newConfig = { ...current, ...config };
    await AsyncStorage.setItem(KEYS.CACHE_CONFIG, JSON.stringify(newConfig));
  } catch (error) {
    console.error('Error saving cache config:', error);
  }
};

// Kritik verileri cache'le
export const cacheCriticalData = async (): Promise<void> => {
  try {
    for (const key of CRITICAL_KEYS) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        await addToCache(key, JSON.parse(data), 'high');
      }
    }
    console.log('Critical data cached successfully');
  } catch (error) {
    console.error('Error caching critical data:', error);
  }
};

// Cache istatistikleri
export const getCacheStats = async (): Promise<{
  totalEntries: number;
  totalSize: number;
  byPriority: { high: number; medium: number; low: number };
  oldestEntry: string | null;
  newestEntry: string | null;
}> => {
  try {
    const cache = await getCacheEntries();

    const byPriority = { high: 0, medium: 0, low: 0 };
    cache.forEach(e => byPriority[e.priority]++);

    const sortedByTime = [...cache].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      totalEntries: cache.length,
      totalSize: JSON.stringify(cache).length,
      byPriority,
      oldestEntry: sortedByTime[0]?.timestamp || null,
      newestEntry: sortedByTime[sortedByTime.length - 1]?.timestamp || null,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      totalSize: 0,
      byPriority: { high: 0, medium: 0, low: 0 },
      oldestEntry: null,
      newestEntry: null,
    };
  }
};

// Tüm cache'i temizle
export const clearAllCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.CACHE);
    console.log('All cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Veri boyutunu formatla
export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};







