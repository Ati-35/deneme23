// Financial Tracker - Gelişmiş Tasarruf Takip Sistemi
// Tasarruf hedefleri, harcama analizi, görselleştirme

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface SpendingItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  canBuy: boolean;
  isPurchased: boolean;
  purchasedAt?: string;
}

export interface FinancialStats {
  totalSavings: number;
  dailySavings: number;
  weeklySavings: number;
  monthlySavings: number;
  yearlySavings: number;
  cigarettePackPrice: number;
  cigarettesPerDay: number;
  daysSmokeFree: number;
  totalCigarettesAvoided: number;
  projectedYearlySavings: number;
  lifetimeSavings: number;
}

export interface MilestoneReward {
  id: string;
  name: string;
  description: string;
  savingsRequired: number;
  icon: string;
  claimed: boolean;
  claimedAt?: string;
}

export interface SavingsHistory {
  date: string;
  amount: number;
  cumulative: number;
}

// Storage Keys
const STORAGE_KEYS = {
  GOALS: '@savings_goals',
  SETTINGS: '@financial_settings',
  HISTORY: '@savings_history',
  REWARDS: '@milestone_rewards',
  PURCHASES: '@virtual_purchases',
};

// Default Settings
export interface FinancialSettings {
  cigarettePackPrice: number;
  cigarettesPerPack: number;
  cigarettesPerDay: number;
  quitDate: string;
  currency: string;
}

const DEFAULT_SETTINGS: FinancialSettings = {
  cigarettePackPrice: 50, // TL
  cigarettesPerPack: 20,
  cigarettesPerDay: 20,
  quitDate: new Date().toISOString(),
  currency: '₺',
};

// Suggested Items to Buy
export const SUGGESTED_ITEMS: SpendingItem[] = [
  { id: 'coffee', name: 'Kahve', price: 50, icon: '☕', canBuy: false, isPurchased: false },
  { id: 'book', name: 'Kitap', price: 100, icon: '📚', canBuy: false, isPurchased: false },
  { id: 'movie', name: 'Sinema Bileti', price: 150, icon: '🎬', canBuy: false, isPurchased: false },
  { id: 'dinner', name: 'Güzel Bir Akşam Yemeği', price: 300, icon: '🍽️', canBuy: false, isPurchased: false },
  { id: 'headphones', name: 'Kulaklık', price: 500, icon: '🎧', canBuy: false, isPurchased: false },
  { id: 'shoes', name: 'Spor Ayakkabı', price: 1000, icon: '👟', canBuy: false, isPurchased: false },
  { id: 'smartwatch', name: 'Akıllı Saat', price: 2000, icon: '⌚', canBuy: false, isPurchased: false },
  { id: 'weekend', name: 'Hafta Sonu Tatili', price: 3000, icon: '🏖️', canBuy: false, isPurchased: false },
  { id: 'phone', name: 'Yeni Telefon', price: 15000, icon: '📱', canBuy: false, isPurchased: false },
  { id: 'laptop', name: 'Laptop', price: 25000, icon: '💻', canBuy: false, isPurchased: false },
  { id: 'vacation', name: 'Yurt Dışı Tatili', price: 50000, icon: '✈️', canBuy: false, isPurchased: false },
  { id: 'car', name: 'Araba Peşinatı', price: 100000, icon: '🚗', canBuy: false, isPurchased: false },
];

// Milestone Rewards
export const MILESTONE_REWARDS: MilestoneReward[] = [
  { id: 'm1', name: 'İlk Tasarruf', description: 'İlk ₺100 biriktirdin!', savingsRequired: 100, icon: '🎯', claimed: false },
  { id: 'm2', name: 'Yarım Bin', description: '₺500 biriktirdin!', savingsRequired: 500, icon: '💫', claimed: false },
  { id: 'm3', name: 'Bin TL', description: '₺1,000 biriktirdin!', savingsRequired: 1000, icon: '🏆', claimed: false },
  { id: 'm4', name: 'İki Bin', description: '₺2,000 biriktirdin!', savingsRequired: 2000, icon: '🌟', claimed: false },
  { id: 'm5', name: 'Beş Bin', description: '₺5,000 biriktirdin!', savingsRequired: 5000, icon: '💎', claimed: false },
  { id: 'm6', name: 'On Bin', description: '₺10,000 biriktirdin!', savingsRequired: 10000, icon: '👑', claimed: false },
  { id: 'm7', name: 'Yirmi Beş Bin', description: '₺25,000 biriktirdin!', savingsRequired: 25000, icon: '🎖️', claimed: false },
  { id: 'm8', name: 'Elli Bin', description: '₺50,000 biriktirdin!', savingsRequired: 50000, icon: '🏅', claimed: false },
  { id: 'm9', name: 'Yüz Bin', description: '₺100,000 biriktirdin!', savingsRequired: 100000, icon: '🌈', claimed: false },
];

