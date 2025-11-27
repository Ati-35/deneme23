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

interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: readonly string[];
}

const healthMetrics: HealthMetric[] = [
  {
    id: '1',
    name: 'Kan Basıncı',
    value: '120/80',
    unit: 'mmHg',
    change: -5,
    icon: 'pulse',
    color: Palette.error[500],
    gradient: Gradients.error,
  },
  {
    id: '2',
    name: 'Kalp Atışı',
    value: '72',
    unit: 'bpm',
    change: -8,
    icon: 'heart',
    color: Palette.error[400],
    gradient: Gradients.sunset,
  },
  {
    id: '3',
    name: 'Oksijen Seviyesi',
    value: '98',
    unit: '%',
    change: +3,
    icon: 'water',
    color: Palette.info[500],
    gradient: Gradients.ocean,
  },
  {
    id: '4',
    name: 'Akciğer Kapasitesi',
    value: '85',
    unit: '%',
    change: +12,
    icon: 'leaf',
    color: Palette.success[500],
    gradient: Gradients.forest,
  },
];

interface Symptom {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  frequency: 'sık' | 'ara sıra' | 'nadir' | 'yok';
}

const symptoms: Symptom[] = [
  { id: '1', name: 'Öksürük', icon: 'medical', frequency: 'ara sıra' },
  { id: '2', name: 'Nefes Darlığı', icon: 'cloud', frequency: 'nadir' },
  { id: '3', name: 'Baş Ağrısı', icon: 'flash', frequency: 'yok' },
  { id: '4', name: 'Uyku Bozukluğu', icon: 'moon', frequency: 'nadir' },
  { id: '5', name: 'Sinirlilik', icon: 'alert-circle', frequency: 'ara sıra' },
  { id: '6', name: 'Yorgunluk', icon: 'battery-half', frequency: 'nadir' },
];

const healthTimeline = [
  { id: '1', time: '20 dakika', title: 'Kalp atışı normalleşir', completed: true },
  { id: '2', time: '8 saat', title: 'Oksijen seviyesi yükselir', completed: true },
  { id: '3', time: '48 saat', title: 'Koku ve tat duyuları iyileşir', completed: true },
  { id: '4', time: '72 saat', title: 'Bronşlar gevşer, enerji artar', completed: true },
  { id: '5', time: '2 hafta', title: 'Dolaşım ve akciğer fonksiyonu iyileşir', completed: false },
  { id: '6', time: '1 ay', title: 'Öksürük ve nefes darlığı azalır', completed: false },
];

