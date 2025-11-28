import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import { MoodEntry, saveMoodEntry, getMoodEntries } from '../utils/storage';

const { width } = Dimensions.get('window');

// Ruh halleri
const moods = [
  { id: 'great', emoji: '😄', label: 'Harika', color: '#10B981' },
  { id: 'good', emoji: '🙂', label: 'İyi', color: '#3B82F6' },
  { id: 'neutral', emoji: '😐', label: 'Normal', color: '#F59E0B' },
  { id: 'bad', emoji: '😔', label: 'Kötü', color: '#EF4444' },
  { id: 'terrible', emoji: '😫', label: 'Çok Kötü', color: '#7C3AED' },
];

// Tetikleyiciler
const triggers = [
  { id: 'stress', label: 'Stres', icon: 'flash' },
  { id: 'coffee', label: 'Kahve', icon: 'cafe' },
  { id: 'alcohol', label: 'Alkol', icon: 'wine' },
  { id: 'boredom', label: 'Can Sıkıntısı', icon: 'time' },
  { id: 'social', label: 'Sosyal Ortam', icon: 'people' },
  { id: 'meal', label: 'Yemek Sonrası', icon: 'restaurant' },
  { id: 'work', label: 'İş Stresi', icon: 'briefcase' },
  { id: 'morning', label: 'Sabah', icon: 'sunny' },
  { id: 'anger', label: 'Sinir', icon: 'flame' },
  { id: 'sadness', label: 'Üzüntü', icon: 'sad' },
];

