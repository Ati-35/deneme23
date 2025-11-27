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
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';

const { width, height } = Dimensions.get('window');

interface MeditationSession {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  type: 'breathing' | 'guided' | 'ambient' | 'body-scan';
  gradient: readonly string[];
  icon: string;
  description: string;
}

const meditationSessions: MeditationSession[] = [
  {
    id: '1',
    title: 'Sabah Uyanış',
    subtitle: 'Güne enerjik başla',
    duration: 5,
    type: 'guided',
    gradient: ['#FF9A8B', '#FF6A88', '#FF99AC'] as const,
    icon: 'sunny',
    description: 'Güne pozitif enerji ile başlamak için ideal bir başlangıç seansı.',
  },
  {
    id: '2',
    title: 'Derin Nefes',
    subtitle: '4-7-8 tekniği',
    duration: 10,
    type: 'breathing',
    gradient: Gradients.ocean,
    icon: 'leaf',
    description: 'Stresi azaltan ve zihni sakinleştiren nefes tekniği.',
  },
  {
    id: '3',
    title: 'Kriz Anı',
    subtitle: 'Acil sakinleşme',
    duration: 3,
    type: 'breathing',
    gradient: Gradients.error,
    icon: 'pulse',
    description: 'Sigara isteği geldiğinde hızlı sakinleşme için.',
  },
  {
    id: '4',
    title: 'Beden Taraması',
    subtitle: 'Farkındalık meditasyonu',
    duration: 15,
    type: 'body-scan',
    gradient: Gradients.purple,
    icon: 'body',
    description: 'Vücudunuzdaki gerginlikleri fark edin ve bırakın.',
  },
  {
    id: '5',
    title: 'Gece Rahatlama',
    subtitle: 'Kaliteli uyku için',
    duration: 20,
    type: 'guided',
    gradient: Gradients.midnight,
    icon: 'moon',
    description: 'Günün stresini bırakın ve huzurla uykuya dalın.',
  },
  {
    id: '6',
    title: 'Doğa Sesleri',
    subtitle: 'Orman & yağmur',
    duration: 30,
    type: 'ambient',
    gradient: Gradients.forest,
    icon: 'rainy',
    description: 'Rahatlatıcı doğa sesleri ile zihinsel dinlenme.',
  },
];

const ambientSounds = [
  { id: '1', name: 'Yağmur', icon: 'rainy', color: Palette.info[500] },
  { id: '2', name: 'Orman', icon: 'leaf', color: Palette.success[500] },
  { id: '3', name: 'Dalga', icon: 'water', color: Palette.secondary[500] },
  { id: '4', name: 'Kuş', icon: 'musical-notes', color: Palette.accent[500] },
  { id: '5', name: 'Ateş', icon: 'flame', color: Palette.error[500] },
  { id: '6', name: 'Rüzgar', icon: 'cloudy', color: Palette.purple[500] },
];

