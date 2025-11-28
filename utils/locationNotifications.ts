// Konum Bazlı Uyarılar
// Sigara alanı uyarısı, healthy zone mesajları

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface LocationZone {
  id: string;
  name: string;
  type: ZoneType;
  latitude: number;
  longitude: number;
  radius: number; // metre
  isActive: boolean;
  createdAt: string;
  triggerCount: number;
  lastTriggered?: string;
}

export type ZoneType = 
  | 'smoking_area'      // Sigara içilen alan
  | 'tobacco_shop'      // Tekel bayii
  | 'healthy_zone'      // Sağlıklı alan (park, spor salonu)
  | 'work'              // İş yeri
  | 'home'              // Ev
  | 'friend_smoker'     // Sigara içen arkadaş evi
  | 'trigger_location'  // Tetikleyici konum
  | 'safe_zone';        // Güvenli alan

export interface LocationAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  zoneType: ZoneType;
  title: string;
  message: string;
  timestamp: string;
  wasHelpful?: boolean;
}

export interface LocationSettings {
  enabled: boolean;
  smokingAreaAlerts: boolean;
  tobaccoShopAlerts: boolean;
  healthyZoneMessages: boolean;
  triggerLocationAlerts: boolean;
  alertRadius: number; // metre
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

// Storage Keys
const KEYS = {
  ZONES: '@location_zones',
  ALERTS: '@location_alerts',
  SETTINGS: '@location_settings',
};

// Varsayılan ayarlar
const DEFAULT_SETTINGS: LocationSettings = {
  enabled: true,
  smokingAreaAlerts: true,
  tobaccoShopAlerts: true,
  healthyZoneMessages: true,
  triggerLocationAlerts: true,
  alertRadius: 100,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// Konum mesajları
const ZONE_MESSAGES: Record<ZoneType, { warning: string[]; motivation: string[] }> = {
  smoking_area: {
    warning: [
      '⚠️ Sigara içilen bir alana yaklaşıyorsun. Dikkatli ol!',
      '🚨 Bu bölgede sigara içiliyor. Alternatif bir rota düşün!',
      '⚡ Tetikleyici bölge! Nefes egzersizi yapmak ister misin?',
    ],
    motivation: [],
  },
  tobacco_shop: {
    warning: [
      '🏪 Yakınlarda tekel bayii var. Dikkatli ol!',
      '⚠️ Sigara satış noktasına yaklaşıyorsun. Güçlü kal!',
      '💪 Tekel bayii yakınında. Hedefini hatırla!',
    ],
    motivation: [],
  },
  healthy_zone: {
    warning: [],
    motivation: [
      '🌳 Harika! Sağlıklı bir alandasın. Derin bir nefes al!',
      '💚 Bu ortamın tadını çıkar. Temiz hava içine çek!',
      '🏃 Mükemmel! Egzersiz için ideal bir yer.',
    ],
  },
  work: {
    warning: [
      '💼 İş yerindesin. Mola zamanlarında dikkatli ol!',
    ],
    motivation: [
      '👔 İşe odaklan, sigara düşüncelerinden uzaklaş!',
    ],
  },
  home: {
    warning: [],
    motivation: [
      '🏠 Evindesin. Rahatla ama tetikleyicilere dikkat!',
    ],
  },
  friend_smoker: {
    warning: [
      '👥 Sigara içen arkadaşının yanındasın. Dikkatli ol!',
      '⚠️ Bu ortamda tetiklenebilirsin. Hazırlıklı ol!',
    ],
    motivation: [],
  },
  trigger_location: {
    warning: [
      '📍 Bu konum senin için tetikleyici. Ekstra dikkat!',
      '⚡ Zor bir bölgede olabilirsin. SOS modunu hazır tut!',
    ],
    motivation: [],
  },
  safe_zone: {
    warning: [],
    motivation: [
      '✅ Güvenli bölgedesin. Rahat ol!',
      '🌟 Bu ortam sana iyi geliyor. Keyfini çıkar!',
    ],
  },
};

// Ayarları getir
export const getLocationSettings = async (): Promise<LocationSettings> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting location settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Ayarları kaydet
export const saveLocationSettings = async (settings: Partial<LocationSettings>): Promise<void> => {
  try {
    const current = await getLocationSettings();
    const newSettings = { ...current, ...settings };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving location settings:', error);
  }
};

// Zone ekle
export const addZone = async (zone: Omit<LocationZone, 'id' | 'createdAt' | 'triggerCount'>): Promise<LocationZone> => {
  try {
    const zones = await getZones();
    
    const newZone: LocationZone = {
      ...zone,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };
    
    zones.push(newZone);
    await AsyncStorage.setItem(KEYS.ZONES, JSON.stringify(zones));
    
    return newZone;
  } catch (error) {
    console.error('Error adding zone:', error);
    throw error;
  }
};

// Zone'ları getir
export const getZones = async (): Promise<LocationZone[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ZONES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting zones:', error);
    return [];
  }
};

// Zone güncelle
export const updateZone = async (id: string, updates: Partial<LocationZone>): Promise<void> => {
  try {
    const zones = await getZones();
    const index = zones.findIndex(z => z.id === id);
    
    if (index !== -1) {
      zones[index] = { ...zones[index], ...updates };
      await AsyncStorage.setItem(KEYS.ZONES, JSON.stringify(zones));
    }
  } catch (error) {
    console.error('Error updating zone:', error);
  }
};

// Zone sil
export const deleteZone = async (id: string): Promise<void> => {
  try {
    const zones = await getZones();
    const filtered = zones.filter(z => z.id !== id);
    await AsyncStorage.setItem(KEYS.ZONES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting zone:', error);
  }
};

// İki nokta arası mesafe hesapla (Haversine formülü)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Dünya yarıçapı (metre)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // metre cinsinden mesafe
};

// Konum kontrolü yap
export const checkLocation = async (
  latitude: number,
  longitude: number
): Promise<LocationAlert | null> => {
  try {
    const settings = await getLocationSettings();
    
    if (!settings.enabled) return null;
    
    // Sessiz saatler kontrolü
    if (settings.quietHoursEnabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const quietStart = settings.quietHoursStart;
      const quietEnd = settings.quietHoursEnd;
      
      let isQuiet = false;
      if (quietStart > quietEnd) {
        isQuiet = currentTime >= quietStart || currentTime < quietEnd;
      } else {
        isQuiet = currentTime >= quietStart && currentTime < quietEnd;
      }
      
      if (isQuiet) return null;
    }
    
    const zones = await getZones();
    const activeZones = zones.filter(z => z.isActive);
    
    for (const zone of activeZones) {
      const distance = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
      
      if (distance <= zone.radius + settings.alertRadius) {
        // Zone türüne göre uyarı kontrolü
        const shouldAlert = 
          (zone.type === 'smoking_area' && settings.smokingAreaAlerts) ||
          (zone.type === 'tobacco_shop' && settings.tobaccoShopAlerts) ||
          (zone.type === 'healthy_zone' && settings.healthyZoneMessages) ||
          (zone.type === 'trigger_location' && settings.triggerLocationAlerts) ||
          ['work', 'home', 'friend_smoker', 'safe_zone'].includes(zone.type);
        
        if (shouldAlert) {
          const alert = await createLocationAlert(zone);
          
          // Zone tetiklenme sayısını güncelle
          await updateZone(zone.id, {
            triggerCount: zone.triggerCount + 1,
            lastTriggered: new Date().toISOString(),
          });
          
          return alert;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking location:', error);
    return null;
  }
};

// Konum uyarısı oluştur
const createLocationAlert = async (zone: LocationZone): Promise<LocationAlert> => {
  const messages = ZONE_MESSAGES[zone.type];
  const isWarning = ['smoking_area', 'tobacco_shop', 'trigger_location', 'friend_smoker'].includes(zone.type);
  
  const messagePool = isWarning ? messages.warning : messages.motivation;
  const message = messagePool.length > 0 
    ? messagePool[Math.floor(Math.random() * messagePool.length)]
    : (isWarning ? 'Dikkatli ol!' : 'Harika gidiyorsun!');
  
  const alert: LocationAlert = {
    id: Date.now().toString(),
    zoneId: zone.id,
    zoneName: zone.name,
    zoneType: zone.type,
    title: getZoneTitle(zone.type),
    message,
    timestamp: new Date().toISOString(),
  };
  
  // Uyarıyı kaydet
  await saveLocationAlert(alert);
  
  return alert;
};

// Uyarı başlığı getir
const getZoneTitle = (type: ZoneType): string => {
  const titles: Record<ZoneType, string> = {
    smoking_area: '⚠️ Sigara Alanı',
    tobacco_shop: '🏪 Tekel Bayii',
    healthy_zone: '🌳 Sağlıklı Alan',
    work: '💼 İş Yeri',
    home: '🏠 Ev',
    friend_smoker: '👥 Riskli Ortam',
    trigger_location: '📍 Tetikleyici Konum',
    safe_zone: '✅ Güvenli Bölge',
  };
  return titles[type] || 'Konum Uyarısı';
};

// Uyarıyı kaydet
const saveLocationAlert = async (alert: LocationAlert): Promise<void> => {
  try {
    const alerts = await getLocationAlerts();
    alerts.push(alert);
    
    // Son 100 uyarıyı tut
    const recentAlerts = alerts.slice(-100);
    await AsyncStorage.setItem(KEYS.ALERTS, JSON.stringify(recentAlerts));
  } catch (error) {
    console.error('Error saving location alert:', error);
  }
};

// Uyarı geçmişini getir
export const getLocationAlerts = async (): Promise<LocationAlert[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting location alerts:', error);
    return [];
  }
};

// Uyarı geri bildirimi kaydet
export const markAlertFeedback = async (alertId: string, wasHelpful: boolean): Promise<void> => {
  try {
    const alerts = await getLocationAlerts();
    const index = alerts.findIndex(a => a.id === alertId);
    
    if (index !== -1) {
      alerts[index].wasHelpful = wasHelpful;
      await AsyncStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error('Error marking alert feedback:', error);
  }
};

// Zone türü adını getir (Türkçe)
export const getZoneTypeName = (type: ZoneType): string => {
  const names: Record<ZoneType, string> = {
    smoking_area: 'Sigara Alanı',
    tobacco_shop: 'Tekel Bayii',
    healthy_zone: 'Sağlıklı Alan',
    work: 'İş Yeri',
    home: 'Ev',
    friend_smoker: 'Riskli Ortam',
    trigger_location: 'Tetikleyici Konum',
    safe_zone: 'Güvenli Bölge',
  };
  return names[type] || type;
};

// Zone türü ikonunu getir
export const getZoneTypeIcon = (type: ZoneType): string => {
  const icons: Record<ZoneType, string> = {
    smoking_area: 'alert-circle',
    tobacco_shop: 'storefront',
    healthy_zone: 'leaf',
    work: 'briefcase',
    home: 'home',
    friend_smoker: 'people',
    trigger_location: 'location',
    safe_zone: 'shield-checkmark',
  };
  return icons[type] || 'location';
};

// Zone türü rengini getir
export const getZoneTypeColor = (type: ZoneType): string => {
  const colors: Record<ZoneType, string> = {
    smoking_area: '#EF4444',
    tobacco_shop: '#F97316',
    healthy_zone: '#10B981',
    work: '#3B82F6',
    home: '#8B5CF6',
    friend_smoker: '#F59E0B',
    trigger_location: '#DC2626',
    safe_zone: '#22C55E',
  };
  return colors[type] || '#6B7280';
};

// Yakındaki zone'ları getir
export const getNearbyZones = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 1000
): Promise<{ zone: LocationZone; distance: number }[]> => {
  try {
    const zones = await getZones();
    
    const nearbyZones = zones
      .map(zone => ({
        zone,
        distance: calculateDistance(latitude, longitude, zone.latitude, zone.longitude),
      }))
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    return nearbyZones;
  } catch (error) {
    console.error('Error getting nearby zones:', error);
    return [];
  }
};

// Önerilen zone'lar oluştur (popüler konumlar)
export const getSuggestedZones = (): Omit<LocationZone, 'id' | 'createdAt' | 'triggerCount' | 'latitude' | 'longitude'>[] => {
  return [
    { name: 'Evim', type: 'home', radius: 50, isActive: true },
    { name: 'İş Yerim', type: 'work', radius: 100, isActive: true },
    { name: 'Favori Parkim', type: 'healthy_zone', radius: 200, isActive: true },
    { name: 'Spor Salonum', type: 'healthy_zone', radius: 100, isActive: true },
    { name: 'Eski Sigara Noktam', type: 'trigger_location', radius: 50, isActive: true },
  ];
};







