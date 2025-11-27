import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

interface VoiceEntry {
  id: string;
  date: string;
  time: string;
  duration: string;
  mood: 'happy' | 'neutral' | 'sad' | 'stressed';
  transcript?: string;
  tags: string[];
}

const voiceEntries: VoiceEntry[] = [
  {
    id: '1',
    date: 'Bugün',
    time: '14:32',
    duration: '1:45',
    mood: 'happy',
    transcript: 'Bugün çok iyi hissediyorum. Sabahtan beri hiç sigara isteği gelmedi...',
    tags: ['Motivasyon', 'Başarı'],
  },
  {
    id: '2',
    date: 'Dün',
    time: '21:15',
    duration: '2:30',
    mood: 'stressed',
    transcript: 'İş yerinde stresli bir gün geçirdim. Nefes egzersizleri yardımcı oldu...',
    tags: ['Stres', 'Egzersiz'],
  },
  {
    id: '3',
    date: '22 Kas',
    time: '08:45',
    duration: '0:55',
    mood: 'neutral',
    transcript: 'Sabah rutinime başladım. Kahvaltıdan sonra hafif bir istek geldi...',
    tags: ['Sabah', 'İstek'],
  },
  {
    id: '4',
    date: '21 Kas',
    time: '19:20',
    duration: '3:15',
    mood: 'happy',
    transcript: 'Bir hafta oldu! Çok mutluyum, ailem de gurur duyuyor...',
    tags: ['Kutlama', 'Aile'],
  },
];

export default function VoiceJournalScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animations
      waveAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 200 + index * 50,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 200 + index * 50,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      pulseAnim.setValue(1);
      waveAnims.forEach((anim) => anim.setValue(0.3));
      setRecordingTime(0);
    }
  }, [isRecording]);

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(!isRecording);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodIcon = (mood: VoiceEntry['mood']) => {
    switch (mood) {
      case 'happy': return 'happy';
      case 'neutral': return 'remove-circle';
      case 'sad': return 'sad';
      case 'stressed': return 'alert-circle';
    }
  };

  const getMoodColor = (mood: VoiceEntry['mood']) => {
    switch (mood) {
      case 'happy': return Palette.success[500];
      case 'neutral': return Palette.info[500];
      case 'sad': return Palette.purple[500];
      case 'stressed': return Palette.accent[500];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>🎙️ Sesli Günlük</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="search" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recording Section */}
        <FadeIn delay={0}>
          <LinearGradient
            colors={isRecording 
              ? [Palette.error[500], Palette.error[600]] 
              : Gradients.purple as [string, string]
            }
            style={styles.recordingCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.recordingContent}>
              {isRecording ? (
                <>
                  <View style={styles.waveformContainer}>
                    {waveAnims.map((anim, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.waveBar,
                          {
                            transform: [{ scaleY: anim }],
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                  <Text style={styles.recordingLabel}>Kayıt yapılıyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="mic" size={48} color="#fff" style={{ marginBottom: Spacing.md }} />
                  <Text style={styles.recordingPrompt}>Bugün nasıl hissediyorsun?</Text>
                  <Text style={styles.recordingHint}>
                    Düşüncelerini sesli kaydet, sonra dinle
                  </Text>
                </>
              )}
            </View>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={toggleRecording}
              >
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={32} 
                  color={isRecording ? Palette.error[500] : "#fff"} 
                />
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </FadeIn>

        {/* Quick Prompts */}
        <FadeIn delay={100}>
          <Text style={styles.sectionTitle}>💬 Hızlı Konular</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsContainer}
          >
            {['Bugün nasıl hissediyorum', 'Sigara isteği geldi', 'Başarımı kutluyorum', 'Zorlandığım anlar', 'Minnettarım'].map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.promptChip}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsRecording(true);
                }}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={150}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{voiceEntries.length}</Text>
              <Text style={styles.statLabel}>Kayıt</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8:25</Text>
              <Text style={styles.statLabel}>Toplam Süre</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Gün Serisi</Text>
            </View>
          </View>
        </FadeIn>

        {/* Entries */}
        <FadeIn delay={200}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 Kayıtlarım</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {voiceEntries.map((entry, index) => (
            <ScalePressable key={entry.id} style={styles.entryCard} scaleValue={0.98}>
              <View style={styles.entryHeader}>
                <View style={styles.entryDate}>
                  <Text style={styles.entryDateText}>{entry.date}</Text>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>
                <View style={[styles.moodBadge, { backgroundColor: withAlpha(getMoodColor(entry.mood), 0.15) }]}>
                  <Ionicons name={getMoodIcon(entry.mood)} size={16} color={getMoodColor(entry.mood)} />
                </View>
              </View>

              {entry.transcript && (
                <Text style={styles.entryTranscript} numberOfLines={2}>
                  {entry.transcript}
                </Text>
              )}

              <View style={styles.entryFooter}>
                <View style={styles.entryTags}>
                  {entry.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.entryDuration}>
                  <Ionicons name="time-outline" size={14} color={SemanticColors.text.tertiary} />
                  <Text style={styles.durationText}>{entry.duration}</Text>
                </View>
              </View>

              <View style={styles.entryActions}>
                <TouchableOpacity style={styles.playButton}>
                  <LinearGradient
                    colors={Gradients.primary as [string, string]}
                    style={styles.playGradient}
                  >
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.playText}>Dinle</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color={SemanticColors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color={SemanticColors.text.secondary} />
                </TouchableOpacity>
              </View>
            </ScalePressable>
          ))}
        </FadeIn>

        {/* Tips */}
        <FadeIn delay={300}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={Palette.info[500]} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Neden Sesli Günlük?</Text>
              <Text style={styles.tipText}>
                Sesli düşünmek, duygularını daha iyi anlamana ve işlemene yardımcı olur. 
                Araştırmalar, sesli günlük tutmanın stresi azalttığını gösteriyor.
              </Text>
            </View>
          </View>
        </FadeIn>

        <View style={{ height: ComponentHeight.tabBar + 30 }} />
      </ScrollView>
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
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  recordingCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    minHeight: 220,
    ...Shadows.lg,
  },
  recordingContent: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  waveBar: {
    width: 6,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  recordingTime: {
    ...Typography.stat.large,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  recordingLabel: {
    ...Typography.body.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  recordingPrompt: {
    ...Typography.heading.h4,
    color: '#fff',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  recordingHint: {
    ...Typography.body.medium,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  recordButtonActive: {
    backgroundColor: '#fff',
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  promptsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  promptChip: {
    backgroundColor: SemanticColors.surface.default,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    marginRight: Spacing.sm,
  },
  promptText: {
    ...Typography.label.small,
    color: SemanticColors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.stat.small,
    color: SemanticColors.text.primary,
  },
  statLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: SemanticColors.border.subtle,
    marginHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.label.small,
    color: Palette.primary[500],
  },
  entryCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entryDateText: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  entryTime: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  moodBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTranscript: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  entryTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    ...Typography.caption.small,
    color: Palette.primary[500],
  },
  entryDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  playText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: SemanticColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: withAlpha(Palette.info[500], 0.1),
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: withAlpha(Palette.info[500], 0.2),
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  tipText: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    lineHeight: 20,
  },
});

