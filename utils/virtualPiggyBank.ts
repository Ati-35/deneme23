// Sanal Kumbara Sistemi
// Otomatik para ekleme, hedef kumbaralar, animasyonlar

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from './storage';

// Types
export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  category: string;
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
  autoContribute: boolean; // Otomatik para ekleme
  dailyContribution?: number; // Günlük otomatik katkı
}

export interface PiggyBankTransaction {
  id: string;
  piggyBankId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'auto' | 'bonus';
  description: string;
  timestamp: string;
}

export interface PiggyBankStats {
  totalSaved: number;
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  averageProgress: number;
  biggestGoal: PiggyBank | null;
  closestToCompletion: PiggyBank | null;
}

// Storage Keys
const KEYS = {
  PIGGY_BANKS: '@piggy_banks',
  TRANSACTIONS: '@piggy_transactions',
  LAST_AUTO_CONTRIBUTE: '@last_auto_contribute',
};

// Varsayılan hedef şablonları
export const GOAL_TEMPLATES: Omit<PiggyBank, 'id' | 'currentAmount' | 'createdAt' | 'isCompleted' | 'autoContribute'>[] = [
  { name: 'Güzel bir akşam yemeği', targetAmount: 500, icon: 'restaurant', color: '#F59E0B', category: 'Yeme-İçme' },
  { name: 'Yeni kulaklık', targetAmount: 2000, icon: 'headset', color: '#8B5CF6', category: 'Teknoloji' },
  { name: 'Spor malzemeleri', targetAmount: 3000, icon: 'fitness', color: '#10B981', category: 'Sağlık' },
  { name: 'Hafta sonu tatili', targetAmount: 5000, icon: 'airplane', color: '#3B82F6', category: 'Seyahat' },
  { name: 'Akıllı saat', targetAmount: 8000, icon: 'watch', color: '#06B6D4', category: 'Teknoloji' },
  { name: 'Yeni telefon', targetAmount: 35000, icon: 'phone-portrait', color: '#EC4899', category: 'Teknoloji' },
  { name: 'Yurt dışı tatili', targetAmount: 80000, icon: 'earth', color: '#EF4444', category: 'Seyahat' },
  { name: 'Araba peşinatı', targetAmount: 200000, icon: 'car', color: '#FFD700', category: 'Ulaşım' },
];

// Kumbara oluştur
export const createPiggyBank = async (
  piggyBank: Omit<PiggyBank, 'id' | 'currentAmount' | 'createdAt' | 'isCompleted'>
): Promise<PiggyBank> => {
  try {
    const piggyBanks = await getPiggyBanks();
    
    const newPiggyBank: PiggyBank = {
      ...piggyBank,
      id: Date.now().toString(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };
    
    piggyBanks.push(newPiggyBank);
    await AsyncStorage.setItem(KEYS.PIGGY_BANKS, JSON.stringify(piggyBanks));
    
    return newPiggyBank;
  } catch (error) {
    console.error('Error creating piggy bank:', error);
    throw error;
  }
};

// Kumbaraları getir
export const getPiggyBanks = async (): Promise<PiggyBank[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PIGGY_BANKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting piggy banks:', error);
    return [];
  }
};

// Kumbara güncelle
export const updatePiggyBank = async (
  id: string,
  updates: Partial<PiggyBank>
): Promise<PiggyBank | null> => {
  try {
    const piggyBanks = await getPiggyBanks();
    const index = piggyBanks.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    piggyBanks[index] = { ...piggyBanks[index], ...updates };
    
    // Tamamlanma kontrolü
    if (piggyBanks[index].currentAmount >= piggyBanks[index].targetAmount && !piggyBanks[index].isCompleted) {
      piggyBanks[index].isCompleted = true;
      piggyBanks[index].completedAt = new Date().toISOString();
    }
    
    await AsyncStorage.setItem(KEYS.PIGGY_BANKS, JSON.stringify(piggyBanks));
    
    return piggyBanks[index];
  } catch (error) {
    console.error('Error updating piggy bank:', error);
    return null;
  }
};

