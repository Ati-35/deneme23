import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface JournalEntry {
  id: string;
  date: Date;
  mood: string;
  cravings: number;
  notes: string;
  achievements: string[];
}

const moods = [
  { id: '1', emoji: '😊', name: 'Mutlu', color: Colors.success },
  { id: '2', emoji: '😌', name: 'Sakin', color: Colors.info },
  { id: '3', emoji: '😐', name: 'Normal', color: Colors.textSecondary },
  { id: '4', emoji: '😰', name: 'Endişeli', color: Colors.warning },
  { id: '5', emoji: '😢', name: 'Üzgün', color: Colors.error },
];

const achievements = [
  { id: '1', name: 'Sabah sigarası içmedim', icon: 'sunny' },
  { id: '2', name: 'Stresli anı atlattım', icon: 'shield-checkmark' },
  { id: '3', name: 'Egzersiz yaptım', icon: 'fitness' },
  { id: '4', name: 'Su içtim', icon: 'water' },
  { id: '5', name: 'Derin nefes aldım', icon: 'leaf' },
  { id: '6', name: 'Arkadaşımla konuştum', icon: 'chatbubbles' },
];

export default function JournalScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [cravingsLevel, setCravingsLevel] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const toggleAchievement = (id: string) => {
    setSelectedAchievements((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const saveEntry = () => {
    if (!selectedMood) {
      Alert.alert('Uyarı', 'Lütfen ruh halinizi seçin');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood: selectedMood,
      cravings: cravingsLevel,
      notes: notes,
      achievements: selectedAchievements,
    };

    setEntries([newEntry, ...entries]);
    Alert.alert('Başarılı', 'Günlük kaydınız kaydedildi!', [
      { text: 'Tamam', onPress: () => setIsModalVisible(false) },
    ]);

    // Reset form
    setSelectedMood(null);
    setCravingsLevel(0);
    setNotes('');
    setSelectedAchievements([]);
  };

  const getMoodEmoji = (moodId: string) => {
    return moods.find((m) => m.id === moodId)?.emoji || '😐';
  };

  const getMoodName = (moodId: string) => {
    return moods.find((m) => m.id === moodId)?.name || 'Normal';
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
            <Text style={styles.title}>📔 Günlük</Text>
            <Text style={styles.subtitle}>Günlük ilerlemenizi kaydedin</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bugünün Özeti */}
        <LinearGradient
          colors={[Colors.primary + '30', Colors.accent + '20']}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>📊 Bugünün Özeti</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.summaryValue}>{entries.length}</Text>
              <Text style={styles.summaryLabel}>Kayıt</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="flame" size={24} color={Colors.accent} />
              <Text style={styles.summaryValue}>
                {entries.length > 0
                  ? Math.round(
                      entries.reduce((sum, e) => sum + e.cravings, 0) / entries.length
                    )
                  : 0}
              </Text>
              <Text style={styles.summaryLabel}>Ortalama İstek</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="trophy" size={24} color={Colors.warning} />
              <Text style={styles.summaryValue}>
                {entries.reduce((sum, e) => sum + e.achievements.length, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Başarı</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Geçmiş Kayıtlar */}
        <Text style={styles.sectionTitle}>📝 Geçmiş Kayıtlar</Text>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Henüz kayıt yok</Text>
            <Text style={styles.emptySubtext}>
              İlk günlük kaydınızı oluşturmak için + butonuna tıklayın
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryMood}>
                  <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                  <View>
                    <Text style={styles.entryDate}>
                      {entry.date.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.entryMoodName}>{getMoodName(entry.mood)}</Text>
                  </View>
                </View>
                <View style={styles.cravingsBadge}>
                  <Ionicons name="flame" size={16} color={Colors.accent} />
                  <Text style={styles.cravingsText}>{entry.cravings}/10</Text>
                </View>
              </View>

              {entry.notes && (
                <Text style={styles.entryNotes}>{entry.notes}</Text>
              )}

              {entry.achievements.length > 0 && (
                <View style={styles.achievementsList}>
                  {entry.achievements.map((achId) => {
                    const ach = achievements.find((a) => a.id === achId);
                    return ach ? (
                      <View key={achId} style={styles.achievementBadge}>
                        <Ionicons name={ach.icon as any} size={14} color={Colors.primary} />
                        <Text style={styles.achievementText}>{ach.name}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Yeni Kayıt Modal */}
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
            <Text style={styles.modalTitle}>Yeni Kayıt</Text>
            <TouchableOpacity onPress={saveEntry} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Ruh Hali */}
            <Text style={styles.modalSectionTitle}>Ruh Haliniz Nasıl?</Text>
            <View style={styles.moodsGrid}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodCard,
                    selectedMood === mood.id && styles.moodCardSelected,
                    { borderColor: selectedMood === mood.id ? mood.color : Colors.border },
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                >
                  <Text style={styles.moodEmojiLarge}>{mood.emoji}</Text>
                  <Text style={styles.moodName}>{mood.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sigara İsteği Seviyesi */}
            <Text style={styles.modalSectionTitle}>
              Sigara İsteği Seviyesi: {cravingsLevel}/10
            </Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Yok</Text>
                <Text style={styles.sliderLabel}>Orta</Text>
                <Text style={styles.sliderLabel}>Çok</Text>
              </View>
              <View style={styles.sliderButtons}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.sliderButton,
                      cravingsLevel >= level && styles.sliderButtonActive,
                      { backgroundColor: cravingsLevel >= level ? Colors.accent : Colors.border },
                    ]}
                    onPress={() => setCravingsLevel(level)}
                  />
                ))}
              </View>
            </View>

            {/* Başarılar */}
            <Text style={styles.modalSectionTitle}>Bugün Neler Başardınız?</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    selectedAchievements.includes(achievement.id) &&
                      styles.achievementCardSelected,
                  ]}
                  onPress={() => toggleAchievement(achievement.id)}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={
                      selectedAchievements.includes(achievement.id)
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.achievementCardText,
                      selectedAchievements.includes(achievement.id) &&
                        styles.achievementCardTextSelected,
                    ]}
                  >
                    {achievement.name}
                  </Text>
                  {selectedAchievements.includes(achievement.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Notlar */}
            <Text style={styles.modalSectionTitle}>Notlar</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Bugün hakkında düşünceleriniz..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={6}
              value={notes}
              onChangeText={setNotes}
            />
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
  moodEmoji: {
    fontSize: 32,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  entryMoodName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cravingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  cravingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  entryNotes: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  achievementText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
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
    marginBottom: 16,
    marginTop: 8,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodCard: {
    width: (width - 60) / 3,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  moodCardSelected: {
    backgroundColor: Colors.primary + '10',
  },
  moodEmojiLarge: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  sliderButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
  },
  sliderButtonActive: {
    opacity: 1,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  achievementCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  achievementCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  achievementCardTextSelected: {
    color: Colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  notesInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
});




