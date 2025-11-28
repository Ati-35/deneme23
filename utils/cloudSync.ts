// Cloud Senkronizasyon
// Firebase/Supabase ile cloud storage, çoklu cihaz, otomatik yedekleme

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface SyncStatus {
  lastSyncTime: string | null;
  isSyncing: boolean;
  pendingChanges: number;
  syncError: string | null;
  deviceId: string;
}

export interface SyncableData {
  key: string;
  data: any;
  timestamp: string;
  version: number;
}

export interface CloudBackup {
  id: string;
  createdAt: string;
  deviceName: string;
  dataSize: number;
  isAutomatic: boolean;
  keys: string[];
}

export interface ConflictResolution {
  type: 'local' | 'cloud' | 'merge';
  key: string;
  localValue: any;
  cloudValue: any;
  resolvedValue: any;
}

// Storage Keys
const KEYS = {
  SYNC_STATUS: '@sync_status',
  DEVICE_ID: '@device_id',
  LAST_SYNC: '@last_sync',
  SYNC_QUEUE: '@sync_queue',
  CLOUD_USER: '@cloud_user',
};

// Senkronize edilecek veriler
const SYNCABLE_KEYS = [
  '@user_data',
  '@mood_entries',
  '@journal_entries',
  '@behavior_data',
  '@user_achievements',
  '@user_level',
  '@piggy_banks',
  '@piggy_transactions',
  '@tip_favorites',
  '@notification_settings',
];

// Cihaz ID'si oluştur veya getir
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(KEYS.DEVICE_ID);
    
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return 'unknown-device';
  }
};

// Senkronizasyon durumunu getir
export const getSyncStatus = async (): Promise<SyncStatus> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SYNC_STATUS);
    const deviceId = await getDeviceId();
    
    if (data) {
      return { ...JSON.parse(data), deviceId };
    }
    
    return {
      lastSyncTime: null,
      isSyncing: false,
      pendingChanges: 0,
      syncError: null,
      deviceId,
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      lastSyncTime: null,
      isSyncing: false,
      pendingChanges: 0,
      syncError: 'Durum alınamadı',
      deviceId: 'unknown',
    };
  }
};

// Senkronizasyon durumunu güncelle
export const updateSyncStatus = async (updates: Partial<SyncStatus>): Promise<void> => {
  try {
    const current = await getSyncStatus();
    const newStatus = { ...current, ...updates };
    await AsyncStorage.setItem(KEYS.SYNC_STATUS, JSON.stringify(newStatus));
  } catch (error) {
    console.error('Error updating sync status:', error);
  }
};

// Yerel verileri topla
export const collectLocalData = async (): Promise<SyncableData[]> => {
  try {
    const syncableData: SyncableData[] = [];
    
    for (const key of SYNCABLE_KEYS) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        syncableData.push({
          key,
          data: JSON.parse(data),
          timestamp: new Date().toISOString(),
          version: 1,
        });
      }
    }
    
    return syncableData;
  } catch (error) {
    console.error('Error collecting local data:', error);
    return [];
  }
};

// Buluta yükle (simülasyon)
export const uploadToCloud = async (): Promise<boolean> => {
  try {
    await updateSyncStatus({ isSyncing: true, syncError: null });
    
    const localData = await collectLocalData();
    
    // Gerçek uygulamada burada Firebase/Supabase API çağrısı yapılır
    // Simülasyon için bekletelim
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Başarılı olduğunu varsayalım
    await updateSyncStatus({
      isSyncing: false,
      lastSyncTime: new Date().toISOString(),
      pendingChanges: 0,
    });
    
    console.log('Cloud upload completed:', localData.length, 'items');
    return true;
  } catch (error) {
    console.error('Error uploading to cloud:', error);
    await updateSyncStatus({
      isSyncing: false,
      syncError: 'Yükleme başarısız',
    });
    return false;
  }
};

// Buluttan indir (simülasyon)
export const downloadFromCloud = async (): Promise<boolean> => {
  try {
    await updateSyncStatus({ isSyncing: true, syncError: null });
    
    // Gerçek uygulamada burada Firebase/Supabase'den veri çekilir
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await updateSyncStatus({
      isSyncing: false,
      lastSyncTime: new Date().toISOString(),
    });
    
    console.log('Cloud download completed');
    return true;
  } catch (error) {
    console.error('Error downloading from cloud:', error);
    await updateSyncStatus({
      isSyncing: false,
      syncError: 'İndirme başarısız',
    });
    return false;
  }
};

