// Kalıcı Veri Depolama
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  name: string;
  email: string;
  quitDate: string; // ISO string
  cigarettesPerDay: number;
  pricePerPack: number;
  isOnboarded: boolean;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  cravingLevel: number; // 1-10
  triggers: string[];
  notes: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  icon: string;
  color: string;
  isCompleted: boolean;
}

const KEYS = {
  USER_DATA: '@user_data',
  MOOD_ENTRIES: '@mood_entries',
  SAVINGS_GOALS: '@savings_goals',
  SOS_USED_COUNT: '@sos_used_count',
};

// Kullanıcı Verileri
export const saveUserData = async (data: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Mood Entries
export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  try {
    const entries = await getMoodEntries();
    entries.unshift(entry);
    await AsyncStorage.setItem(KEYS.MOOD_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving mood entry:', error);
  }
};

export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.MOOD_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting mood entries:', error);
    return [];
  }
};

// Savings Goals
export const saveSavingsGoals = async (goals: SavingsGoal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving savings goals:', error);
  }
};

export const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SAVINGS_GOALS);
    return data ? JSON.parse(data) : getDefaultSavingsGoals();
  } catch (error) {
    console.error('Error getting savings goals:', error);
    return getDefaultSavingsGoals();
  }
};

// Varsayılan Tasarruf Hedefleri
export const getDefaultSavingsGoals = (): SavingsGoal[] => [
  {
    id: '1',
    title: 'Güzel bir akşam yemeği',
    targetAmount: 500,
    icon: 'restaurant',
    color: '#F59E0B',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Yeni kulaklık',
    targetAmount: 2000,
    icon: 'headset',
    color: '#8B5CF6',
    isCompleted: false,
  },
  {
    id: '3',
    title: 'Hafta sonu tatili',
    targetAmount: 5000,
    icon: 'airplane',
    color: '#3B82F6',
    isCompleted: false,
  },
  {
    id: '4',
    title: 'Yeni telefon',
    targetAmount: 30000,
    icon: 'phone-portrait',
    color: '#10B981',
    isCompleted: false,
  },
  {
    id: '5',
    title: 'Yurt dışı tatili',
    targetAmount: 100000,
    icon: 'earth',
    color: '#EF4444',
    isCompleted: false,
  },
];

// SOS Kullanım Sayısı
export const incrementSOSCount = async (): Promise<number> => {
  try {
    const count = await getSOSCount();
    const newCount = count + 1;
    await AsyncStorage.setItem(KEYS.SOS_USED_COUNT, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing SOS count:', error);
    return 0;
  }
};

export const getSOSCount = async (): Promise<number> => {
  try {
    const count = await AsyncStorage.getItem(KEYS.SOS_USED_COUNT);
    return count ? parseInt(count) : 0;
  } catch (error) {
    console.error('Error getting SOS count:', error);
    return 0;
  }
};

// Tüm verileri temizle
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};