export default function HealthDiaryScreen() {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const progressAnims = useRef(healthMetrics.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    progressAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 150,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const getFrequencyColor = (frequency: Symptom['frequency']) => {
    switch (frequency) {
      case 'sık': return Palette.error[500];
      case 'ara sıra': return Palette.accent[500];
      case 'nadir': return Palette.info[500];
      case 'yok': return Palette.success[500];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>🩺 Sağlık Günlüğü</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Health Score Card */}
        <FadeIn delay={100}>
          <LinearGradient
            colors={Gradients.primaryVibrant as [string, string, string]}
            style={styles.scoreCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scoreDecor} />
            <View style={styles.scoreContent}>
              <Text style={styles.scoreLabel}>Sağlık Puanın</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>78</Text>
                <View style={styles.scoreChange}>
                  <Ionicons name="trending-up" size={16} color="#fff" />
                  <Text style={styles.scoreChangeText}>+12%</Text>
                </View>
              </View>
              <Text style={styles.scoreSubtext}>Sigarayı bıraktığından beri</Text>
            </View>
            <View style={styles.scoreCircle}>
              <View style={styles.scoreCircleInner}>
                <Ionicons name="heart" size={32} color={Palette.error[400]} />
              </View>
            </View>
          </LinearGradient>
        </FadeIn>

        {/* Health Metrics Grid */}
        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>📊 Sağlık Değerleri</Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric, index) => (
              <ScalePressable key={metric.id} style={styles.metricCard} scaleValue={0.98}>
                <LinearGradient
                  colors={metric.gradient as [string, string]}
                  style={styles.metricIconBg}
                >
                  <Ionicons name={metric.icon} size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.metricName}>{metric.name}</Text>
                <View style={styles.metricValueRow}>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </View>
                <View style={[
                  styles.metricChange,
                  { backgroundColor: withAlpha(metric.change > 0 ? Palette.success[500] : Palette.error[500], 0.15) }
                ]}>
                  <Ionicons 
                    name={metric.change > 0 ? "trending-up" : "trending-down"} 
                    size={12} 
                    color={metric.change > 0 ? Palette.success[500] : Palette.error[500]} 
                  />
                  <Text style={[
                    styles.metricChangeText,
                    { color: metric.change > 0 ? Palette.success[500] : Palette.error[500] }
                  ]}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </Text>
                </View>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* Symptoms Tracker */}
        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>🏥 Semptom Takibi</Text>
          <View style={styles.symptomsCard}>
            <Text style={styles.symptomsSubtitle}>
              Son 7 günde yaşadığın semptomlar
            </Text>
            <View style={styles.symptomsGrid}>
              {symptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomItem,
                    selectedSymptom === symptom.id && styles.symptomItemSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSymptom(selectedSymptom === symptom.id ? null : symptom.id);
                  }}
                >
                  <View style={[
                    styles.symptomIcon,
                    { backgroundColor: withAlpha(getFrequencyColor(symptom.frequency), 0.15) }
                  ]}>
                    <Ionicons 
                      name={symptom.icon} 
                      size={20} 
                      color={getFrequencyColor(symptom.frequency)} 
                    />
                  </View>
                  <Text style={styles.symptomName}>{symptom.name}</Text>
                  <View style={[
                    styles.frequencyBadge,
                    { backgroundColor: withAlpha(getFrequencyColor(symptom.frequency), 0.15) }
                  ]}>
                    <Text style={[
                      styles.frequencyText,
                      { color: getFrequencyColor(symptom.frequency) }
                    ]}>
                      {symptom.frequency}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeIn>

        {/* Health Timeline */}
        <FadeIn delay={400}>
          <Text style={styles.sectionTitle}>⏱️ İyileşme Zaman Çizelgesi</Text>
          <View style={styles.timelineCard}>
            {healthTimeline.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    { backgroundColor: item.completed ? Palette.success[500] : SemanticColors.border.default }
                  ]}>
                    {item.completed && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  {index < healthTimeline.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: item.completed ? Palette.success[500] : SemanticColors.border.default }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTime,
                    { color: item.completed ? Palette.success[500] : SemanticColors.text.tertiary }
                  ]}>
                    {item.time}
                  </Text>
                  <Text style={[
                    styles.timelineTitle,
                    !item.completed && styles.timelineTitleMuted
                  ]}>
                    {item.title}
                  </Text>
                </View>
                {item.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </FadeIn>

        {/* Doctor Note */}
        <FadeIn delay={500}>
          <View style={styles.doctorCard}>
            <LinearGradient
              colors={[withAlpha(Palette.info[500], 0.15), withAlpha(Palette.info[500], 0.05)]}
              style={styles.doctorGradient}
            >
              <View style={styles.doctorIcon}>
                <Ionicons name="medical" size={24} color={Palette.info[500]} />
              </View>
              <View style={styles.doctorContent}>
                <Text style={styles.doctorTitle}>Doktor Notu</Text>
                <Text style={styles.doctorText}>
                  Sigarayı bırakmaya devam et! Verilerine göre sağlık değerlerin hızla iyileşiyor. 
                  2 hafta sonra dolaşım sistemin önemli ölçüde düzelmiş olacak.
                </Text>
                <TouchableOpacity style={styles.doctorButton}>
                  <Text style={styles.doctorButtonText}>Uzman ile Görüş</Text>
                  <Ionicons name="arrow-forward" size={16} color={Palette.info[500]} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.primary,
  },
  scoreDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withAlpha('#fff', 0.1),
  },
  scoreContent: {
    flex: 1,
  },
  scoreLabel: {
    ...Typography.label.medium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  scoreChangeText: {
    ...Typography.label.small,
    color: '#fff',
  },
  scoreSubtext: {
    ...Typography.caption.large,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  metricCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  metricIconBg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  metricName: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  metricValue: {
    ...Typography.stat.small,
    color: SemanticColors.text.primary,
  },
  metricUnit: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  metricChangeText: {
    ...Typography.caption.small,
    fontWeight: '600',
  },
  symptomsCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  symptomsSubtitle: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.md,
  },
  symptomsGrid: {
    gap: Spacing.sm,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  symptomItemSelected: {
    backgroundColor: SemanticColors.background.tertiary,
  },
  symptomIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomName: {
    flex: 1,
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  frequencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  frequencyText: {
    ...Typography.caption.small,
    fontWeight: '600',
  },
  timelineCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  timelineTime: {
    ...Typography.caption.medium,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineTitle: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  timelineTitleMuted: {
    color: SemanticColors.text.tertiary,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: withAlpha(Palette.success[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    ...Typography.caption.medium,
    color: Palette.success[500],
    fontWeight: '600',
  },
  doctorCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(Palette.info[500], 0.2),
  },
  doctorGradient: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(Palette.info[500], 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorContent: {
    flex: 1,
  },
  doctorTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  doctorText: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  doctorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  doctorButtonText: {
    ...Typography.label.medium,
    color: Palette.info[500],
  },
});

