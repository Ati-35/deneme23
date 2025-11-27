import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
// Modern Design System Imports
import Colors, { 
  SemanticColors, 
  Palette, 
  Gradients, 
  Shadows,
  withAlpha 
} from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../../constants/DesignTokens';
import { motivationalQuotes, healthMilestones } from '../../constants/Data';
import { ScalePressable, triggerHaptic } from '../../components/interactions';
import { FadeIn, AnimatedCounter, PulseAnimation } from '../../components/animations';

const { width, height } = Dimensions.get('window');

type IconName = keyof typeof Ionicons.glyphMap;

interface QuickFeature {
  id: string;
  icon: IconName;
  label: string;
  colors: readonly string[];
  route: string;
  badge?: string;
  isNew?: boolean;
}

// Updated quick features with new functionality
const quickFeatures: QuickFeature[] = [
  { id: '1', icon: 'book', label: 'Günlük', colors: Gradients.purple, route: '/journal' },
  { id: '2', icon: 'fitness', label: 'Nefes', colors: Gradients.ocean, route: '/breathingExercise', isNew: true },
  { id: '3', icon: 'leaf', label: 'Meditasyon', colors: Gradients.forest, route: '/meditation' },
  { id: '4', icon: 'happy', label: 'Ruh Hali', colors: Gradients.sunset, route: '/moodTracker' },
];

// New features grid
interface NewFeatureItem {
  id: string;
  icon: IconName;
  label: string;
  description: string;
  gradient: readonly string[];
  route: string;
  badge?: string;
}

const newFeatures: NewFeatureItem[] = [
  { id: '1', icon: 'sparkles', label: 'AI Koç', description: '7/24 Destek', gradient: Gradients.purple, route: '/aiCoach', badge: 'YENİ' },
  { id: '2', icon: 'game-controller', label: 'Mini Oyunlar', description: 'Dikkatini Dağıt', gradient: Gradients.accent, route: '/miniGames' },
  { id: '3', icon: 'moon', label: 'Uyku Takibi', description: 'Uyku Kalitesi', gradient: ['#1a1a2e', '#16213e'] as const, route: '/sleepTracker', badge: 'YENİ' },
  { id: '4', icon: 'people', label: 'Arkadaş Bul', description: 'Birlikte Güçlü', gradient: Gradients.sunset, route: '/socialMatch' },
  { id: '5', icon: 'mic', label: 'Sesli Günlük', description: 'Düşüncelerini Kaydet', gradient: Gradients.info, route: '/voiceJournal', badge: 'YENİ' },
  { id: '6', icon: 'document-text', label: 'Haftalık Rapor', description: 'İlerleme Özeti', gradient: Gradients.forest, route: '/weeklyReport' },
];