// Kumbaraya para ekle
export const addToPiggyBank = async (
  id: string,
  amount: number,
  type: 'deposit' | 'auto' | 'bonus' = 'deposit',
  description: string = ''
): Promise<PiggyBank | null> => {
  try {
    const piggyBank = (await getPiggyBanks()).find(p => p.id === id);
    if (!piggyBank) return null;
    
    const newAmount = Math.min(piggyBank.currentAmount + amount, piggyBank.targetAmount * 1.1); // Max %110
    
    await updatePiggyBank(id, { currentAmount: newAmount });
    
    // İşlem kaydı
    await addTransaction({
      id: Date.now().toString(),
      piggyBankId: id,
      amount,
      type,
      description: description || `${type === 'auto' ? 'Otomatik katkı' : type === 'bonus' ? 'Bonus' : 'Para eklendi'}`,
      timestamp: new Date().toISOString(),
    });
    
    return (await getPiggyBanks()).find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error adding to piggy bank:', error);
    return null;
  }
};

// Kumbaradan para çek
export const withdrawFromPiggyBank = async (
  id: string,
  amount: number,
  description: string = ''
): Promise<PiggyBank | null> => {
  try {
    const piggyBank = (await getPiggyBanks()).find(p => p.id === id);
    if (!piggyBank || piggyBank.currentAmount < amount) return null;
    
    const newAmount = piggyBank.currentAmount - amount;
    
    await updatePiggyBank(id, { currentAmount: newAmount });
    
    await addTransaction({
      id: Date.now().toString(),
      piggyBankId: id,
      amount: -amount,
      type: 'withdrawal',
      description: description || 'Para çekildi',
      timestamp: new Date().toISOString(),
    });
    
    return (await getPiggyBanks()).find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error withdrawing from piggy bank:', error);
    return null;
  }
};