export default function JournalScreen() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [cravingLevel, setCravingLevel] = useState(5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await getMoodEntries();
    setEntries(data);
  };

  const toggleTrigger = (triggerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTriggers(prev =>
      prev.includes(triggerId)
        ? prev.filter(t => t !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleSaveEntry = async () => {
    if (!selectedMood) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood as MoodEntry['mood'],
      cravingLevel,
      triggers: selectedTriggers,
      notes,
    };

    await saveMoodEntry(newEntry);
    await loadEntries();

    // Reset form
    setSelectedMood('');
    setCravingLevel(5);
    setSelectedTriggers([]);
    setNotes('');
    setIsModalVisible(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getMoodInfo = (moodId: string) => {
    return moods.find(m => m.id === moodId) || moods[2];
  };

  const getTriggerLabel = (triggerId: string) => {
    const trigger = triggers.find(t => t.id === triggerId);
    return trigger?.label || triggerId;
  };

  // Haftalık özet hesapla
  const getWeeklySummary = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekEntries = entries.filter(e => new Date(e.date) >= oneWeekAgo);
    const avgCraving = weekEntries.length > 0
      ? weekEntries.reduce((sum, e) => sum + e.cravingLevel, 0) / weekEntries.length
      : 0;

    const moodCounts: { [key: string]: number } = {};
    weekEntries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      entryCount: weekEntries.length,
      avgCraving: avgCraving.toFixed(1),
      topMood: topMood ? getMoodInfo(topMood[0]) : null,
    };
  };

  const summary = getWeeklySummary();

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
          <Text style={styles.title}>📔 Günlük</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Haftalık Özet */}
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.summaryTitle}>📊 Haftalık Özet</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.entryCount}</Text>
              <Text style={styles.summaryLabel}>Kayıt</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.avgCraving}</Text>
              <Text style={styles.summaryLabel}>Ort. İstek</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>{summary.topMood?.emoji || '😐'}</Text>
              <Text style={styles.summaryLabel}>En Sık</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Yeni Giriş Butonu */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Bugün Nasıl Hissediyorsun?</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Geçmiş Kayıtlar */}
        <Text style={styles.sectionTitle}>📅 Geçmiş Kayıtlar</Text>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Henüz kayıt yok</Text>
            <Text style={styles.emptySubtext}>
              İlk kaydınızı ekleyerek tetikleyicilerinizi keşfedin
            </Text>
          </View>
        ) : (
          entries.slice(0, 10).map((entry) => {
            const moodInfo = getMoodInfo(entry.mood);
            return (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryMood}>
                    <Text style={styles.entryEmoji}>{moodInfo.emoji}</Text>
                    <View>
                      <Text style={styles.entryMoodLabel}>{moodInfo.label}</Text>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    </View>
                  </View>
                  <View style={[styles.cravingBadge, { backgroundColor: getCravingColor(entry.cravingLevel) + '20' }]}>
                    <Text style={[styles.cravingText, { color: getCravingColor(entry.cravingLevel) }]}>
                      İstek: {entry.cravingLevel}/10
                    </Text>
                  </View>
                </View>

                {entry.triggers.length > 0 && (
                  <View style={styles.entryTriggers}>
                    {entry.triggers.map(t => (
                      <View key={t} style={styles.triggerChip}>
                        <Text style={styles.triggerChipText}>{getTriggerLabel(t)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {entry.notes && (
                  <Text style={styles.entryNotes}>"{entry.notes}"</Text>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Yeni Giriş Modal */}
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
            <Text style={styles.modalTitle}>Yeni Kayıt</Text>
            <TouchableOpacity
              style={[styles.modalSaveButton, !selectedMood && styles.modalSaveButtonDisabled]}
              onPress={handleSaveEntry}
              disabled={!selectedMood}
            >
              <Text style={[styles.modalSaveText, !selectedMood && styles.modalSaveTextDisabled]}>
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {/* Ruh Hali Seçimi */}
            <Text style={styles.modalSectionTitle}>Nasıl hissediyorsun?</Text>
            <View style={styles.moodGrid}>
              {moods.map(mood => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.id && { borderColor: mood.color, borderWidth: 2 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMood(mood.id);
                  }}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* İstek Seviyesi */}
            <Text style={styles.modalSectionTitle}>Sigara isteği seviyesi</Text>
            <View style={styles.cravingContainer}>
              <View style={styles.cravingSlider}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.cravingDot,
                      level <= cravingLevel && { backgroundColor: getCravingColor(cravingLevel) },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCravingLevel(level);
                    }}
                  />
                ))}
              </View>
              <Text style={styles.cravingValue}>{cravingLevel}/10</Text>
            </View>

            {/* Tetikleyiciler */}
            <Text style={styles.modalSectionTitle}>Tetikleyiciler</Text>
            <View style={styles.triggersGrid}>
              {triggers.map(trigger => (
                <TouchableOpacity
                  key={trigger.id}
                  style={[
                    styles.triggerOption,
                    selectedTriggers.includes(trigger.id) && styles.triggerOptionSelected,
                  ]}
                  onPress={() => toggleTrigger(trigger.id)}
                >
                  <Ionicons
                    name={trigger.icon as any}
                    size={18}
                    color={selectedTriggers.includes(trigger.id) ? '#fff' : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.triggerLabel,
                      selectedTriggers.includes(trigger.id) && styles.triggerLabelSelected,
                    ]}
                  >
                    {trigger.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notlar */}
            <Text style={styles.modalSectionTitle}>Notlar (opsiyonel)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Düşüncelerini yaz..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getCravingColor = (level: number) => {
  if (level <= 3) return '#10B981';
  if (level <= 6) return '#F59E0B';
  return '#EF4444';
};

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
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  summaryEmoji: {
    fontSize: 28,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
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
  entryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryEmoji: {
    fontSize: 32,
  },
  entryMoodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cravingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cravingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryTriggers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  triggerChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  triggerChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  entryNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
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
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: (width - 60) / 5,
    aspectRatio: 0.8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cravingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  cravingSlider: {
    flexDirection: 'row',
    gap: 8,
  },
  cravingDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
  },
  cravingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  triggerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  triggerLabelSelected: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 100,
    textAlignVertical: 'top',
  },
});







