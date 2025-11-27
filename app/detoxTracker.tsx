import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';

const { width } = Dimensions.get('window');

interface DetoxOrgan {
  id: string;
  name: string;
  icon: string;
  progress: number;
  color: string;
  gradient: readonly string[];
  description: string;
  benefits: string[];
  timeToRecover: string;
}

const detoxOrgans: DetoxOrgan[] = [
  {
    id: 'lungs',
    name: 'Akciğerler',
    icon: 'cloud',
    progress: 45,
    color: Palette.secondary[500],
    gradient: Gradients.ocean,
    description: 'Akciğerleriniz temizleniyor ve kapasite artıyor',
    benefits: [
      'Öksürük azaldı',
      'Nefes darlığı azaldı',
      'Mukus üretimi normalleşiyor',
    ],
    timeToRecover: '9 ay',
  },
  {
    id: 'heart',
    name: 'Kalp',
    icon: 'heart',
    progress: 65,
    color: Palette.error[500],
    gradient: Gradients.error,
    description: 'Kalp sağlığınız hızla iyileşiyor',
    benefits: [
      'Kalp atış hızı normalleşti',
      'Kan basıncı düştü',
      'Kalp krizi riski %50 azaldı',
    ],
    timeToRecover: '1 yıl',
  },
  {
    id: 'blood',
    name: 'Kan',
    icon: 'water',
    progress: 85,
    color: Palette.success[500],
    gradient: Gradients.success,
    description: 'Kanınız temizleniyor ve oksijen taşıma kapasitesi artıyor',
    benefits: [
      'Karbonmonoksit seviyesi normal',
      'Oksijen seviyesi arttı',
      'Dolaşım iyileşti',
    ],
    timeToRecover: '2 hafta',
  },
  {
    id: 'skin',
    name: 'Cilt',
    icon: 'sunny',
    progress: 55,
    color: Palette.accent[500],
    gradient: Gradients.accent,
    description: 'Cildiniz yenileniyor ve parlaklık kazanıyor',
    benefits: [
      'Cilt tonu iyileşti',
      'Kırışıklıklar azaldı',
      'Elastikiyet arttı',
    ],
    timeToRecover: '3 ay',
  },
  {
    id: 'mouth',
    name: 'Ağız & Diş',
    icon: 'happy',
    progress: 70,
    color: Palette.info[500],
    gradient: Gradients.info,
    description: 'Ağız sağlığınız düzeliyor',
    benefits: [
      'Diş eti hastalığı riski azaldı',
      'Nefes kokusu iyileşti',
      'Tat alma duyusu arttı',
    ],
    timeToRecover: '2 hafta',
  },
  {
    id: 'brain',
    name: 'Beyin',
    icon: 'bulb',
    progress: 40,
    color: Palette.purple[500],
    gradient: Gradients.purple,
    description: 'Beyin fonksiyonlarınız iyileşiyor',
    benefits: [
      'Konsantrasyon arttı',
      'Nikotin reseptörleri normalleşiyor',
      'Stres yönetimi iyileşti',
    ],
    timeToRecover: '3 ay',
  },
];

interface Timeline {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  color: string;
}

