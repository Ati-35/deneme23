import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  currentValue: number;
  targetValue: number;
  unit: string;
  icon: string;
  color: string;
  category: 'health' | 'money' | 'time' | 'personal';
  createdAt: Date;
}

const defaultGoals: Goal[] = [
  {
    id: '1',
    title: '30 Gün Sigarasız',
    description: 'İlk büyük kilometre taşına ulaş',
    targetDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    currentValue: 7,
    targetValue: 30,
    unit: 'gün',
    icon: 'calendar',
    color: Colors.primary,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '₺1,500 Tasarruf',
    description: 'Sigara için harcadığın parayı biriktir',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currentValue: 350,
    targetValue: 1500,
    unit: '₺',
    icon: 'cash',
    color: Colors.money,
    category: 'money',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: '600 Sigara İçilmedi',
    description: '600 sigara içmeyerek sağlığına yatırım yap',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currentValue: 140,
    targetValue: 600,
    unit: 'adet',
    icon: 'ban',
    color: Colors.error,
    category: 'health',
    createdAt: new Date(),
  },
];

const goalCategories = [
  { id: 'health', name: 'Sağlık', icon: 'heart', color: Colors.primary },
  { id: 'money', name: 'Tasarruf', icon: 'cash', color: Colors.money },
  { id: 'time', name: 'Zaman', icon: 'time', color: Colors.info },
  { id: 'personal', name: 'Kişisel', icon: 'person', color: Colors.accent },
];

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: 'gün',
    category: 'health' as Goal['category'],
  });

  const filteredGoals = selectedCategory
    ? goals.filter((g) => g.category === selectedCategory)
    : goals;

  const getProgress = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const createGoal = () => {
    if (!newGoal.title || !newGoal.targetValue) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentValue: 0,
      targetValue: parseFloat(newGoal.targetValue),
      unit: newGoal.unit,
      icon: goalCategories.find((c) => c.id === newGoal.category)?.icon || 'flag',
      color: goalCategories.find((c) => c.id === newGoal.category)?.color || Colors.primary,
      category: newGoal.category,
      createdAt: new Date(),
    };

    setGoals([...goals, goal]);
    setIsModalVisible(false);
    setNewGoal({
      title: '',
      description: '',
      targetValue: '',
      unit: 'gün',
      category: 'health',
    });
    Alert.alert('Başarılı', 'Hedef oluşturuldu!');
  };

  const completeGoal = (goalId: string) => {
    Alert.alert('Tebrikler! 🎉', 'Hedefinizi tamamladınız!', [
      { text: 'Tamam', style: 'default' },
    ]);
    // Goal completed logic
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
          <View>
            <Text style={styles.title}>🎯 Hedeflerim</Text>
            <Text style={styles.subtitle}>Hedeflerine ulaş, hayallerini gerçekleştir</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* İlerleme Özeti */}
        <LinearGradient
          colors={[Colors.primary + '30', Colors.accent + '20']}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>📊 Genel İlerleme</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{goals.length}</Text>
              <Text style={styles.summaryLabel}>Aktif Hedef</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {Math.round(
                  goals.reduce((sum, g) => sum + getProgress(g), 0) / goals.length
                )}%
              </Text>
              <Text style={styles.summaryLabel}>Ortalama İlerleme</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {goals.filter((g) => getProgress(g) >= 100).length}
              </Text>
              <Text style={styles.summaryLabel}>Tamamlanan</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Kategoriler */}
        <Text style={styles.sectionTitle}>📂 Kategoriler</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryText,
                !selectedCategory && styles.categoryTextActive,
              ]}
            >
              Tümü
            </Text>
          </TouchableOpacity>
          {goalCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
                { borderColor: selectedCategory === category.id ? category.color : Colors.border },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? category.color : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                  { color: selectedCategory === category.id ? category.color : Colors.textSecondary },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hedefler Listesi */}
        <Text style={styles.sectionTitle}>🏆 Hedefleriniz</Text>
        {filteredGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Henüz hedef yok</Text>
            <Text style={styles.emptySubtext}>
              İlk hedefinizi oluşturmak için + butonuna tıklayın
            </Text>
          </View>
        ) : (
          filteredGoals.map((goal) => {
            const progress = getProgress(goal);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isCompleted = progress >= 100;

            return (
              <View key={goal.id} style={styles.goalCard}>
                <LinearGradient
                  colors={[goal.color + '20', goal.color + '10']}
                  style={styles.goalGradient}
                >
                  <View style={styles.goalHeader}>
                    <View style={[styles.goalIcon, { backgroundColor: goal.color + '30' }]}>
                      <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    </View>
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                      </View>
                    )}
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressText}>
                        {goal.currentValue.toFixed(0)} / {goal.targetValue} {goal.unit}
                      </Text>
                      <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={[goal.color, goal.color + '80']}
                        style={[styles.progressFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>

                  <View style={styles.goalFooter}>
                    <View style={styles.footerItem}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.footerText}>
                        {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Süre doldu'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => completeGoal(goal.id)}
                      disabled={!isCompleted}
                    >
                      <Text
                        style={[
                          styles.completeButtonText,
                          !isCompleted && styles.completeButtonTextDisabled,
                        ]}
                      >
                        {isCompleted ? 'Tamamlandı ✓' : 'Devam Ediyor'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            );
          })
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
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Yeni Hedef</Text>
            <TouchableOpacity onPress={createGoal} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Oluştur</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Hedef Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 30 Gün Sigarasız"
              placeholderTextColor={Colors.textMuted}
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
            />

            <Text style={styles.modalSectionTitle}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Hedefiniz hakkında kısa bir açıklama..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
            />

            <Text style={styles.modalSectionTitle}>Kategori</Text>
            <View style={styles.categoriesGrid}>
              {goalCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    newGoal.category === category.id && styles.categoryCardSelected,
                    { borderColor: newGoal.category === category.id ? category.color : Colors.border },
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, category: category.id as Goal['category'] })}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={newGoal.category === category.id ? category.color : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryCardText,
                      { color: newGoal.category === category.id ? category.color : Colors.textSecondary },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>Hedef Değer</Text>
            <View style={styles.targetInputContainer}>
              <TextInput
                style={[styles.input, styles.targetInput]}
                placeholder="100"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={newGoal.targetValue}
                onChangeText={(text) => setNewGoal({ ...newGoal, targetValue: text })}
              />
              <View style={styles.unitSelector}>
                {['gün', '₺', 'adet', 'saat'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      newGoal.unit === unit && styles.unitButtonActive,
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, unit })}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        newGoal.unit === unit && styles.unitButtonTextActive,
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
    paddingBottom: 100, // Tab bar için alan
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  goalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  goalGradient: {
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  completedBadge: {
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  completeButtonTextDisabled: {
    color: Colors.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  categoryCardSelected: {
    backgroundColor: Colors.primary + '10',
  },
  categoryCardText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  targetInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  targetInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  unitButtonTextActive: {
    color: '#fff',
  },
});




