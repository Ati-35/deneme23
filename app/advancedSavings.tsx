// Advanced Savings - Gelişmiş Finansal Takip
// Tasarruf hedefleri, karşılaştırma, milestone ödülleri

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SemanticColors, Palette, Gradients, withAlpha } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import {
  calculateFinancialStats,
  getAvailableItems,
  getMilestoneRewards,
  getSavingsGoals,
  addSavingsGoal,
  claimMilestoneReward,
  getSavingsComparisons,
  formatCurrency,
  FinancialStats,
  SpendingItem,
  MilestoneReward,
  SavingsGoal,
} from '../utils/financialTracker';
import { Confetti, CelebrationModal } from '../components/celebrations/ConfettiEffect';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

export default function AdvancedSavingsScreen() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [items, setItems] = useState<SpendingItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneReward[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  
  const countAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (stats) {
      Animated.timing(countAnim, {
        toValue: stats.totalSavings,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }
  }, [stats]);

  const loadData = async () => {
    const [statsData, itemsData, milestonesData, goalsData] = await Promise.all([
      calculateFinancialStats(),
      getAvailableItems(),
      getMilestoneRewards(),
      getSavingsGoals(),
    ]);
    
    setStats(statsData);
    setItems(itemsData);
    setMilestones(milestonesData);
    setGoals(goalsData);
  };

  const handleClaimMilestone = async (rewardId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const success = await claimMilestoneReward(rewardId);
    
    if (success) {
      const reward = milestones.find(m => m.id === rewardId);
      setCelebrationData({
        title: 'Milestone Ödülü! 🎉',
        subtitle: reward?.description,
        icon: reward?.icon,
      });
      setShowCelebration(true);
      loadData();
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalName || !newGoalAmount) return;
    
    await addSavingsGoal({
      name: newGoalName,
      targetAmount: parseInt(newGoalAmount),
      icon: '🎯',
      color: Palette.accent[500],
      priority: 'medium',
    });
    
    setNewGoalName('');
    setNewGoalAmount('');
    setShowAddGoal(false);
    loadData();
  };

  const comparisons = stats ? getSavingsComparisons(stats.totalSavings) : [];

  if (!stats) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Confetti active={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      <CelebrationModal
        visible={showCelebration && celebrationData}
        type="milestone"
        title={celebrationData?.title || ''}
        subtitle={celebrationData?.subtitle}
        icon={celebrationData?.icon}
        onClose={() => setShowCelebration(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tasarruf Merkezi</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Savings Card */}
        <FadeIn delay={100}>
          <View style={styles.mainCard}>
            <LinearGradient
              colors={['#F59E0B', '#D97706', '#B45309']}
              style={styles.mainGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.mainDecor1} />
              <View style={styles.mainDecor2} />
              
              <View style={styles.mainContent}>
                <View style={styles.coinContainer}>
                  <Text style={styles.coinEmoji}>💰</Text>
                </View>
                
                <Text style={styles.savingsLabel}>Toplam Tasarruf</Text>
                <Animated.Text style={styles.savingsAmount}>
                  {countAnim.interpolate({
                    inputRange: [0, stats.totalSavings],
                    outputRange: ['₺0', formatCurrency(stats.totalSavings)],
                  })}
                </Animated.Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{formatCurrency(stats.dailySavings)}</Text>
                    <Text style={styles.statBoxLabel}>Günlük</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{formatCurrency(stats.weeklySavings)}</Text>
                    <Text style={styles.statBoxLabel}>Haftalık</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxValue}>{formatCurrency(stats.monthlySavings)}</Text>
                    <Text style={styles.statBoxLabel}>Aylık</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </FadeIn>

        {/* Projections Card */}
        <FadeIn delay={200}>
          <View style={styles.projectionsCard}>
            <Text style={styles.projectionsTitle}>📈 Projeksiyon</Text>
            <View style={styles.projectionsGrid}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionValue}>{formatCurrency(stats.yearlySavings)}</Text>
                <Text style={styles.projectionLabel}>Yıllık Tasarruf</Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionValue}>{formatCurrency(stats.lifetimeSavings)}</Text>
                <Text style={styles.projectionLabel}>Ömür Boyu</Text>
              </View>
            </View>
            <Text style={styles.projectionsHint}>
              * 40 yıl sigarasız kaldığınızda biriktireceğiniz tahmini tutar
            </Text>
          </View>
        </FadeIn>

        {/* What Can You Buy */}
        <FadeIn delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Ne Alabilirsin?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.itemsScroll}
            >
              {items.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    item.canBuy ? styles.itemCardCanBuy : styles.itemCardCantBuy,
                    item.isPurchased && styles.itemCardPurchased,
                  ]}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={[
                    styles.itemPrice,
                    item.canBuy && styles.itemPriceCanBuy,
                  ]}>
                    {formatCurrency(item.price)}
                  </Text>
                  {item.canBuy && !item.isPurchased && (
                    <View style={styles.itemBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={Palette.success[500]} />
                    </View>
                  )}
                  {item.isPurchased && (
                    <View style={styles.purchasedBadge}>
                      <Text style={styles.purchasedText}>✓</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </FadeIn>

        {/* Milestone Rewards */}
        <FadeIn delay={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Milestone Ödülleri</Text>
            {milestones.map((milestone) => {
              const canClaim = stats.totalSavings >= milestone.savingsRequired && !milestone.claimed;
              const progress = Math.min((stats.totalSavings / milestone.savingsRequired) * 100, 100);
              
              return (
                <ScalePressable
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    milestone.claimed && styles.milestoneClaimed,
                  ]}
                  onPress={() => canClaim && handleClaimMilestone(milestone.id)}
                  disabled={!canClaim && !milestone.claimed}
                >
                  <View style={styles.milestoneLeft}>
                    <View style={[
                      styles.milestoneIcon,
                      milestone.claimed && styles.milestoneIconClaimed,
                    ]}>
                      <Text style={styles.milestoneEmoji}>{milestone.icon}</Text>
                    </View>
                    <View style={styles.milestoneInfo}>
                      <Text style={[
                        styles.milestoneName,
                        milestone.claimed && styles.milestoneNameClaimed,
                      ]}>
                        {milestone.name}
                      </Text>
                      <Text style={styles.milestoneAmount}>
                        {formatCurrency(milestone.savingsRequired)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.milestoneRight}>
                    {milestone.claimed ? (
                      <View style={styles.claimedBadge}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : canClaim ? (
                      <TouchableOpacity style={styles.claimButton}>
                        <Text style={styles.claimButtonText}>Al</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                    )}
                  </View>
                  
                  {!milestone.claimed && (
                    <View style={styles.milestoneProgress}>
                      <View
                        style={[
                          styles.milestoneProgressFill,
                          { width: `${progress}%` },
                        ]}
                      />
                    </View>
                  )}
                </ScalePressable>
              );
            })}
          </View>
        </FadeIn>

        {/* Savings Goals */}
        <FadeIn delay={500}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Tasarruf Hedefleri</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddGoal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {goals.length === 0 ? (
              <View style={styles.emptyGoals}>
                <Text style={styles.emptyGoalsText}>
                  Henüz hedef eklemediniz. Tasarrufunuz için bir hedef belirleyin!
                </Text>
              </View>
            ) : (
              goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                
                return (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalIconContainer}>
                        <Text style={styles.goalIcon}>{goal.icon}</Text>
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalName}>{goal.name}</Text>
                        <Text style={styles.goalTarget}>
                          Hedef: {formatCurrency(goal.targetAmount)}
                        </Text>
                      </View>
                      {goal.isCompleted && (
                        <View style={styles.goalCompletedBadge}>
                          <Ionicons name="checkmark-circle" size={24} color={Palette.success[500]} />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.goalProgressBar}>
                      <LinearGradient
                        colors={[goal.color, withAlpha(goal.color, 0.7)]}
                        style={[styles.goalProgressFill, { width: `${Math.min(progress, 100)}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    
                    <View style={styles.goalFooter}>
                      <Text style={styles.goalCurrent}>
                        {formatCurrency(goal.currentAmount)}
                      </Text>
                      <Text style={styles.goalPercent}>
                        {Math.round(progress)}%
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </FadeIn>

        {/* Comparisons */}
        <FadeIn delay={600}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Karşılaştırma</Text>
            <View style={styles.comparisonsGrid}>
              {comparisons.map((comp, index) => (
                <View key={index} style={styles.comparisonCard}>
                  <Text style={styles.comparisonIcon}>{comp.icon}</Text>
                  <Text style={styles.comparisonCount}>{comp.count}x</Text>
                  <Text style={styles.comparisonName}>{comp.item}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeIn>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddGoal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Hedef</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hedef Adı</Text>
              <TextInput
                style={styles.input}
                value={newGoalName}
                onChangeText={setNewGoalName}
                placeholder="Örn: Yeni telefon"
                placeholderTextColor={SemanticColors.text.tertiary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hedef Tutar (₺)</Text>
              <TextInput
                style={styles.input}
                value={newGoalAmount}
                onChangeText={setNewGoalAmount}
                placeholder="Örn: 5000"
                placeholderTextColor={SemanticColors.text.tertiary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddGoal(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddGoal}
              >
                <Text style={styles.modalSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  placeholder: {
    width: 40,
  },

  // Main Card
  mainCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  mainGradient: {
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  mainDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withAlpha('#fff', 0.1),
  },
  mainDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: withAlpha('#fff', 0.08),
  },
  mainContent: {
    alignItems: 'center',
  },
  coinContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: withAlpha('#fff', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  coinEmoji: {
    fontSize: 40,
  },
  savingsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  savingsAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: withAlpha('#fff', 0.15),
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statBoxLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: withAlpha('#fff', 0.3),
  },

  // Projections
  projectionsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  projectionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  projectionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: withAlpha(Palette.accent[500], 0.1),
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.accent[500],
  },
  projectionLabel: {
    fontSize: 12,
    color: SemanticColors.text.secondary,
    marginTop: 4,
  },
  projectionsHint: {
    fontSize: 11,
    color: SemanticColors.text.tertiary,
    fontStyle: 'italic',
  },

  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Items
  itemsScroll: {
    paddingRight: Spacing.lg,
  },
  itemCard: {
    width: 100,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    position: 'relative',
  },
  itemCardCanBuy: {
    borderColor: Palette.success[500],
    backgroundColor: withAlpha(Palette.success[500], 0.05),
  },
  itemCardCantBuy: {
    opacity: 0.6,
  },
  itemCardPurchased: {
    opacity: 0.5,
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: 11,
    color: SemanticColors.text.secondary,
    fontWeight: '600',
  },
  itemPriceCanBuy: {
    color: Palette.success[500],
  },
  itemBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  purchasedBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: withAlpha('#000', 0.5),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasedText: {
    fontSize: 24,
    color: '#fff',
  },

  // Milestones
  milestoneCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  milestoneClaimed: {
    backgroundColor: withAlpha(Palette.success[500], 0.1),
    borderColor: withAlpha(Palette.success[500], 0.3),
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  milestoneIconClaimed: {
    backgroundColor: withAlpha(Palette.success[500], 0.15),
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  milestoneNameClaimed: {
    color: Palette.success[500],
  },
  milestoneAmount: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  milestoneRight: {
    marginLeft: Spacing.md,
  },
  claimedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButton: {
    backgroundColor: Palette.accent[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: SemanticColors.text.secondary,
  },
  milestoneProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: withAlpha(Palette.accent[500], 0.2),
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: Palette.accent[500],
  },

  // Goals
  emptyGoals: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyGoalsText: {
    fontSize: 14,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  goalIcon: {
    fontSize: 22,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  goalTarget: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  goalCompletedBadge: {
    marginLeft: Spacing.sm,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: withAlpha(Palette.accent[500], 0.2),
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalCurrent: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.accent[500],
  },
  goalPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
  },

  // Comparisons
  comparisonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  comparisonCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  comparisonIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  comparisonCount: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.accent[500],
  },
  comparisonName: {
    fontSize: 11,
    color: SemanticColors.text.secondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SemanticColors.background.secondary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    color: SemanticColors.text.primary,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: SemanticColors.surface.default,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: Palette.primary[500],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});