export default function MeditationScreen() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSounds, setSelectedSounds] = useState<string[]>([]);
  
  const breathAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && selectedSession) {
      // Timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= selectedSession.duration * 60) {
            stopMeditation();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      // Breathing animation
      const breathAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, {
            toValue: 1.4,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Rotation animation
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      breathAnimation.start();
      rotationAnimation.start();
      pulseAnimation.start();

      return () => {
        breathAnimation.stop();
        rotationAnimation.stop();
        pulseAnimation.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isPlaying, selectedSession]);

  const startMeditation = (session: MeditationSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSession(session);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const stopMeditation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying(false);
    setCurrentTime(0);
    breathAnim.setValue(1);
    rotateAnim.setValue(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleSound = (soundId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSounds(prev => 
      prev.includes(soundId) 
        ? prev.filter(id => id !== soundId)
        : [...prev, soundId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isPlaying && selectedSession) {
    return (
      <View style={styles.playerContainer}>
        <LinearGradient
          colors={selectedSession.gradient as [string, string, ...string[]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Background orbs */}
        <Animated.View 
          style={[
            styles.backgroundOrb,
            styles.orb1,
            { transform: [{ scale: breathAnim }, { rotate: rotation }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.backgroundOrb,
            styles.orb2,
            { transform: [{ scale: pulseAnim }] }
          ]} 
        />
        
        <SafeAreaView style={styles.playerContent}>
          {/* Header */}
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={stopMeditation} style={styles.backButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.playerType}>
              {selectedSession.type === 'breathing' ? 'Nefes Egzersizi' :
               selectedSession.type === 'guided' ? 'Rehberli Meditasyon' :
               selectedSession.type === 'body-scan' ? 'Beden Taraması' : 'Ambient'}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Main content */}
          <View style={styles.playerMain}>
            <Text style={styles.playerTitle}>{selectedSession.title}</Text>
            <Text style={styles.playerSubtitle}>{selectedSession.subtitle}</Text>
            
            {/* Breathing circle */}
            <View style={styles.breathContainer}>
              <Animated.View 
                style={[
                  styles.breathCircle,
                  { transform: [{ scale: breathAnim }] }
                ]}
              >
                <Animated.View 
                  style={[
                    styles.breathCircleInner,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  <Text style={styles.breathText}>
                    {breathAnim._value > 1.2 ? 'Nefes Al' : 'Nefes Ver'}
                  </Text>
                </Animated.View>
              </Animated.View>
              
              {/* Rings */}
              <Animated.View style={[styles.ring, styles.ring1, { transform: [{ rotate: rotation }] }]} />
              <Animated.View style={[styles.ring, styles.ring2, { transform: [{ rotate: rotation }] }]} />
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timerTotal}>/ {selectedSession.duration}:00</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(currentTime / (selectedSession.duration * 60)) * 100}%`,
                    }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-back" size={28} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mainControlButton}
              onPress={stopMeditation}
            >
              <Ionicons name="stop" size={36} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-forward" size={28} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
          <Text style={styles.title}>🧘 Meditasyon</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={Gradients.primaryVibrant as [string, string, ...string[]]}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsOverlay} />
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Seans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85</Text>
              <Text style={styles.statLabel}>Dakika</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5 🔥</Text>
              <Text style={styles.statLabel}>Seri</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Ambient Sounds */}
        <Text style={styles.sectionTitle}>🎵 Ambient Sesler</Text>
        <View style={styles.soundsGrid}>
          {ambientSounds.map((sound) => {
            const isSelected = selectedSounds.includes(sound.id);
            return (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundCard,
                  isSelected && { 
                    backgroundColor: withAlpha(sound.color, 0.2),
                    borderColor: sound.color,
                  }
                ]}
                onPress={() => toggleSound(sound.id)}
              >
                <View style={[
                  styles.soundIcon,
                  { backgroundColor: withAlpha(sound.color, isSelected ? 0.3 : 0.15) }
                ]}>
                  <Ionicons 
                    name={sound.icon as any} 
                    size={24} 
                    color={isSelected ? sound.color : SemanticColors.text.secondary}
                  />
                </View>
                <Text style={[
                  styles.soundName,
                  isSelected && { color: sound.color }
                ]}>
                  {sound.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sessions */}
        <Text style={styles.sectionTitle}>🌟 Meditasyon Seansları</Text>
        <View style={styles.sessionsGrid}>
          {meditationSessions.map((session, index) => (
            <ScalePressable
              key={session.id}
              style={[
                styles.sessionCard,
                index % 2 === 0 ? styles.sessionCardLarge : styles.sessionCardSmall,
              ]}
              onPress={() => startMeditation(session)}
              scaleValue={0.98}
            >
              <LinearGradient
                colors={session.gradient as [string, string, ...string[]]}
                style={styles.sessionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.sessionIcon}>
                  <Ionicons name={session.icon as any} size={28} color="#fff" />
                </View>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionSubtitle}>{session.subtitle}</Text>
                <View style={styles.sessionMeta}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.sessionDuration}>{session.duration} dk</Text>
                </View>
              </LinearGradient>
            </ScalePressable>
          ))}
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
  statsCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  statsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha('#000', 0.1),
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.stat.large,
    color: '#fff',
  },
  statLabel: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  soundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  soundCard: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  soundName: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    fontWeight: '600',
  },
  sessionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sessionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  sessionCardLarge: {
    width: '100%',
  },
  sessionCardSmall: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
  },
  sessionGradient: {
    padding: Spacing.lg,
    minHeight: 150,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  sessionTitle: {
    ...Typography.heading.h4,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  sessionSubtitle: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sessionDuration: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },

  // Player styles
  playerContainer: {
    flex: 1,
  },
  playerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerType: {
    ...Typography.label.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  playerMain: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  playerTitle: {
    ...Typography.heading.h1,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  playerSubtitle: {
    ...Typography.body.large,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  breathContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathText: {
    ...Typography.heading.h4,
    color: '#fff',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
  },
  ring1: {
    width: 240,
    height: 240,
  },
  ring2: {
    width: 280,
    height: 280,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  timerTotal: {
    ...Typography.body.large,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: Spacing.sm,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainControlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  backgroundOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    top: -50,
    right: -100,
  },
  orb2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
});