// Get Financial Settings
export async function getFinancialSettings(): Promise<FinancialSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error getting financial settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Save Financial Settings
export async function saveFinancialSettings(settings: Partial<FinancialSettings>): Promise<void> {
  try {
    const current = await getFinancialSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving financial settings:', error);
  }
}

// Calculate Financial Stats
export async function calculateFinancialStats(): Promise<FinancialStats> {
  const settings = await getFinancialSettings();
  
  const quitDate = new Date(settings.quitDate);
  const now = new Date();
  const diffMs = now.getTime() - quitDate.getTime();
  const daysSmokeFree = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  
  const pricePerCigarette = settings.cigarettePackPrice / settings.cigarettesPerPack;
  const dailyCost = pricePerCigarette * settings.cigarettesPerDay;
  
  const totalSavings = dailyCost * daysSmokeFree;
  const weeklySavings = dailyCost * 7;
  const monthlySavings = dailyCost * 30;
  const yearlySavings = dailyCost * 365;
  const totalCigarettesAvoided = settings.cigarettesPerDay * daysSmokeFree;
  
  // Projected lifetime savings (assuming 40 more years)
  const lifetimeSavings = yearlySavings * 40;
  
  return {
    totalSavings: Math.round(totalSavings * 100) / 100,
    dailySavings: Math.round(dailyCost * 100) / 100,
    weeklySavings: Math.round(weeklySavings * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    yearlySavings: Math.round(yearlySavings * 100) / 100,
    cigarettePackPrice: settings.cigarettePackPrice,
    cigarettesPerDay: settings.cigarettesPerDay,
    daysSmokeFree,
    totalCigarettesAvoided,
    projectedYearlySavings: Math.round(yearlySavings * 100) / 100,
    lifetimeSavings: Math.round(lifetimeSavings * 100) / 100,
  };
}

// Savings Goals
export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting savings goals:', error);
  }
  return [];
}

export async function addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'isCompleted' | 'currentAmount'>): Promise<SavingsGoal> {
  const goals = await getSavingsGoals();
  const stats = await calculateFinancialStats();
  
  const newGoal: SavingsGoal = {
    ...goal,
    id: `goal_${Date.now()}`,
    createdAt: new Date().toISOString(),
    isCompleted: stats.totalSavings >= goal.targetAmount,
    currentAmount: Math.min(stats.totalSavings, goal.targetAmount),
  };
  
  if (newGoal.isCompleted) {
    newGoal.completedAt = new Date().toISOString();
  }
  
  goals.push(newGoal);
  await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  
  return newGoal;
}

export async function updateGoalProgress(): Promise<SavingsGoal[]> {
  const goals = await getSavingsGoals();
  const stats = await calculateFinancialStats();
  
  const updatedGoals = goals.map(goal => {
    if (!goal.isCompleted) {
      goal.currentAmount = Math.min(stats.totalSavings, goal.targetAmount);
      if (goal.currentAmount >= goal.targetAmount) {
        goal.isCompleted = true;
        goal.completedAt = new Date().toISOString();
      }
    }
    return goal;
  });
  
  await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
  return updatedGoals;
}

export async function deleteSavingsGoal(goalId: string): Promise<void> {
  const goals = await getSavingsGoals();
  const filtered = goals.filter(g => g.id !== goalId);
  await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
}

