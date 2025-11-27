import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';

const { width } = Dimensions.get('window');

interface Mood {
  id: string;
  emoji: string;
  name: string;
  color: string;
  gradient: readonly string[];
}

const moods: Mood[] = [
  { id: '1', emoji: '😊', name: 'Harika', color: Palette.success[500], gradient: Gradients.success },
  { id: '2', emoji: '🙂', name: 'İyi', color: Palette.primary[500], gradient: Gradients.primary },
  { id: '3', emoji: '😐', name: 'Normal', color: Palette.accent[500], gradient: Gradients.accent },
  { id: '4', emoji: '😔', name: 'Kötü', color: Palette.warning[500], gradient: Gradients.warning },
  { id: '5', emoji: '😫', name: 'Çok Kötü', color: Palette.error[500], gradient: Gradients.error },
];

interface CravingLevel {
  id: string;
  level: number;
  label: string;
  color: string;
}

const cravingLevels: CravingLevel[] = [
  { id: '1', level: 1, label: 'Yok', color: Palette.success[500] },
  { id: '2', level: 2, label: 'Az', color: Palette.primary[500] },
  { id: '3', level: 3, label: 'Orta', color: Palette.accent[500] },
  { id: '4', level: 4, label: 'Yüksek', color: Palette.warning[500] },
  { id: '5', level: 5, label: 'Çok Yüksek', color: Palette.error[500] },
];

interface Trigger {
  id: string;
  name: string;
  icon: string;
}

const triggers: Trigger[] = [
  { id: '1', name: 'Stres', icon: 'flash' },
  { id: '2', name: 'Yemek Sonrası', icon: 'restaurant' },
  { id: '3', name: 'Kahve', icon: 'cafe' },
  { id: '4', name: 'Alkol', icon: 'wine' },
  { id: '5', name: 'Sosyal Ortam', icon: 'people' },
  { id: '6', name: 'Can Sıkıntısı', icon: 'time' },
  { id: '7', name: 'Öfke', icon: 'flame' },
  { id: '8', name: 'Kaygı', icon: 'alert-circle' },
  { id: '9', name: 'Mutluluk', icon: 'happy' },
  { id: '10', name: 'Uyanış', icon: 'sunny' },
];

interface MoodEntry {
  id: string;
  date: Date;
  mood: Mood;
  craving: number;
  triggers: string[];
  note?: string;
}

// Sample mood history
const moodHistory: MoodEntry[] = [
  { id: '1', date: new Date(Date.now() - 86400000 * 0), mood: moods[1], craving: 2, triggers: ['1', '6'] },
  { id: '2', date: new Date(Date.now() - 86400000 * 1), mood: moods[0], craving: 1, triggers: ['9'] },
  { id: '3', date: new Date(Date.now() - 86400000 * 2), mood: moods[2], craving: 3, triggers: ['1', '3'] },
  { id: '4', date: new Date(Date.now() - 86400000 * 3), mood: moods[1], craving: 2, triggers: ['5'] },
  { id: '5', date: new Date(Date.now() - 86400000 * 4), mood: moods[3], craving: 4, triggers: ['1', '7', '8'] },
  { id: '6', date: new Date(Date.now() - 86400000 * 5), mood: moods[0], craving: 1, triggers: [] },
  { id: '7', date: new Date(Date.now() - 86400000 * 6), mood: moods[1], craving: 2, triggers: ['2', '3'] },
];

