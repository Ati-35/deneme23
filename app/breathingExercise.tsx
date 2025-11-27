import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';

const { width, height } = Dimensions.get('window');

type BreathingMode = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  cycles: number;
  gradient: readonly string[];
}

const breathingPatterns: BreathingPattern[] = [
  {
    id: '1',
    name: '4-7-8 Rahatlama',
    description: 'Anksiyete ve stres için ideal',
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 0,
    cycles: 4,
    gradient: Gradients.ocean,
  },
  {
    id: '2',
    name: 'Kutu Nefesi',
    description: 'Odaklanma ve sakinlik için',
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    cycles: 6,
    gradient: Gradients.forest,
  },
  {
    id: '3',
    name: 'Enerji Verici',
    description: 'Sabahları enerji için',
    inhale: 3,
    hold: 0,
    exhale: 3,
    rest: 0,
    cycles: 10,
    gradient: Gradients.sunset,
  },
  {
    id: '4',
    name: 'Sigara İsteği',
    description: 'Ani istekleri yatıştırır',
    inhale: 5,
    hold: 5,
    exhale: 10,
    rest: 2,
    cycles: 5,
    gradient: Gradients.purple,
  },
];

export default function BreathingExerciseScreen() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingMode>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const breathScale = useRef(new Animated.Value(0.6)).current;
  const breathOpacity = useRef(new Animated.Value(0.5)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return 'NEFES AL';
      case 'hold': return 'TUT';
      case 'exhale': return 'NEFES VER';
      case 'rest': return 'DİNLEN';
    }
  };

  const getPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale': return selectedPattern.inhale;
      case 'hold': return selectedPattern.hold;
      case 'exhale': return selectedPattern.exhale;
      case 'rest': return selectedPattern.rest;
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const duration = getPhaseDuration();
    if (duration === 0) {
      // Skip this phase
      advancePhase();
      return;
    }

    setTimer(duration);

    // Breathing animation
    if (currentPhase === 'inhale') {
      Animated.parallel([
        Animated.timing(breathScale, {
          toValue: 1,
          duration: duration * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathOpacity, {
          toValue: 0.9,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase === 'exhale') {
      Animated.parallel([
        Animated.timing(breathScale, {
          toValue: 0.6,
          duration: duration * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathOpacity, {
          toValue: 0.5,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentCycle]);

  useEffect(() => {
    // Ring rotation animation
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
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
    ).start();
  }, []);

  const advancePhase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const phases: BreathingMode[] = ['inhale', 'hold', 'exhale', 'rest'];
    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;

    if (nextIndex === 0) {
      // Completed a cycle
      if (currentCycle >= selectedPattern.cycles) {
        // Exercise completed
        setIsActive(false);
        setIsCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      setCurrentCycle((prev) => prev + 1);
    }

    setCurrentPhase(phases[nextIndex]);
  };

  const startExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
    setIsCompleted(false);
    setCurrentCycle(1);
    setCurrentPhase('inhale');
    breathScale.setValue(0.6);
    breathOpacity.setValue(0.5);
  };

  const stopExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setCurrentPhase('inhale');
    setCurrentCycle(1);
    breathScale.setValue(0.6);
    breathOpacity.setValue(0.5);
  };

  const spin = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={selectedPattern.gradient as [string, string]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
              transform: [{ scale: pulseAnim }],
              opacity: 0.15 + (i * 0.03),
            },
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Nefes Egzersizi</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Main Breathing Circle */}
        <View style={styles.breathingContainer}>
          {/* Rotating Ring */}
          <Animated.View 
            style={[
              styles.outerRing,
              { transform: [{ rotate: spin }] }
            ]}
          >
            {[...Array(12)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ringDot,
                  { transform: [{ rotate: `${i * 30}deg` }, { translateY: -130 }] }
                ]}
              />
            ))}
          </Animated.View>

          {/* Breathing Circle */}
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: breathScale }],
                opacity: breathOpacity,
              },
            ]}
          >
            <View style={styles.circleInner}>
              {isActive ? (
                <>
                  <Text style={styles.phaseText}>{getPhaseText()}</Text>
                  <Text style={styles.timerText}>{timer}</Text>
                  <Text style={styles.cycleText}>
                    {currentCycle} / {selectedPattern.cycles}
                  </Text>
                </>
              ) : isCompleted ? (
                <>
                  <Ionicons name="checkmark-circle" size={48} color="#fff" />
                  <Text style={styles.completedText}>Tamamlandı!</Text>
                  <Text style={styles.completedSubtext}>Harika iş çıkardın</Text>
                </>
              ) : (
                <>
                  <Text style={styles.readyText}>Hazır mısın?</Text>
                  <Text style={styles.patternName}>{selectedPattern.name}</Text>
                </>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!isActive ? (
            <TouchableOpacity 
              style={styles.startButton}
              onPress={startExercise}
            >
              <Ionicons name="play" size={32} color="#fff" />
              <Text style={styles.startButtonText}>Başla</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={stopExercise}
            >
              <Ionicons name="stop" size={28} color="#fff" />
              <Text style={styles.stopButtonText}>Durdur</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pattern Selector */}
        {!isActive && (
          <View style={styles.patternsContainer}>
            <Text style={styles.patternsTitle}>Egzersiz Seç</Text>
            <View style={styles.patternsList}>
              {breathingPatterns.map((pattern) => (
                <TouchableOpacity
                  key={pattern.id}
                  style={[
                    styles.patternCard,
                    selectedPattern.id === pattern.id && styles.patternCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPattern(pattern);
                    setIsCompleted(false);
                  }}
                >
                  <View style={styles.patternContent}>
                    <Text style={styles.patternCardName}>{pattern.name}</Text>
                    <Text style={styles.patternCardDesc}>{pattern.description}</Text>
                    <View style={styles.patternStats}>
                      <Text style={styles.patternStat}>
                        {pattern.inhale}-{pattern.hold}-{pattern.exhale}
                        {pattern.rest > 0 ? `-${pattern.rest}` : ''}
                      </Text>
                      <Text style={styles.patternCycles}>{pattern.cycles} döngü</Text>
                    </View>
                  </View>
                  {selectedPattern.id === pattern.id && (
                    <View style={styles.patternCheck}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
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
    backgroundColor: withAlpha('#fff', 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading.h3,
    color: '#fff',
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -Spacing['4xl'],
  },
  outerRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: withAlpha('#fff', 0.4),
  },
  breathingCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: withAlpha('#fff', 0.25),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: withAlpha('#fff', 0.4),
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    ...Typography.overline,
    color: '#fff',
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    color: '#fff',
  },
  cycleText: {
    ...Typography.label.medium,
    color: withAlpha('#fff', 0.8),
    marginTop: Spacing.sm,
  },
  readyText: {
    ...Typography.body.large,
    color: withAlpha('#fff', 0.8),
    marginBottom: Spacing.xs,
  },
  patternName: {
    ...Typography.heading.h4,
    color: '#fff',
  },
  completedText: {
    ...Typography.heading.h3,
    color: '#fff',
    marginTop: Spacing.md,
  },
  completedSubtext: {
    ...Typography.body.medium,
    color: withAlpha('#fff', 0.8),
    marginTop: Spacing.xs,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha('#fff', 0.25),
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: withAlpha('#fff', 0.3),
  },
  startButtonText: {
    ...Typography.heading.h4,
    color: '#fff',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.error[500], 0.8),
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  stopButtonText: {
    ...Typography.label.large,
    color: '#fff',
  },
  patternsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  patternsTitle: {
    ...Typography.label.large,
    color: '#fff',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  patternsList: {
    gap: Spacing.sm,
  },
  patternCard: {
    backgroundColor: withAlpha('#fff', 0.15),
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternCardActive: {
    borderColor: withAlpha('#fff', 0.5),
    backgroundColor: withAlpha('#fff', 0.25),
  },
  patternContent: {
    flex: 1,
  },
  patternCardName: {
    ...Typography.label.medium,
    color: '#fff',
    marginBottom: 2,
  },
  patternCardDesc: {
    ...Typography.caption.medium,
    color: withAlpha('#fff', 0.7),
    marginBottom: Spacing.xs,
  },
  patternStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  patternStat: {
    ...Typography.caption.small,
    color: withAlpha('#fff', 0.6),
    fontWeight: '600',
  },
  patternCycles: {
    ...Typography.caption.small,
    color: withAlpha('#fff', 0.6),
  },
  patternCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withAlpha('#fff', 0.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

