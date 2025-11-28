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
import { SavingsGoal, getSavingsGoals, saveSavingsGoals, getDefaultSavingsGoals } from '../utils/storage';

const { width } = Dimensions.get('window');

// Hedef ikonları seçenekleri
const iconOptions = [
  { id: 'restaurant', icon: 'restaurant', label: 'Yemek' },
  { id: 'headset', icon: 'headset', label: 'Elektronik' },
  { id: 'airplane', icon: 'airplane', label: 'Seyahat' },
  { id: 'phone-portrait', icon: 'phone-portrait', label: 'Telefon' },
  { id: 'car', icon: 'car', label: 'Araba' },
  { id: 'home', icon: 'home', label: 'Ev' },
  { id: 'shirt', icon: 'shirt', label: 'Giyim' },
  { id: 'gift', icon: 'gift', label: 'Hediye' },
  { id: 'game-controller', icon: 'game-controller', label: 'Oyun' },
  { id: 'book', icon: 'book', label: 'Kitap' },
  { id: 'fitness', icon: 'fitness', label: 'Spor' },
  { id: 'musical-notes', icon: 'musical-notes', label: 'Müzik' },
];

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1',
];

export default function SavingsScreen() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('gift');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  // Kullanıcı verileri (örnek - normalde storage'dan alınmalı)
  const quitDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 gün önce
  const pricePerPack = 50;
  const daysSinceQuit = Math.floor((Date.now() - quitDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalSaved = daysSinceQuit * pricePerPack;

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const data = await getSavingsGoals();
    // Hedefleri tamamlanma durumuna göre güncelle
    const updatedGoals = data.map(goal => ({
      ...goal,
      isCompleted: totalSaved >= goal.targetAmount,
    }));
    setGoals(updatedGoals);
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle || !newGoalAmount) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      targetAmount: parseFloat(newGoalAmount),
      icon: selectedIcon,
      color: selectedColor,
      isCompleted: totalSaved >= parseFloat(newGoalAmount),
    };

    const updatedGoals = [...goals, newGoal];
    await saveSavingsGoals(updatedGoals);
    setGoals(updatedGoals);

    // Reset form
    setNewGoalTitle('');
    setNewGoalAmount('');
    setSelectedIcon('gift');
    setSelectedColor(colorOptions[0]);
    setIsModalVisible(false);
  };

  const handleDeleteGoal = async (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedGoals = goals.filter(g => g.id !== goalId);
    await saveSavingsGoals(updatedGoals);
    setGoals(updatedGoals);
  };

  const getProgress = (targetAmount: number) => {
    return Math.min((totalSaved / targetAmount) * 100, 100);
  };

  const getRemainingDays = (targetAmount: number) => {
    if (totalSaved >= targetAmount) return 0;
    const remaining = targetAmount - totalSaved;
    return Math.ceil(remaining / pricePerPack);
  };

  // Hedefleri sırala: tamamlananlar en sona
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return a.targetAmount - b.targetAmount;
  });

  const completedGoals = goals.filter(g => g.isCompleted).length;
  const nextGoal = goals.find(g => !g.isCompleted);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>🎯 Tasarruf Hedefleri</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Toplam Tasarruf */}
        <LinearGradient
          colors={[Colors.money, '#D97706']}
          style={styles.totalCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.totalIcon}>
            <Ionicons name="wallet" size={40} color="#fff" />
          </View>
          <Text style={styles.totalLabel}>Toplam Tasarruf</Text>
          <Text style={styles.totalAmount}>₺{totalSaved.toLocaleString()}</Text>
          <Text style={styles.totalDays}>{daysSinceQuit} günde</Text>
          
          <View style={styles.totalStats}>
            <View style={styles.totalStatItem}>
              <Text style={styles.totalStatValue}>{completedGoals}</Text>
              <Text style={styles.totalStatLabel}>Hedef Tamamlandı</Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStatItem}>
              <Text style={styles.totalStatValue}>{goals.length - completedGoals}</Text>
              <Text style={styles.totalStatLabel}>Hedef Kaldı</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Sonraki Hedef */}
        {nextGoal && (
          <View style={styles.nextGoalCard}>
            <View style={styles.nextGoalHeader}>
              <Ionicons name="flag" size={20} color={Colors.primary} />
              <Text style={styles.nextGoalTitle}>Sonraki Hedef</Text>
            </View>
            <View style={styles.nextGoalContent}>
              <View style={[styles.nextGoalIcon, { backgroundColor: nextGoal.color + '20' }]}>
                <Ionicons name={nextGoal.icon as any} size={28} color={nextGoal.color} />
              </View>
              <View style={styles.nextGoalInfo}>
                <Text style={styles.nextGoalName}>{nextGoal.title}</Text>
                <Text style={styles.nextGoalProgress}>
                  ₺{totalSaved.toLocaleString()} / ₺{nextGoal.targetAmount.toLocaleString()}
                </Text>
                <View style={styles.nextGoalProgressBar}>
                  <View 
                    style={[
                      styles.nextGoalProgressFill, 
                      { width: `${getProgress(nextGoal.targetAmount)}%`, backgroundColor: nextGoal.color }
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.nextGoalDays}>
                <Text style={styles.nextGoalDaysValue}>{getRemainingDays(nextGoal.targetAmount)}</Text>
                <Text style={styles.nextGoalDaysLabel}>gün kaldı</Text>
              </View>
            </View>
          </View>
        )}

        {/* Hedef Ekle Butonu */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
          <Text style={styles.addButtonText}>Yeni Hedef Ekle</Text>
        </TouchableOpacity>

        {/* Hedefler Listesi */}
        <Text style={styles.sectionTitle}>📋 Tüm Hedefler</Text>
        {sortedGoals.map((goal) => {
          const progress = getProgress(goal.targetAmount);
          const remainingDays = getRemainingDays(goal.targetAmount);

          return (
            <View 
              key={goal.id} 
              style={[styles.goalCard, goal.isCompleted && styles.goalCardCompleted]}
            >
              <View style={styles.goalHeader}>
                <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                  <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, goal.isCompleted && styles.goalTitleCompleted]}>
                    {goal.title}
                  </Text>
                  <Text style={styles.goalAmount}>₺{goal.targetAmount.toLocaleString()}</Text>
                </View>
                {goal.isCompleted ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteGoal(goal.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.goalProgressContainer}>
                <View style={styles.goalProgressBar}>
                  <View 
                    style={[
                      styles.goalProgressFill, 
                      { width: `${progress}%`, backgroundColor: goal.color }
                    ]} 
                  />
                </View>
                <Text style={styles.goalProgressText}>
                  {goal.isCompleted 
                    ? '✓ Tamamlandı!' 
                    : `${progress.toFixed(0)}% • ${remainingDays} gün kaldı`
                  }
                </Text>
              </View>
            </View>
          );
        })}

        {/* Boş Durum */}
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Henüz hedef yok</Text>
            <Text style={styles.emptySubtext}>
              Tasarruflarınızla neler alabileceğinizi görün
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Yeni Hedef Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Yeni Hedef</Text>
            <TouchableOpacity
              style={[
                styles.modalSaveButton,
                (!newGoalTitle || !newGoalAmount) && styles.modalSaveButtonDisabled,
              ]}
              onPress={handleAddGoal}
              disabled={!newGoalTitle || !newGoalAmount}
            >
              <Text
                style={[
                  styles.modalSaveText,
                  (!newGoalTitle || !newGoalAmount) && styles.modalSaveTextDisabled,
                ]}
              >
                Ekle
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {/* Hedef Adı */}
            <Text style={styles.modalSectionTitle}>Hedef Adı</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Örn: Yeni telefon"
              placeholderTextColor={Colors.textMuted}
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />

            {/* Hedef Tutarı */}
            <Text style={styles.modalSectionTitle}>Hedef Tutarı (₺)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Örn: 25000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={newGoalAmount}
              onChangeText={setNewGoalAmount}
            />

            {newGoalAmount && (
              <Text style={styles.daysEstimate}>
                ≈ {Math.ceil(parseFloat(newGoalAmount) / pricePerPack)} gün gerekli
              </Text>
            )}

            {/* İkon Seçimi */}
            <Text style={styles.modalSectionTitle}>İkon</Text>
            <View style={styles.iconGrid}>
              {iconOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.iconOption,
                    selectedIcon === option.id && { borderColor: selectedColor, borderWidth: 2 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedIcon(option.id);
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={selectedIcon === option.id ? selectedColor : Colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Renk Seçimi */}
            <Text style={styles.modalSectionTitle}>Renk</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedColor(color);
                  }}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Önizleme */}
            {newGoalTitle && (
              <>
                <Text style={styles.modalSectionTitle}>Önizleme</Text>
                <View style={styles.previewCard}>
                  <View style={[styles.goalIcon, { backgroundColor: selectedColor + '20' }]}>
                    <Ionicons name={selectedIcon as any} size={24} color={selectedColor} />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{newGoalTitle || 'Hedef Adı'}</Text>
                    <Text style={styles.goalAmount}>
                      ₺{newGoalAmount ? parseFloat(newGoalAmount).toLocaleString() : '0'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
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
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  totalCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  totalDays: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  totalStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  totalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  totalStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  totalStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  nextGoalCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nextGoalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  nextGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextGoalIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextGoalInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nextGoalName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  nextGoalProgress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  nextGoalProgressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  nextGoalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextGoalDays: {
    alignItems: 'center',
    marginLeft: 12,
  },
  nextGoalDaysValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.accent,
  },
  nextGoalDaysLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary + '50',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardCompleted: {
    opacity: 0.7,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 14,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  goalAmount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  completedBadge: {
    marginLeft: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalProgressContainer: {
    gap: 6,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  modalSaveButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalSaveTextDisabled: {
    color: Colors.textSecondary,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 20,
  },
  textInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  daysEstimate: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});