export default function MoodTrackerScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedCraving, setSelectedCraving] = useState<number>(3);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const scaleAnims = useRef(moods.map(() => new Animated.Value(1))).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleMoodSelect = (mood: Mood, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMood(mood);
    
    // Animate selected mood
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset other animations
    moods.forEach((_, i) => {
      if (i !== index) {
        Animated.timing(scaleAnims[i], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const toggleTrigger = (triggerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTriggers(prev => 
      prev.includes(triggerId)
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleSave = () => {
    if (!selectedMood) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
      // Reset form
      setSelectedMood(null);
      setSelectedCraving(3);
      setSelectedTriggers([]);
      setNote('');
      scaleAnims.forEach(anim => anim.setValue(1));
    });
  };

  const formatDate = (date: Date) => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return days[date.getDay()];
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>🎭 Ruh Hali</Text>
          <TouchableOpacity style={styles.historyBtn}>
            <Ionicons name="calendar" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Weekly Overview */}
        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyTitle}>Bu Hafta</Text>
          <View style={styles.weeklyGrid}>
            {moodHistory.map((entry, index) => (
              <View key={entry.id} style={styles.weeklyItem}>
                <Text style={styles.weeklyDay}>{formatDate(entry.date)}</Text>
                <View style={[
                  styles.weeklyMood,
                  { backgroundColor: withAlpha(entry.mood.color, 0.2) }
                ]}>
                  <Text style={styles.weeklyEmoji}>{entry.mood.emoji}</Text>
                </View>
                <View style={[
                  styles.cravingIndicator,
                  { backgroundColor: cravingLevels[entry.craving - 1]?.color || Palette.neutral[500] }
                ]} />
              </View>
            ))}
          </View>
        </View>

        {/* Mood Selection */}
        <Text style={styles.sectionTitle}>Bugün nasıl hissediyorsun?</Text>
        <View style={styles.moodGrid}>
          {moods.map((mood, index) => {
            const isSelected = selectedMood?.id === mood.id;
            return (
              <TouchableOpacity
                key={mood.id}
                onPress={() => handleMoodSelect(mood, index)}
                activeOpacity={0.8}
              >
                <Animated.View 
                  style={[
                    styles.moodCard,
                    isSelected && { 
                      backgroundColor: withAlpha(mood.color, 0.2),
                      borderColor: mood.color,
                    },
                    { transform: [{ scale: scaleAnims[index] }] }
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodName,
                    isSelected && { color: mood.color }
                  ]}>
                    {mood.name}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Craving Level */}
        <Text style={styles.sectionTitle}>🚬 Sigara İsteği Seviyesi</Text>
        <View style={styles.cravingCard}>
          <View style={styles.cravingSlider}>
            {cravingLevels.map((level) => {
              const isSelected = selectedCraving === level.level;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.cravingLevel,
                    isSelected && { 
                      backgroundColor: level.color,
                      transform: [{ scale: 1.1 }],
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCraving(level.level);
                  }}
                >
                  <Text style={[
                    styles.cravingNumber,
                    isSelected && { color: '#fff' }
                  ]}>
                    {level.level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.cravingLabels}>
            <Text style={styles.cravingLabel}>Yok</Text>
            <Text style={styles.cravingLabel}>Çok Yüksek</Text>
          </View>
        </View>

        {/* Triggers */}
        <Text style={styles.sectionTitle}>⚡ Tetikleyiciler</Text>
        <View style={styles.triggersGrid}>
          {triggers.map((trigger) => {
            const isSelected = selectedTriggers.includes(trigger.id);
            return (
              <TouchableOpacity
                key={trigger.id}
                style={[
                  styles.triggerChip,
                  isSelected && styles.triggerChipSelected
                ]}
                onPress={() => toggleTrigger(trigger.id)}
              >
                <Ionicons 
                  name={trigger.icon as any} 
                  size={18} 
                  color={isSelected ? Palette.primary[500] : SemanticColors.text.secondary}
                />
                <Text style={[
                  styles.triggerText,
                  isSelected && styles.triggerTextSelected
                ]}>
                  {trigger.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <Text style={styles.sectionTitle}>📝 Not (İsteğe Bağlı)</Text>
        <View style={styles.noteCard}>
          <TextInput
            style={styles.noteInput}
            placeholder="Bugün nasıl geçti? Ne hissettin?"
            placeholderTextColor={SemanticColors.text.tertiary}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <ScalePressable
          style={[
            styles.saveButton,
            !selectedMood && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!selectedMood}
        >
          <LinearGradient
            colors={selectedMood ? Gradients.primary as [string, string] : [Palette.neutral[600], Palette.neutral[700]]}
            style={styles.saveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.saveText}>Kaydet</Text>
          </LinearGradient>
        </ScalePressable>

        {/* Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Ionicons name="bulb" size={24} color={Palette.accent[500]} />
            <Text style={styles.insightsTitle}>Haftalık Analiz</Text>
          </View>
          <Text style={styles.insightsText}>
            Bu hafta en çok <Text style={styles.insightsHighlight}>stres</Text> ve{' '}
            <Text style={styles.insightsHighlight}>kahve</Text> sonrası sigara isteği duydunuz.
            Kahve içtiğinizde su içmeyi deneyin!
          </Text>
          <View style={styles.insightsTip}>
            <Ionicons name="sparkles" size={16} color={Palette.primary[500]} />
            <Text style={styles.insightsTipText}>
              Ruh haliniz %20 iyileşti! Harika gidiyorsunuz 🎉
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View 
          style={[
            styles.successOverlay,
            { opacity: successAnim }
          ]}
        >
          <LinearGradient
            colors={Gradients.success as [string, string]}
            style={styles.successCard}
          >
            <Ionicons name="checkmark-circle" size={64} color="#fff" />
            <Text style={styles.successText}>Kaydedildi!</Text>
            <Text style={styles.successSubtext}>Kendinizi takip etmeye devam edin</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
  },
  weeklyCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  weeklyTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.md,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  weeklyDay: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  weeklyMood: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyEmoji: {
    fontSize: 20,
  },
  cravingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  moodCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 4) / 5,
    aspectRatio: 0.85,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.xs,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodName: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  cravingCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  cravingSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cravingLevel: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SemanticColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cravingNumber: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
  },
  cravingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cravingLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    gap: Spacing.xs,
  },
  triggerChipSelected: {
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    borderColor: Palette.primary[500],
  },
  triggerText: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  triggerTextSelected: {
    color: Palette.primary[500],
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  noteInput: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    minHeight: 100,
  },
  saveButton: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    ...Shadows.none,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  saveText: {
    ...Typography.label.large,
    color: '#fff',
  },
  insightsCard: {
    backgroundColor: withAlpha(Palette.accent[500], 0.1),
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: withAlpha(Palette.accent[500], 0.2),
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  insightsTitle: {
    ...Typography.label.medium,
    color: Palette.accent[500],
  },
  insightsText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  insightsHighlight: {
    color: Palette.primary[500],
    fontWeight: '600',
  },
  insightsTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  insightsTipText: {
    ...Typography.caption.large,
    color: Palette.primary[500],
    flex: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    ...Typography.heading.h3,
    color: '#fff',
    marginTop: Spacing.md,
  },
  successSubtext: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