const detoxTimeline: Timeline[] = [
  {
    id: '1',
    time: '20 dakika',
    title: 'Kalp Atışı Normalleşir',
    description: 'Kalp atış hızınız ve kan basıncınız düşmeye başlar',
    icon: 'heart',
    completed: true,
    color: Palette.error[500],
  },
  {
    id: '2',
    time: '8 saat',
    title: 'Oksijen Seviyesi Artar',
    description: 'Kanınızdaki karbonmonoksit yarıya düşer',
    icon: 'fitness',
    completed: true,
    color: Palette.success[500],
  },
  {
    id: '3',
    time: '24 saat',
    title: 'Kalp Krizi Riski Azalır',
    description: 'Kalp krizi riskiniz azalmaya başlar',
    icon: 'shield-checkmark',
    completed: true,
    color: Palette.info[500],
  },
  {
    id: '4',
    time: '48 saat',
    title: 'Duyular Keskinleşir',
    description: 'Tat ve koku alma duyularınız iyileşir',
    icon: 'restaurant',
    completed: true,
    color: Palette.accent[500],
  },
  {
    id: '5',
    time: '72 saat',
    title: 'Nikotin Vücudunuzdan Çıkar',
    description: 'Bronş tüpleriniz gevşer, nefes almak kolaylaşır',
    icon: 'leaf',
    completed: true,
    color: Palette.primary[500],
  },
  {
    id: '6',
    time: '1-2 hafta',
    title: 'Dolaşım İyileşir',
    description: 'Egzersiz yapmak kolaylaşır, yürürken nefes açılır',
    icon: 'walk',
    completed: false,
    color: Palette.secondary[500],
  },
  {
    id: '7',
    time: '1-9 ay',
    title: 'Akciğer Kapasitesi Artar',
    description: 'Öksürük azalır, akciğer fonksiyonları %10 iyileşir',
    icon: 'cloud',
    completed: false,
    color: Palette.purple[500],
  },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DetoxTrackerScreen() {
  const [selectedOrgan, setSelectedOrgan] = useState<DetoxOrgan | null>(null);
  const overallProgress = Math.round(
    detoxOrgans.reduce((acc, org) => acc + org.progress, 0) / detoxOrgans.length
  );
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const organAnims = useRef(detoxOrgans.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animate overall progress
    Animated.timing(progressAnim, {
      toValue: overallProgress / 100,
      duration: 2000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    // Animate organ progress
    organAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: detoxOrgans[index].progress / 100,
        duration: 1500 + index * 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
        delay: index * 100,
      }).start();
    });
  }, []);

  const CircularProgress = ({ progress, size, strokeWidth, color }: {
    progress: number;
    size: number;
    strokeWidth: number;
    color: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const animatedProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, [progress]);

    return (
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={withAlpha(color, 0.6)} />
          </SvgGradient>
        </Defs>
        <Circle
          stroke={withAlpha(color, 0.15)}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke="url(#progressGradient)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [circumference, circumference * (1 - progress / 100)],
          })}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
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
          <Text style={styles.title}>🧬 Detoksifikasyon</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Overall Progress */}
        <View style={styles.overallCard}>
          <LinearGradient
            colors={Gradients.primaryVibrant as [string, string, ...string[]]}
            style={styles.overallGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.overallOverlay} />
            <View style={styles.overallContent}>
              <View style={styles.circularContainer}>
                <CircularProgress 
                  progress={overallProgress} 
                  size={140} 
                  strokeWidth={12}
                  color="#fff"
                />
                <View style={styles.circularCenter}>
                  <Animated.Text style={styles.overallPercent}>
                    {progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${overallProgress}%`],
                    })}
                  </Animated.Text>
                  <Text style={styles.overallLabel}>Detoks</Text>
                </View>
              </View>
              <View style={styles.overallInfo}>
                <Text style={styles.overallTitle}>Vücudunuz Temizleniyor</Text>
                <Text style={styles.overallDescription}>
                  7 günde harika ilerleme kaydettiniz! Organlarınız iyileşmeye devam ediyor.
                </Text>
                <View style={styles.overallStats}>
                  <View style={styles.overallStat}>
                    <Ionicons name="time" size={18} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.overallStatText}>7 Gün</Text>
                  </View>
                  <View style={styles.overallStat}>
                    <Ionicons name="trending-up" size={18} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.overallStatText}>+12% Bu Hafta</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Organ Grid */}
        <Text style={styles.sectionTitle}>🫁 Organ Detoksu</Text>
        <View style={styles.organsGrid}>
          {detoxOrgans.map((organ, index) => (
            <ScalePressable
              key={organ.id}
              style={styles.organCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedOrgan(selectedOrgan?.id === organ.id ? null : organ);
              }}
              scaleValue={0.98}
            >
              <View style={[
                styles.organIconContainer,
                { backgroundColor: withAlpha(organ.color, 0.15) }
              ]}>
                <Ionicons name={organ.icon as any} size={28} color={organ.color} />
              </View>
              <Text style={styles.organName}>{organ.name}</Text>
              <View style={styles.organProgressContainer}>
                <View style={styles.organProgressBar}>
                  <Animated.View 
                    style={[
                      styles.organProgressFill,
                      { 
                        backgroundColor: organ.color,
                        width: organAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.organProgressText, { color: organ.color }]}>
                  {organ.progress}%
                </Text>
              </View>
            </ScalePressable>
          ))}
        </View>

        {/* Selected Organ Details */}
        {selectedOrgan && (
          <Animated.View style={styles.organDetails}>
            <LinearGradient
              colors={selectedOrgan.gradient as [string, string]}
              style={styles.organDetailsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.organDetailsHeader}>
                <Ionicons name={selectedOrgan.icon as any} size={32} color="#fff" />
                <View style={styles.organDetailsHeaderText}>
                  <Text style={styles.organDetailsTitle}>{selectedOrgan.name}</Text>
                  <Text style={styles.organDetailsSubtitle}>
                    Tam iyileşme: {selectedOrgan.timeToRecover}
                  </Text>
                </View>
              </View>
              <Text style={styles.organDetailsDescription}>
                {selectedOrgan.description}
              </Text>
              <View style={styles.organDetailsBenefits}>
                {selectedOrgan.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>📅 İyileşme Zaman Çizelgesi</Text>
        <View style={styles.timeline}>
          {detoxTimeline.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLine}>
                <View style={[
                  styles.timelineDot,
                  { 
                    backgroundColor: item.completed ? item.color : SemanticColors.background.tertiary,
                    borderColor: item.completed ? 'transparent' : SemanticColors.border.default,
                  }
                ]}>
                  {item.completed && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
                {index < detoxTimeline.length - 1 && (
                  <View style={[
                    styles.timelineConnector,
                    { backgroundColor: item.completed ? withAlpha(item.color, 0.3) : SemanticColors.border.subtle }
                  ]} />
                )}
              </View>
              <View style={[
                styles.timelineContent,
                item.completed && styles.timelineContentCompleted,
              ]}>
                <View style={styles.timelineHeader}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: withAlpha(item.color, item.completed ? 0.2 : 0.1) }
                  ]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={18} 
                      color={item.completed ? item.color : SemanticColors.text.tertiary}
                    />
                  </View>
                  <Text style={[
                    styles.timelineTime,
                    { color: item.completed ? item.color : SemanticColors.text.tertiary }
                  ]}>
                    {item.time}
                  </Text>
                </View>
                <Text style={[
                  styles.timelineTitle,
                  !item.completed && styles.timelineTitlePending
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.timelineDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="sparkles" size={24} color={Palette.accent[500]} />
            <Text style={styles.tipsTitle}>Detoksu Hızlandır</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>💧</Text>
              <Text style={styles.tipText}>Günde 2-3 litre su için</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>🥗</Text>
              <Text style={styles.tipText}>Antioksidan zengin besinler tüketin</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>🏃</Text>
              <Text style={styles.tipText}>Düzenli egzersiz yapın</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>😴</Text>
              <Text style={styles.tipText}>7-8 saat kaliteli uyku alın</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
  backBtn: {
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
  overallCard: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  overallGradient: {
    padding: Spacing.lg,
  },
  overallOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha('#000', 0.1),
  },
  overallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  overallPercent: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  overallLabel: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  overallInfo: {
    flex: 1,
  },
  overallTitle: {
    ...Typography.heading.h4,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  overallDescription: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  overallStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  overallStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  overallStatText: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  organsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  organCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  organIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  organName: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.sm,
  },
  organProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  organProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: SemanticColors.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  organProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  organProgressText: {
    ...Typography.label.small,
    fontWeight: '700',
  },
  organDetails: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  organDetailsGradient: {
    padding: Spacing.lg,
  },
  organDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  organDetailsHeaderText: {
    flex: 1,
  },
  organDetailsTitle: {
    ...Typography.heading.h4,
    color: '#fff',
  },
  organDetailsSubtitle: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  organDetailsDescription: {
    ...Typography.body.medium,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  organDetailsBenefits: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.9)',
  },
  timeline: {
    marginBottom: Spacing.xl,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLine: {
    alignItems: 'center',
    width: 40,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  timelineContentCompleted: {
    borderColor: withAlpha(Palette.success[500], 0.3),
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineTime: {
    ...Typography.label.small,
    fontWeight: '600',
  },
  timelineTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  timelineTitlePending: {
    color: SemanticColors.text.tertiary,
  },
  timelineDescription: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: withAlpha(Palette.accent[500], 0.1),
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: withAlpha(Palette.accent[500], 0.2),
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    ...Typography.label.large,
    color: Palette.accent[500],
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
  },
});