// Kumbarayı sil
export const deletePiggyBank = async (id: string): Promise<boolean> => {
  try {
    const piggyBanks = await getPiggyBanks();
    const filtered = piggyBanks.filter(p => p.id !== id);
    await AsyncStorage.setItem(KEYS.PIGGY_BANKS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting piggy bank:', error);
    return false;
  }
};

// İşlem kaydet
const addTransaction = async (transaction: PiggyBankTransaction): Promise<void> => {
  try {
    const transactions = await getTransactions();
    transactions.push(transaction);
    
    // Son 500 işlemi tut
    const recentTransactions = transactions.slice(-500);
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(recentTransactions));
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
};

// İşlemleri getir
export const getTransactions = async (piggyBankId?: string): Promise<PiggyBankTransaction[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    const transactions: PiggyBankTransaction[] = data ? JSON.parse(data) : [];
    
    if (piggyBankId) {
      return transactions.filter(t => t.piggyBankId === piggyBankId);
    }
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

// Otomatik katkı (günlük tasarruftan)
export const processAutoContribution = async (): Promise<number> => {
  try {
    const userData = await getUserData();
    if (!userData) return 0;
    
    const lastContribute = await AsyncStorage.getItem(KEYS.LAST_AUTO_CONTRIBUTE);
    const today = new Date().toISOString().split('T')[0];
    
    if (lastContribute === today) {
      return 0; // Bugün zaten katkı yapılmış
    }
    
    const dailySavings = userData.pricePerPack || 50;
    const piggyBanks = await getPiggyBanks();
    const activePiggyBanks = piggyBanks.filter(p => !p.isCompleted && p.autoContribute);
    
    if (activePiggyBanks.length === 0) return 0;
    
    // Eşit dağıtım
    const amountPerBank = Math.floor(dailySavings / activePiggyBanks.length);
    let totalContributed = 0;
    
    for (const piggyBank of activePiggyBanks) {
      const contribution = piggyBank.dailyContribution || amountPerBank;
      const actualContribution = Math.min(
        contribution,
        piggyBank.targetAmount - piggyBank.currentAmount
      );
      
      if (actualContribution > 0) {
        await addToPiggyBank(
          piggyBank.id,
          actualContribution,
          'auto',
          'Günlük otomatik katkı'
        );
        totalContributed += actualContribution;
      }
    }
    
    await AsyncStorage.setItem(KEYS.LAST_AUTO_CONTRIBUTE, today);
    
    return totalContributed;
  } catch (error) {
    console.error('Error processing auto contribution:', error);
    return 0;
  }
};

// İstatistikleri getir
export const getPiggyBankStats = async (): Promise<PiggyBankStats> => {
  try {
    const piggyBanks = await getPiggyBanks();
    
    const totalSaved = piggyBanks.reduce((sum, p) => sum + p.currentAmount, 0);
    const completedGoals = piggyBanks.filter(p => p.isCompleted);
    const activeGoals = piggyBanks.filter(p => !p.isCompleted);
    
    const progressValues = piggyBanks.map(p => 
      p.targetAmount > 0 ? (p.currentAmount / p.targetAmount) * 100 : 0
    );
    const averageProgress = progressValues.length > 0
      ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      : 0;
    
    const biggestGoal = [...piggyBanks].sort((a, b) => b.targetAmount - a.targetAmount)[0] || null;
    
    const closestToCompletion = [...activeGoals]
      .filter(p => p.targetAmount > 0)
      .sort((a, b) => 
        (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount)
      )[0] || null;
    
    return {
      totalSaved,
      totalGoals: piggyBanks.length,
      completedGoals: completedGoals.length,
      activeGoals: activeGoals.length,
      averageProgress: Math.round(averageProgress),
      biggestGoal,
      closestToCompletion,
    };
  } catch (error) {
    console.error('Error getting piggy bank stats:', error);
    return {
      totalSaved: 0,
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      averageProgress: 0,
      biggestGoal: null,
      closestToCompletion: null,
    };
  }
};

// Hedefe ne kadar kaldığını hesapla
export const getDaysToGoal = async (id: string): Promise<number | null> => {
  try {
    const userData = await getUserData();
    const piggyBank = (await getPiggyBanks()).find(p => p.id === id);
    
    if (!piggyBank || !userData) return null;
    
    const remaining = piggyBank.targetAmount - piggyBank.currentAmount;
    if (remaining <= 0) return 0;
    
    const dailySavings = userData.pricePerPack || 50;
    return Math.ceil(remaining / dailySavings);
  } catch (error) {
    console.error('Error calculating days to goal:', error);
    return null;
  }
};

// Hedef tamamlama tarihi tahmini
export const getEstimatedCompletionDate = async (id: string): Promise<Date | null> => {
  try {
    const days = await getDaysToGoal(id);
    if (days === null || days === 0) return null;
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  } catch (error) {
    console.error('Error getting estimated completion date:', error);
    return null;
  }
};

// Kumbara ilerleme yüzdesini hesapla
export const getProgressPercentage = (piggyBank: PiggyBank): number => {
  if (piggyBank.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((piggyBank.currentAmount / piggyBank.targetAmount) * 100));
};

// Bonus hesaplama (seri için)
export const calculateStreakBonus = (streakDays: number): number => {
  if (streakDays >= 365) return 50;
  if (streakDays >= 180) return 30;
  if (streakDays >= 90) return 20;
  if (streakDays >= 30) return 10;
  if (streakDays >= 7) return 5;
  return 0;
};

// Seri bonusu ekle
export const applyStreakBonus = async (streakDays: number): Promise<number> => {
  try {
    const bonus = calculateStreakBonus(streakDays);
    if (bonus <= 0) return 0;
    
    const piggyBanks = await getPiggyBanks();
    const activePiggyBank = piggyBanks.find(p => !p.isCompleted && p.autoContribute);
    
    if (activePiggyBank) {
      await addToPiggyBank(
        activePiggyBank.id,
        bonus,
        'bonus',
        `${streakDays} günlük seri bonusu!`
      );
      return bonus;
    }
    
    return 0;
  } catch (error) {
    console.error('Error applying streak bonus:', error);
    return 0;
  }
};

// Kumbara rengi belirleme (ilerlemeye göre)
export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return '#10B981';
  if (progress >= 75) return '#22C55E';
  if (progress >= 50) return '#F59E0B';
  if (progress >= 25) return '#F97316';
  return '#EF4444';
};

// Motivasyon mesajı
export const getMotivationalMessage = (piggyBank: PiggyBank): string => {
  const progress = getProgressPercentage(piggyBank);
  
  if (progress >= 100) {
    return `🎉 Tebrikler! "${piggyBank.name}" hedefine ulaştın!`;
  }
  if (progress >= 75) {
    return `🔥 Harika! Son düzlüğe girdin, hedefe çok yakınsın!`;
  }
  if (progress >= 50) {
    return `💪 Yarıyı geçtin! Devam et, başarıyorsun!`;
  }
  if (progress >= 25) {
    return `🌟 İyi gidiyorsun! Her gün hedefe bir adım daha yaklaşıyorsun.`;
  }
  return `🚀 Yolculuk başladı! Her sigara içmediğin gün seni hedefe yaklaştırıyor.`;
};