// Otomatik senkronizasyon
export const autoSync = async (): Promise<void> => {
  try {
    const status = await getSyncStatus();
    
    // Eğer zaten senkronize oluyorsa bekle
    if (status.isSyncing) {
      console.log('Sync already in progress');
      return;
    }
    
    // Son senkronizasyondan 1 saat geçtiyse senkronize et
    if (status.lastSyncTime) {
      const lastSync = new Date(status.lastSyncTime);
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSync < 1) {
        console.log('Recent sync, skipping auto-sync');
        return;
      }
    }
    
    await uploadToCloud();
  } catch (error) {
    console.error('Error in auto sync:', error);
  }
};

// Yedekleme oluştur
export const createBackup = async (isAutomatic: boolean = false): Promise<CloudBackup | null> => {
  try {
    const localData = await collectLocalData();
    const deviceId = await getDeviceId();
    
    const backup: CloudBackup = {
      id: `backup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      deviceName: deviceId,
      dataSize: JSON.stringify(localData).length,
      isAutomatic,
      keys: localData.map(d => d.key),
    };
    
    // Gerçek uygulamada burada backup cloud'a kaydedilir
    console.log('Backup created:', backup);
    
    return backup;
  } catch (error) {
    console.error('Error creating backup:', error);
    return null;
  }
};

// Yedekten geri yükle
export const restoreFromBackup = async (backupId: string): Promise<boolean> => {
  try {
    await updateSyncStatus({ isSyncing: true, syncError: null });
    
    // Gerçek uygulamada burada backup'tan veri çekilir ve yerel storage'a yazılır
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await updateSyncStatus({
      isSyncing: false,
      lastSyncTime: new Date().toISOString(),
    });
    
    console.log('Restore from backup completed:', backupId);
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    await updateSyncStatus({
      isSyncing: false,
      syncError: 'Geri yükleme başarısız',
    });
    return false;
  }
};

// Yerel veriyi temizle ve cloud'dan indir
export const resetToCloud = async (): Promise<boolean> => {
  try {
    // Önce yedek al
    await createBackup(false);
    
    // Senkronize edilebilir verileri temizle
    for (const key of SYNCABLE_KEYS) {
      await AsyncStorage.removeItem(key);
    }
    
    // Cloud'dan indir
    return await downloadFromCloud();
  } catch (error) {
    console.error('Error resetting to cloud:', error);
    return false;
  }
};

// Çakışma çözümü
export const resolveConflict = async (
  resolution: ConflictResolution
): Promise<boolean> => {
  try {
    let valueToSave: any;
    
    switch (resolution.type) {
      case 'local':
        valueToSave = resolution.localValue;
        break;
      case 'cloud':
        valueToSave = resolution.cloudValue;
        break;
      case 'merge':
        valueToSave = resolution.resolvedValue;
        break;
    }
    
    await AsyncStorage.setItem(resolution.key, JSON.stringify(valueToSave));
    return true;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return false;
  }
};

// Veri boyutunu hesapla
export const calculateDataSize = async (): Promise<number> => {
  try {
    const localData = await collectLocalData();
    return JSON.stringify(localData).length;
  } catch (error) {
    console.error('Error calculating data size:', error);
    return 0;
  }
};

// Formatlanmış boyut
export const formatDataSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Senkronizasyon geçmişi (simülasyon)
export const getSyncHistory = async (): Promise<{ time: string; type: string; status: string }[]> => {
  // Gerçek uygulamada bu cloud'dan çekilir
  return [
    { time: new Date().toISOString(), type: 'upload', status: 'success' },
    { time: new Date(Date.now() - 3600000).toISOString(), type: 'download', status: 'success' },
    { time: new Date(Date.now() - 7200000).toISOString(), type: 'auto', status: 'success' },
  ];
};

// Cloud bağlantı durumu
export const isCloudConnected = async (): Promise<boolean> => {
  // Gerçek uygulamada network ve auth durumu kontrol edilir
  return true;
};

// Kullanıcı cloud hesabına giriş yaptı mı
export const isCloudAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await AsyncStorage.getItem(KEYS.CLOUD_USER);
    return user !== null;
  } catch (error) {
    return false;
  }
};

// Cloud hesabıyla giriş (simülasyon)
export const signInToCloud = async (email: string, password: string): Promise<boolean> => {
  try {
    // Gerçek uygulamada burada Firebase/Supabase auth kullanılır
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await AsyncStorage.setItem(KEYS.CLOUD_USER, JSON.stringify({
      email,
      signedInAt: new Date().toISOString(),
    }));
    
    return true;
  } catch (error) {
    console.error('Error signing in to cloud:', error);
    return false;
  }
};

// Cloud hesabından çıkış
export const signOutFromCloud = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.CLOUD_USER);
  } catch (error) {
    console.error('Error signing out from cloud:', error);
  }
};