export default function HomeScreen() {
  const [quitDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  // Calculate time since quit
  const getTimeSinceQuit = () => {
    const now = new Date();
    const diff = now.getTime() - quitDate.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const timeSinceQuit = getTimeSinceQuit();
  const moneySaved = timeSinceQuit.days * 50;
  const cigarettesNotSmoked = timeSinceQuit.days * 20;
  const healthProgress = Math.min((timeSinceQuit.days / 30) * 100, 100);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
    }, 10000);
    
    // SOS pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: healthProgress / 100,
      duration: 2000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Particle animations
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
    
    return () => clearInterval(interval);
  }, []);

  const handleSOSPress = () => {
    triggerHaptic('heavy');
    router.push('/sos');
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Animated Background Particles */}
      <View style={styles.particlesContainer}>
        {particleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${10 + (index * 15)}%`,
                top: `${5 + (index * 12)}%`,
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.03, 0.08],
                }),
                transform: [{
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                }, {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Merhaba! 👋</Text>
              <Text style={styles.subtitle}>Bugün de güçlüsün!</Text>
            </View>
            <View style={styles.headerButtons}>
              {/* SOS Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity 
                  style={styles.sosButton}
                  onPress={handleSOSPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Gradients.error as [string, string]}
                    style={styles.sosGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="pulse" size={16} color="#fff" />
                    <Text style={styles.sosText}>SOS</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              <ScalePressable onPress={() => router.push('/profile')} haptic="light">
                <View style={styles.notificationBtn}>
                  <Ionicons name="notifications-outline" size={22} color={SemanticColors.text.primary} />
                  <View style={styles.notificationBadge} />
                </View>
              </ScalePressable>
            </View>
          </View>
        </FadeIn>

        {/* Main Stats Card with Premium Glow Effect */}
        <FadeIn delay={100}>
          <Animated.View style={[styles.mainCardContainer, { transform: [{ translateY: floatAnim }] }]}>
            <View style={styles.mainCardGlow} />
            <LinearGradient
              colors={Gradients.primaryVibrant as [string, string, ...string[]]}
              style={styles.mainStatCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Rotating decorative ring */}
              <Animated.View style={[styles.decorRing, { transform: [{ rotate: spin }] }]}>
                {[...Array(8)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.ringDot,
                      { transform: [{ rotate: `${i * 45}deg` }, { translateY: -70 }] }
                    ]} 
                  />
                ))}
              </Animated.View>

              {/* Decorative elements */}
              <View style={styles.mainStatDecor1} />
              <View style={styles.mainStatDecor2} />
              
              <View style={styles.mainStatContent}>
                <View style={styles.daysContainer}>
                  <Animated.View style={[styles.daysGlow, { opacity: glowAnim }]} />
                  <Text style={styles.daysNumber}>{timeSinceQuit.days}</Text>
                  <Text style={styles.daysLabel}>GÜN</Text>
                </View>
                <View style={styles.timeDetails}>
                  <View style={styles.timeItem}>
                    <Text style={styles.timeValue}>{timeSinceQuit.hours}</Text>
                    <Text style={styles.timeLabel}>saat</Text>
                  </View>
                  <View style={styles.timeSeparator} />
                  <View style={styles.timeItem}>
                    <Text style={styles.timeValue}>{timeSinceQuit.minutes}</Text>
                    <Text style={styles.timeLabel}>dakika</Text>
                  </View>
                </View>
              </View>
              <View style={styles.mainStatTitleContainer}>
                <Ionicons name="trophy" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.mainStatTitle}>Sigarasız Geçen Süre</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(healthProgress)}% Aylık Hedef</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </FadeIn>

        {/* Quick Features Grid */}
        <FadeIn delay={150}>
          <Text style={styles.sectionTitle}>🚀 Hızlı Erişim</Text>
          <View style={styles.quickFeaturesGrid}>
            {quickFeatures.map((feature, index) => (
              <ScalePressable
                key={feature.id}
                style={styles.quickFeatureCard}
                onPress={() => router.push(feature.route as any)}
                scaleValue={0.95}
              >
                <LinearGradient
                  colors={feature.colors as [string, string]}
                  style={styles.quickFeatureGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {feature.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>YENİ</Text>
                    </View>
                  )}
                  <Ionicons name={feature.icon} size={28} color="#fff" />
                  <Text style={styles.quickFeatureText}>{feature.label}</Text>
                </LinearGradient>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* Stats Grid */}
        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>📊 Başarılarınız</Text>
          <View style={styles.statsGrid}>
            <ScalePressable 
              style={styles.statCard}
              onPress={() => router.push('/savings')}
            >
              <LinearGradient
                colors={Gradients.accent as [string, string]}
                style={styles.statIconBg}
              >
                <Ionicons name="cash-outline" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>₺{moneySaved}</Text>
              <Text style={styles.statLabel}>Tasarruf</Text>
            </ScalePressable>
            
            <ScalePressable style={styles.statCard}>
              <LinearGradient
                colors={Gradients.error as [string, string]}
                style={styles.statIconBg}
              >
                <Ionicons name="ban-outline" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>{cigarettesNotSmoked}</Text>
              <Text style={styles.statLabel}>İçilmeyen Sigara</Text>
            </ScalePressable>
            
            <ScalePressable 
              style={styles.statCard}
              onPress={() => router.push('/healthDiary')}
            >
              <LinearGradient
                colors={Gradients.health as [string, string]}
                style={styles.statIconBg}
              >
                <Ionicons name="heart-outline" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>+15%</Text>
              <Text style={styles.statLabel}>Sağlık</Text>
            </ScalePressable>
            
            <ScalePressable 
              style={styles.statCard}
              onPress={() => router.push('/gamification')}
            >
              <LinearGradient
                colors={Gradients.purple as [string, string]}
                style={styles.statIconBg}
              >
                <Ionicons name="trophy-outline" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>Seviye 5</Text>
              <Text style={styles.statLabel}>Başarılar</Text>
            </ScalePressable>
          </View>
        </FadeIn>

        {/* New Features Row - Premium Grid */}
        <FadeIn delay={250}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Yeni Özellikler</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaBadgeText}>10 YENİ</Text>
            </View>
          </View>
          <View style={styles.newFeaturesGrid}>
            {newFeatures.map((feature, index) => (
              <ScalePressable
                key={feature.id}
                style={styles.newFeatureCard}
                onPress={() => router.push(feature.route as any)}
                scaleValue={0.96}
              >
                <LinearGradient
                  colors={feature.gradient as [string, string]}
                  style={styles.newFeatureGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {feature.badge && (
                    <View style={styles.featureBadge}>
                      <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                    </View>
                  )}
                  <View style={styles.newFeatureIcon}>
                    <Ionicons name={feature.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.newFeatureTitle}>{feature.label}</Text>
                  <Text style={styles.newFeatureDesc}>{feature.description}</Text>
                </LinearGradient>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* AI Coach Promo Card */}
        <FadeIn delay={280}>
          <ScalePressable 
            style={styles.promoCard}
            onPress={() => router.push('/aiCoach')}
            scaleValue={0.98}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1', '#4F46E5'] as [string, string, string]}
              style={styles.promoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.promoDecor} />
              <View style={styles.promoContent}>
                <View style={styles.promoIconContainer}>
                  <Ionicons name="sparkles" size={32} color="#fff" />
                </View>
                <Text style={styles.promoTitle}>AI Koçunla Tanış! 🤖</Text>
                <Text style={styles.promoText}>
                  7/24 kişisel destek, anında motivasyon ve sigara isteğiyle başa çıkma teknikleri
                </Text>
                <View style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Şimdi Konuş</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </ScalePressable>
        </FadeIn>

        {/* Motivasyon Kartı */}
        <FadeIn delay={300}>
          <View style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <View style={styles.quoteIconContainer}>
                <Ionicons name="sparkles" size={24} color={Palette.accent[500]} />
              </View>
              <Text style={styles.quoteLabel}>Günün Motivasyonu</Text>
            </View>
            <Text style={styles.quoteText}>"{currentQuote.quote}"</Text>
            <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
          </View>
        </FadeIn>

        {/* Sağlık Zaman Çizelgesi Önizleme */}
        <FadeIn delay={350}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❤️ Sağlık İyileşmeniz</Text>
            <TouchableOpacity onPress={() => router.push('/health')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.healthScrollContent}
          >
            {healthMilestones.slice(0, 4).map((milestone, index) => (
              <ScalePressable key={milestone.id} scaleValue={0.98}>
                <View style={styles.healthCard}>
                  <View style={[styles.healthIconContainer, { backgroundColor: withAlpha(milestone.color, 0.15) }]}>
                    <Ionicons name="checkmark-circle" size={28} color={milestone.color} />
                  </View>
                  <Text style={styles.healthTime}>{milestone.time}</Text>
                  <Text style={styles.healthTitle}>{milestone.title}</Text>
                  <View style={[
                    styles.healthStatus, 
                    { backgroundColor: index < 2 ? withAlpha(Palette.success[500], 0.15) : withAlpha(SemanticColors.text.tertiary, 0.15) }
                  ]}>
                    <Text style={[
                      styles.healthStatusText,
                      { color: index < 2 ? Palette.success[500] : SemanticColors.text.tertiary }
                    ]}>
                      {index < 2 ? '✓ Tamamlandı' : 'Devam ediyor'}
                    </Text>
                  </View>
                </View>
              </ScalePressable>
            ))}
          </ScrollView>
        </FadeIn>

        {/* Today's Tips */}
        <FadeIn delay={400}>
          <View style={styles.tipsCard}>
            <LinearGradient
              colors={[withAlpha(Palette.info[500], 0.15), withAlpha(Palette.info[500], 0.05)]}
              style={styles.tipsGradient}
            >
              <View style={styles.tipsHeader}>
                <View style={styles.tipsIcon}>
                  <Ionicons name="bulb" size={24} color={Palette.info[500]} />
                </View>
                <Text style={styles.tipsTitle}>Günün İpucu</Text>
              </View>
              <Text style={styles.tipsText}>
                Sigara isteği geldiğinde 5 derin nefes alın. İstek genellikle 3-5 dakika içinde geçer.
              </Text>
              <TouchableOpacity 
                style={styles.tipsButton}
                onPress={() => router.push('/breathingExercise')}
              >
                <Text style={styles.tipsButtonText}>Nefes Egzersizi Yap</Text>
                <Ionicons name="arrow-forward" size={16} color={Palette.info[500]} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </FadeIn>

        {/* Tab bar için boşluk */}
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
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Palette.primary[500],
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sosButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.error,
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  sosText: {
    ...Typography.label.small,
    color: '#fff',
    letterSpacing: 1,
  },
  greeting: {
    ...Typography.heading.h2,
    color: SemanticColors.text.primary,
  },
  subtitle: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.xs,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.error[500],
    borderWidth: 2,
    borderColor: SemanticColors.surface.default,
  },
  
  // Main Card
  mainCardContainer: {
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  mainCardGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: -10,
    backgroundColor: Palette.primary[500],
    borderRadius: BorderRadius['2xl'],
    opacity: 0.3,
  },
  mainStatCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.primary,
  },
  decorRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -75,
    marginLeft: -75,
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: withAlpha('#fff', 0.2),
  },
  mainStatDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withAlpha('#fff', 0.08),
  },
  mainStatDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withAlpha('#fff', 0.05),
  },
  mainStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  daysContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  daysGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withAlpha('#fff', 0.2),
    transform: [{ scale: 1.2 }],
  },
  daysNumber: {
    ...Typography.stat.hero,
    color: '#fff',
  },
  daysLabel: {
    ...Typography.overline,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 4,
    marginTop: -8,
  },
  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha('#FFFFFF', 0.15),
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.1),
  },
  timeItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  timeValue: {
    ...Typography.stat.small,
    color: '#fff',
  },
  timeLabel: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  timeSeparator: {
    width: 1,
    height: 28,
    backgroundColor: withAlpha('#FFFFFF', 0.3),
  },
  mainStatTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mainStatTitle: {
    ...Typography.label.medium,
    color: '#fff',
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: withAlpha('#fff', 0.2),
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption.small,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  
  // Section Title
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
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
  betaBadge: {
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  betaBadgeText: {
    ...Typography.caption.small,
    color: Palette.accent[500],
    fontWeight: '700',
  },
  
  // Quick Features
  quickFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickFeatureCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  quickFeatureGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'relative',
  },
  quickFeatureText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  newBadgeText: {
    ...Typography.caption.small,
    color: Palette.purple[600],
    fontWeight: '700',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    ...Shadows.sm,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    ...Typography.stat.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  
  // New Features Grid
  newFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  newFeatureCard: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  newFeatureGradient: {
    padding: Spacing.sm,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
    position: 'relative',
  },
  featureBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  featureBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: Palette.primary[600],
  },
  newFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha('#fff', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  newFeatureTitle: {
    ...Typography.caption.large,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  newFeatureDesc: {
    ...Typography.caption.small,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 2,
  },

  // Promo Card
  promoCard: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  promoGradient: {
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  promoDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withAlpha('#fff', 0.1),
  },
  promoContent: {
    alignItems: 'center',
  },
  promoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withAlpha('#fff', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  promoTitle: {
    ...Typography.heading.h3,
    color: '#fff',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  promoText: {
    ...Typography.body.medium,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
    maxWidth: '80%',
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha('#fff', 0.2),
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: withAlpha('#fff', 0.3),
  },
  promoButtonText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  
  // Quote Card
  quoteCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    ...Shadows.sm,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  quoteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteLabel: {
    ...Typography.label.small,
    color: Palette.accent[500],
  },
  quoteText: {
    ...Typography.body.large,
    color: SemanticColors.text.primary,
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  quoteAuthor: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    textAlign: 'right',
  },
  
  // Health Cards
  healthScrollContent: {
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  healthCard: {
    width: 160,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    ...Shadows.sm,
  },
  healthIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  healthTime: {
    ...Typography.caption.large,
    color: Palette.primary[500],
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  healthTitle: {
    ...Typography.body.small,
    fontWeight: '600',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  healthStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
  },
  healthStatusText: {
    ...Typography.caption.medium,
    fontWeight: '600',
  },
  
  // Tips Card
  tipsCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(Palette.info[500], 0.2),
  },
  tipsGradient: {
    padding: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(Palette.info[500], 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    ...Typography.label.medium,
    color: Palette.info[500],
  },
  tipsText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tipsButtonText: {
    ...Typography.label.small,
    color: Palette.info[500],
  },
});