// Get available items to buy
export async function getAvailableItems(): Promise<SpendingItem[]> {
  const stats = await calculateFinancialStats();
  
  try {
    const purchasedData = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASES);
    const purchased: string[] = purchasedData ? JSON.parse(purchasedData) : [];
    
    return SUGGESTED_ITEMS.map(item => ({
      ...item,
      canBuy: stats.totalSavings >= item.price,
      isPurchased: purchased.includes(item.id),
    }));
  } catch (error) {
    console.error('Error getting available items:', error);
    return SUGGESTED_ITEMS.map(item => ({
      ...item,
      canBuy: stats.totalSavings >= item.price,
    }));
  }
}

// Mark item as purchased (virtual)
export async function markItemPurchased(itemId: string): Promise<void> {
  try {
    const purchasedData = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASES);
    const purchased: string[] = purchasedData ? JSON.parse(purchasedData) : [];
    
    if (!purchased.includes(itemId)) {
      purchased.push(itemId);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchased));
    }
  } catch (error) {
    console.error('Error marking item purchased:', error);
  }
}

// Milestone Rewards
export async function getMilestoneRewards(): Promise<MilestoneReward[]> {
  const stats = await calculateFinancialStats();
  
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
    const claimedRewards: { [key: string]: string } = data ? JSON.parse(data) : {};
    
    return MILESTONE_REWARDS.map(reward => ({
      ...reward,
      claimed: !!claimedRewards[reward.id],
      claimedAt: claimedRewards[reward.id],
    }));
  } catch (error) {
    console.error('Error getting milestone rewards:', error);
    return MILESTONE_REWARDS;
  }
}

export async function claimMilestoneReward(rewardId: string): Promise<boolean> {
  const stats = await calculateFinancialStats();
  const reward = MILESTONE_REWARDS.find(r => r.id === rewardId);
  
  if (!reward || stats.totalSavings < reward.savingsRequired) {
    return false;
  }
  
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REWARDS);
    const claimedRewards: { [key: string]: string } = data ? JSON.parse(data) : {};
    
    if (!claimedRewards[rewardId]) {
      claimedRewards[rewardId] = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(claimedRewards));
      return true;
    }
  } catch (error) {
    console.error('Error claiming milestone reward:', error);
  }
  
  return false;
}

// Savings History (for charts)
export async function getSavingsHistory(days: number = 30): Promise<SavingsHistory[]> {
  const settings = await getFinancialSettings();
  const quitDate = new Date(settings.quitDate);
  const pricePerCigarette = settings.cigarettePackPrice / settings.cigarettesPerPack;
  const dailySavings = pricePerCigarette * settings.cigarettesPerDay;
  
  const history: SavingsHistory[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const daysSinceQuit = Math.max(0, Math.floor((date.getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24)));
    const cumulative = dailySavings * daysSinceQuit;
    
    history.push({
      date: date.toISOString().split('T')[0],
      amount: daysSinceQuit > 0 ? dailySavings : 0,
      cumulative: Math.round(cumulative * 100) / 100,
    });
  }
  
  return history;
}

// Format currency
export function formatCurrency(amount: number, currency: string = '₺'): string {
  return `${currency}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Get savings comparison
export interface SavingsComparison {
  item: string;
  icon: string;
  count: number;
}

export function getSavingsComparisons(totalSavings: number): SavingsComparison[] {
  return [
    { item: 'Kahve', icon: '☕', count: Math.floor(totalSavings / 50) },
    { item: 'Kitap', icon: '📚', count: Math.floor(totalSavings / 100) },
    { item: 'Sinema', icon: '🎬', count: Math.floor(totalSavings / 150) },
    { item: 'Restoran', icon: '🍽️', count: Math.floor(totalSavings / 300) },
    { item: 'Konser', icon: '🎵', count: Math.floor(totalSavings / 500) },
  ].filter(item => item.count > 0);
}

export default {
  getFinancialSettings,
  saveFinancialSettings,
  calculateFinancialStats,
  getSavingsGoals,
  addSavingsGoal,
  updateGoalProgress,
  deleteSavingsGoal,
  getAvailableItems,
  markItemPurchased,
  getMilestoneRewards,
  claimMilestoneReward,
  getSavingsHistory,
  formatCurrency,
  getSavingsComparisons,
  SUGGESTED_ITEMS,
  MILESTONE_REWARDS,
};




