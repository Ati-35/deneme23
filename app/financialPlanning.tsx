// Akıllı Finansal Planlama
// Yatırım önerileri, enflasyon hesaplama, karşılaştırmalar

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  icon: string;
  color: string;
  category: string;
}

interface InvestmentOption {
  id: string;
  title: string;
  description: string;
  returnRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

interface ComparisonItem {
  title: string;
  amount: number;
  icon: string;
  description: string;
}

// Tasarruf hedefleri
const SAVINGS_GOALS: SavingsGoal[] = [
  { id: '1', title: 'Güzel bir akşam yemeği', targetAmount: 500, icon: 'restaurant', color: '#F59E0B', category: 'Yeme-İçme' },
  { id: '2', title: 'Yeni kulaklık', targetAmount: 2000, icon: 'headset', color: '#8B5CF6', category: 'Teknoloji' },
  { id: '3', title: 'Spor salonu üyeliği (yıllık)', targetAmount: 4000, icon: 'fitness', color: '#10B981', category: 'Sağlık' },
  { id: '4', title: 'Hafta sonu tatili', targetAmount: 8000, icon: 'airplane', color: '#3B82F6', category: 'Seyahat' },
  { id: '5', title: 'Yeni telefon', targetAmount: 35000, icon: 'phone-portrait', color: '#06B6D4', category: 'Teknoloji' },
  { id: '6', title: 'Yurt dışı tatili', targetAmount: 80000, icon: 'earth', color: '#EC4899', category: 'Seyahat' },
  { id: '7', title: 'Araba peşinatı', targetAmount: 200000, icon: 'car', color: '#EF4444', category: 'Ulaşım' },
  { id: '8', title: 'Ev peşinatı', targetAmount: 500000, icon: 'home', color: '#FFD700', category: 'Gayrimenkul' },
];

// Yatırım seçenekleri
const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    id: '1',
    title: 'Vadeli Mevduat',
    description: 'Güvenli ve garantili getiri',
    returnRate: 45,
    riskLevel: 'low',
    icon: 'shield-checkmark',
    color: '#10B981',
  },
  {
    id: '2',
    title: 'Altın',
    description: 'Enflasyona karşı koruma',
    returnRate: 55,
    riskLevel: 'medium',
    icon: 'diamond',
    color: '#FFD700',
  },
  {
    id: '3',
    title: 'Hisse Senedi',
    description: 'Yüksek getiri potansiyeli',
    returnRate: 75,
    riskLevel: 'high',
    icon: 'trending-up',
    color: '#3B82F6',
  },
  {
    id: '4',
    title: 'Yatırım Fonu',
    description: 'Çeşitlendirilmiş portföy',
    returnRate: 50,
    riskLevel: 'medium',
    icon: 'pie-chart',
    color: '#8B5CF6',
  },
];

