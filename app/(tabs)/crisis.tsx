import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  color: string;
}

const breathingExercises: BreathingExercise[] = [
  {
    id: '1',
    name: '4-7-8 Nefes Tekniği',
    description: '4 saniye nefes al, 7 saniye tut, 8 saniye ver',
    duration: 4,
    color: Colors.primary,
  },
  {
    id: '2',
    name: 'Derin Nefes',
    description: 'Yavaşça derin nefes al ve ver',
    duration: 5,
    color: Colors.info,
  },
  {
    id: '3',
    name: 'Sakinleştirici Nefes',
    description: 'Rahatlatıcı nefes egzersizi',
    duration: 6,
    color: Colors.accent,
  },
];

const distractionActivities = [
  { id: '1', icon: 'water', name: 'Su İç', color: Colors.info },
  { id: '2', icon: 'walk', name: 'Yürüyüş Yap', color: Colors.primary },
  { id: '3', icon: 'musical-notes', name: 'Müzik Dinle', color: Colors.accent },
  { id: '4', icon: 'call', name: 'Birini Ara', color: Colors.success },
  { id: '5', icon: 'book', name: 'Kitap Oku', color: Colors.warning },
  { id: '6', icon: 'game-controller', name: 'Oyun Oyna', color: Colors.error },
];

const motivationalMessages = [
  'Sen güçlüsün! Bu istek geçecek.',
  'Her geçen dakika daha güçlü oluyorsun.',
  'Sigara içmeyerek kendine en büyük iyiliği yapıyorsun.',
  'Bu zorluğu atlatırsan, her şeyi yapabilirsin.',
  'Sağlığın için doğru seçimi yapıyorsun.',
  'Geçmişteki başarılarını hatırla, yine başaracaksın.',
];

export default function CrisisScreen() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);
  const [crisisStartTime] = useState(Date.now());
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isBreathing && selectedExercise) {
      startBreathingCycle();
    }
  }, [isBreathing, selectedExercise]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setCurrentMessage(randomMessage);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const startBreathingCycle = () => {
    if (!selectedExercise) return;

    const cycle = () => {
      // Nefes Al
      setBreathPhase('inhale');
      setCountdown(selectedExercise.duration);
      animateBreath(selectedExercise.duration, 1.5, () => {
        // Tut
        setBreathPhase('hold');
        setCountdown(7);
        setTimeout(() => {
          // Ver
          setBreathPhase('exhale');
          setCountdown(8);
          animateBreath(8, 1, () => {
            if (isBreathing) {
              cycle();
            }
          });
        }, 7000);
      });
    };

    cycle();
  };

  const animateBreath = (duration: number, scale: number, callback: () => void) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: scale,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(callback);
  };

  const startBreathing = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsBreathing(true);
    Vibration.vibrate(100);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathPhase('inhale');
    setCountdown(0);
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
  };

  const getTimeSinceCrisis = () => {
    const seconds = Math.floor((Date.now() - crisisStartTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    return { minutes, seconds: seconds % 60 };
  };

  const timeSinceCrisis = getTimeSinceCrisis();

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
            <Text style={styles.title}>🚨 Kriz Yönetimi</Text>
            <Text style={styles.subtitle}>Bu istek geçecek, sen güçlüsün!</Text>
          </View>
          <View style={styles.timerBadge}>
            <Ionicons name="time" size={16} color={Colors.accent} />
            <Text style={styles.timerText}>
              {String(timeSinceCrisis.minutes).padStart(2, '0')}:
              {String(timeSinceCrisis.seconds).padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Motivasyon Mesajı */}
        <LinearGradient
          colors={[Colors.primary + '30', Colors.accent + '20']}
          style={styles.motivationCard}
        >
          <Ionicons name="heart" size={32} color={Colors.primary} />
          <Text style={styles.motivationText}>{currentMessage}</Text>
        </LinearGradient>

        {/* Nefes Egzersizleri */}
        <Text style={styles.sectionTitle}>🌬️ Nefes Egzersizleri</Text>
        {!isBreathing ? (
          <View style={styles.exercisesGrid}>
            {breathingExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => startBreathing(exercise)}
              >
                <LinearGradient
                  colors={[exercise.color, exercise.color + '80']}
                  style={styles.exerciseGradient}
                >
                  <Ionicons name="leaf" size={32} color="#fff" />
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <View style={styles.startButton}>
                    <Ionicons name="play" size={20} color={exercise.color} />
                    <Text style={[styles.startButtonText, { color: exercise.color }]}>
                      Başla
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.breathingContainer}>
            <LinearGradient
              colors={[selectedExercise?.color || Colors.primary, selectedExercise?.color + '80' || Colors.primaryDark]}
              style={styles.breathingCard}
            >
              <Text style={styles.breathingTitle}>{selectedExercise?.name}</Text>
              
              <View style={styles.breathingCircle}>
                <Animated.View
                  style={[
                    styles.breathingCircleInner,
                    {
                      transform: [{ scale: scaleAnim }],
                      opacity: opacityAnim,
                    },
                  ]}
                >
                  <Text style={styles.breathingPhase}>
                    {breathPhase === 'inhale' && 'Nefes Al'}
                    {breathPhase === 'hold' && 'Tut'}
                    {breathPhase === 'exhale' && 'Nefes Ver'}
                  </Text>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </Animated.View>
              </View>

              <TouchableOpacity style={styles.stopButton} onPress={stopBreathing}>
                <Ionicons name="stop" size={20} color="#fff" />
                <Text style={styles.stopButtonText}>Durdur</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Dikkat Dağıtma Aktiviteleri */}
        <Text style={styles.sectionTitle}>🎯 Dikkatini Dağıt</Text>
        <View style={styles.activitiesGrid}>
          {distractionActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => {
                Vibration.vibrate(50);
                // Burada aktivite başlatılabilir
              }}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon as any} size={28} color={activity.color} />
              </View>
              <Text style={styles.activityName}>{activity.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Acil Destek */}
        <Text style={styles.sectionTitle}>🆘 Acil Destek</Text>
        <View style={styles.supportCard}>
          <TouchableOpacity style={styles.supportButton}>
            <LinearGradient
              colors={[Colors.error, Colors.error + '80']}
              style={styles.supportGradient}
            >
              <Ionicons name="call" size={24} color="#fff" />
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Sigara Bırakma Hattı</Text>
                <Text style={styles.supportNumber}>171</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportButton}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.supportGradient}
            >
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Topluluk Desteği</Text>
                <Text style={styles.supportSubtitle}>7/24 aktif destek</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>💪 Bu Krizde Kazandıkların</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>
                {timeSinceCrisis.minutes}dk {timeSinceCrisis.seconds}sn
              </Text>
              <Text style={styles.statLabel}>Sigarasız</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={24} color={Colors.error} />
              <Text style={styles.statValue}>+1</Text>
              <Text style={styles.statLabel}>Başarı</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    gap: 16,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  exercisesGrid: {
    gap: 12,
    marginBottom: 24,
  },
  exerciseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  exerciseGradient: {
    padding: 20,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  breathingContainer: {
    marginBottom: 24,
  },
  breathingCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  breathingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 32,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  breathingCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingPhase: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activityCard: {
    width: (width - 52) / 3,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  supportCard: {
    gap: 12,
    marginBottom: 24,
  },
  supportButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  supportNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  supportSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  statsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
});