export default function FinancialPlanningScreen() {
  const [daysSinceQuit, setDaysSinceQuit] = useState(7);
  const [pricePerPack, setPricePerPack] = useState(50);
  const [cigarettesPerDay, setCigarettesPerDay] = useState(20);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year' | '5year'>('year');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await getUserData();
    if (userData) {
      const quitDate = new Date(userData.quitDate);
      const days = Math.floor((Date.now() - quitDate.getTime()) / (1000 * 60 * 60 * 24));
      setDaysSinceQuit(days);
      setPricePerPack(userData.pricePerPack || 50);
      setCigarettesPerDay(userData.cigarettesPerDay || 20);
    }
  };

  // Hesaplamalar
  const dailySavings = pricePerPack;
  const currentSavings = daysSinceQuit * dailySavings;
  const monthlySavings = 30 * dailySavings;
  const yearlySavings = 365 * dailySavings;
  const fiveYearSavings = 5 * yearlySavings;

  // Enflasyon ayarlı hesaplamalar
  const inflationRate = 0.55; // %55 yıllık enflasyon varsayımı
  const realYearlySavings = yearlySavings * (1 + inflationRate);
  const realFiveYearSavings = fiveYearSavings * Math.pow(1 + inflationRate, 5);

  // Karşılaştırma öğeleri
  const comparisons: ComparisonItem[] = [
    {
      title: 'Kahve',
      amount: Math.floor(currentSavings / 50),
      icon: 'cafe',
      description: 'fincan kahve alabilirdin',
    },
    {
      title: 'Sinema',
      amount: Math.floor(currentSavings / 150),
      icon: 'film',
      description: 'sinema bileti alabilirdin',
    },
    {
      title: 'Kitap',
      amount: Math.floor(currentSavings / 100),
      icon: 'book',
      description: 'kitap alabilirdin',
    },
    {
      title: 'Yemek',
      amount: Math.floor(currentSavings / 250),
      icon: 'restaurant',
      description: 'güzel yemek yiyebilirdin',
    },
  ];

  const getPeriodAmount = () => {
    switch (selectedPeriod) {
      case 'month': return monthlySavings;
      case 'year': return yearlySavings;
      case '5year': return fiveYearSavings;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'month': return 'Aylık';
      case 'year': return 'Yıllık';
      case '5year': return '5 Yıllık';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return Colors.textSecondary;
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Düşük Risk';
      case 'medium': return 'Orta Risk';
      case 'high': return 'Yüksek Risk';
      default: return risk;
    }
  };

  const calculateInvestmentReturn = (option: InvestmentOption) => {
    const amount = getPeriodAmount();
    const years = selectedPeriod === 'month' ? 1/12 : selectedPeriod === 'year' ? 1 : 5;
    return Math.round(amount * Math.pow(1 + option.returnRate / 100, years));
  };

  const calculateDaysToGoal = (goal: SavingsGoal) => {
    return Math.ceil((goal.targetAmount - currentSavings) / dailySavings);
  };

  const openGoalDetails = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>💰 Finansal Plan</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Savings Card */}
        <LinearGradient
          colors={[Colors.money, '#D97706']}
          style={styles.mainCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.mainCardHeader}>
            <Ionicons name="wallet" size={32} color="#fff" />
            <Text style={styles.mainCardLabel}>Toplam Tasarruf</Text>
          </View>
          <Text style={styles.mainCardValue}>₺{currentSavings.toLocaleString('tr-TR')}</Text>
          <Text style={styles.mainCardSubtext}>
            {daysSinceQuit} günde biriktirdin
          </Text>
          
          <View style={styles.savingsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>₺{dailySavings}</Text>
              <Text style={styles.breakdownLabel}>Günlük</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>₺{monthlySavings.toLocaleString('tr-TR')}</Text>
              <Text style={styles.breakdownLabel}>Aylık</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>₺{yearlySavings.toLocaleString('tr-TR')}</Text>
              <Text style={styles.breakdownLabel}>Yıllık</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['month', 'year', '5year'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}>
                {period === 'month' ? '1 Ay' : period === 'year' ? '1 Yıl' : '5 Yıl'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* What Could You Buy */}
        <Text style={styles.sectionTitle}>🛒 Bu Parayla Ne Alabilirdin?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.comparisonsContainer}
        >
          {comparisons.map((item, index) => (
            <View key={index} style={styles.comparisonCard}>
              <View style={[styles.comparisonIcon, { backgroundColor: Colors.accent + '20' }]}>
                <Ionicons name={item.icon as any} size={28} color={Colors.accent} />
              </View>
              <Text style={styles.comparisonAmount}>{item.amount}</Text>
              <Text style={styles.comparisonTitle}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Savings Goals */}
        <Text style={styles.sectionTitle}>🎯 Tasarruf Hedefleri</Text>
        <View style={styles.goalsGrid}>
          {SAVINGS_GOALS.slice(0, 6).map(goal => {
            const progress = Math.min(100, (currentSavings / goal.targetAmount) * 100);
            const isAchieved = currentSavings >= goal.targetAmount;
            const daysLeft = calculateDaysToGoal(goal);
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isAchieved && styles.goalCardAchieved,
                ]}
                onPress={() => openGoalDetails(goal)}
              >
                <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                  <Ionicons 
                    name={goal.icon as any} 
                    size={24} 
                    color={isAchieved ? Colors.success : goal.color} 
                  />
                  {isAchieved && (
                    <View style={styles.achievedBadge}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                <Text style={styles.goalAmount}>₺{goal.targetAmount.toLocaleString('tr-TR')}</Text>
                
                <View style={styles.goalProgress}>
                  <View style={styles.goalProgressBar}>
                    <View 
                      style={[
                        styles.goalProgressFill,
                        { 
                          width: `${progress}%`,
                          backgroundColor: isAchieved ? Colors.success : goal.color,
                        },
                      ]} 
                    />
                  </View>
                  <Text style={styles.goalProgressText}>
                    {isAchieved ? '✓' : `${daysLeft}g`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Investment Simulation */}
        <Text style={styles.sectionTitle}>📈 Yatırım Simülasyonu</Text>
        <Text style={styles.sectionSubtitle}>
          {getPeriodLabel()} tasarrufunu ({`₺${getPeriodAmount().toLocaleString('tr-TR')}`}) yatırsaydın:
        </Text>
        
        <View style={styles.investmentList}>
          {INVESTMENT_OPTIONS.map(option => {
            const futureValue = calculateInvestmentReturn(option);
            const profit = futureValue - getPeriodAmount();
            
            return (
              <View key={option.id} style={styles.investmentCard}>
                <View style={[styles.investmentIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                
                <View style={styles.investmentInfo}>
                  <View style={styles.investmentHeader}>
                    <Text style={styles.investmentTitle}>{option.title}</Text>
                    <View style={[styles.riskBadge, { backgroundColor: getRiskColor(option.riskLevel) + '20' }]}>
                      <Text style={[styles.riskText, { color: getRiskColor(option.riskLevel) }]}>
                        {getRiskLabel(option.riskLevel)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.investmentDesc}>{option.description}</Text>
                  <View style={styles.investmentReturn}>
                    <Text style={styles.investmentReturnLabel}>Tahmini Değer:</Text>
                    <Text style={styles.investmentReturnValue}>
                      ₺{futureValue.toLocaleString('tr-TR')}
                    </Text>
                    <Text style={styles.investmentProfit}>
                      (+₺{profit.toLocaleString('tr-TR')})
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Inflation Warning */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Enflasyon Etkisi</Text>
            <Text style={styles.infoText}>
              %55 yıllık enflasyon ile bugünkü tasarrufun gelecek yıl ₺{Math.round(yearlySavings / (1 + inflationRate)).toLocaleString('tr-TR')} değerinde olacak.
              Paranı değerlendirmek için yatırım yapmayı düşün!
            </Text>
          </View>
        </View>

        {/* Health Savings */}
        <Text style={styles.sectionTitle}>💊 Sağlık Tasarrufu</Text>
        <View style={styles.healthSavingsCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.healthSavingsGradient}
          >
            <View style={styles.healthSavingsRow}>
              <View style={styles.healthSavingsItem}>
                <Ionicons name="medkit" size={24} color="#fff" />
                <Text style={styles.healthSavingsValue}>~₺5,000</Text>
                <Text style={styles.healthSavingsLabel}>Yıllık sağlık masrafı tasarrufu</Text>
              </View>
              <View style={styles.healthSavingsDivider} />
              <View style={styles.healthSavingsItem}>
                <Ionicons name="heart" size={24} color="#fff" />
                <Text style={styles.healthSavingsValue}>~₺50,000</Text>
                <Text style={styles.healthSavingsLabel}>10 yıllık potansiyel tasarruf</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Goal Detail Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedGoal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIcon, { backgroundColor: selectedGoal.color + '20' }]}>
                    <Ionicons name={selectedGoal.icon as any} size={32} color={selectedGoal.color} />
                  </View>
                  <TouchableOpacity 
                    style={styles.modalClose}
                    onPress={() => setShowGoalModal(false)}
                  >
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedGoal.title}</Text>
                <Text style={styles.modalCategory}>{selectedGoal.category}</Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Hedef</Text>
                    <Text style={styles.modalStatValue}>
                      ₺{selectedGoal.targetAmount.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Mevcut</Text>
                    <Text style={[styles.modalStatValue, { color: Colors.primary }]}>
                      ₺{currentSavings.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Kalan</Text>
                    <Text style={styles.modalStatValue}>
                      ₺{Math.max(0, selectedGoal.targetAmount - currentSavings).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalProgress}>
                  <View style={styles.modalProgressBar}>
                    <View 
                      style={[
                        styles.modalProgressFill,
                        { 
                          width: `${Math.min(100, (currentSavings / selectedGoal.targetAmount) * 100)}%`,
                          backgroundColor: selectedGoal.color,
                        },
                      ]} 
                    />
                  </View>
                  <Text style={styles.modalProgressText}>
                    {Math.round((currentSavings / selectedGoal.targetAmount) * 100)}%
                  </Text>
                </View>

                {currentSavings < selectedGoal.targetAmount ? (
                  <View style={styles.modalInfo}>
                    <Ionicons name="time" size={20} color={Colors.accent} />
                    <Text style={styles.modalInfoText}>
                      Bu hedefe ulaşmak için {calculateDaysToGoal(selectedGoal)} gün daha sigarasız kal!
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.modalInfo, { backgroundColor: Colors.success + '20' }]}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={[styles.modalInfoText, { color: Colors.success }]}>
                      Tebrikler! Bu hedefe ulaştın! 🎉
                    </Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowGoalModal(false)}
                >
                  <Text style={styles.modalButtonText}>Tamam</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mainCardLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  mainCardValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  mainCardSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  savingsBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  comparisonsContainer: {
    paddingBottom: 10,
    marginBottom: 16,
  },
  comparisonCard: {
    width: 100,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  comparisonAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  comparisonTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  goalCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardAchieved: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 25,
    textAlign: 'right',
  },
  investmentList: {
    marginBottom: 24,
  },
  investmentCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  investmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  investmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  investmentDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  investmentReturn: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  investmentReturnLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  investmentReturnValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8,
  },
  investmentProfit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  healthSavingsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  healthSavingsGradient: {
    padding: 20,
  },
  healthSavingsRow: {
    flexDirection: 'row',
  },
  healthSavingsItem: {
    flex: 1,
    alignItems: 'center',
  },
  healthSavingsValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  healthSavingsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  healthSavingsDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  modalProgress: {
    marginBottom: 16,
  },
  modalProgressBar: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  modalProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '15',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});







