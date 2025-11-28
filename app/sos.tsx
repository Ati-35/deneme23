import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import { incrementSOSCount } from '../utils/storage';

const { width, height } = Dimensions.get('window');

// Dikkat Dağıtma Aktiviteleri
const distractionActivities = [
  { id: '1', title: '10 bardak su iç', icon: 'water', color: '#3B82F6', duration: '2 dk' },
  { id: '2', title: 'Yürüyüşe çık', icon: 'walk', color: '#10B981', duration: '10 dk' },
  { id: '3', title: 'Şınav çek', icon: 'fitness', color: '#EF4444', duration: '2 dk' },
  { id: '4', title: 'Bir arkadaşını ara', icon: 'call', color: '#8B5CF6', duration: '5 dk' },
  { id: '5', title: 'Sakız çiğne', icon: 'nutrition', color: '#F59E0B', duration: '5 dk' },
  { id: '6', title: 'Duş al', icon: 'water-outline', color: '#06B6D4', duration: '10 dk' },
  { id: '7', title: 'Puzzle veya bulmaca çöz', icon: 'extension-puzzle', color: '#EC4899', duration: '15 dk' },
  { id: '8', title: 'Müzik dinle', icon: 'musical-notes', color: '#6366F1', duration: '5 dk' },
];

// Motivasyon Mesajları
const emergencyMotivations = [
  "Bu his geçici, gücün kalıcı! 💪",
  "Her 'Hayır' dediğinde, özgürlüğüne bir adım daha yaklaşıyorsun!",
  "3 dakika diren, istek geçecek!",
  "Bugüne kadar gösterdiğin tüm çabayı düşün!",
  "Sen bunu yapabilirsin, daha önce de yaptın!",
  "Akciğerlerin sana teşekkür ediyor!",
  "Bu anı atlat, sonra gurur duyacaksın!",
  "Yarın bu ana geri bakıp gülümseyeceksin!",
];

export default function SOSScreen() {
  const [currentStep, setCurrentStep] = useState<'main' | 'breathing' | 'activities'>('main');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [motivation, setMotivation] = useState(emergencyMotivations[0]);
  
  const breathAnimation = useRef(new Animated.Value(0.5)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Random motivasyon seç
    const randomIndex = Math.floor(Math.random() * emergencyMotivations.length);
    setMotivation(emergencyMotivations[randomIndex]);
    
    // SOS kullanım sayısını artır
    incrementSOSCount();
    
    // Giriş titreşimi
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Pulse animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Nefes egzersizi
  useEffect(() => {
    if (currentStep !== 'breathing') return;

    const breathCycle = () => {
      // Nefes al (4 saniye)
      setBreathPhase('inhale');
      setCountdown(4);
      Animated.timing(breathAnimation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start();

      let count = 4;
      const inhaleInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(inhaleInterval);
          
          // Tut (4 saniye)
          setBreathPhase('hold');
          setCountdown(4);
          let holdCount = 4;
          const holdInterval = setInterval(() => {
            holdCount--;
            setCountdown(holdCount);
            if (holdCount === 0) {
              clearInterval(holdInterval);
              
              // Nefes ver (4 saniye)
              setBreathPhase('exhale');
              setCountdown(4);
              Animated.timing(breathAnimation, {
                toValue: 0.5,
                duration: 4000,
                useNativeDriver: true,
              }).start();

              let exhaleCount = 4;
              const exhaleInterval = setInterval(() => {
                exhaleCount--;
                setCountdown(exhaleCount);
                if (exhaleCount === 0) {
                  clearInterval(exhaleInterval);
                  setBreathCount(prev => prev + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  
                  if (breathCount < 4) {
                    setTimeout(breathCycle, 500);
                  }
                }
              }, 1000);
            }
          }, 1000);
        }
      }, 1000);
    };

    breathCycle();
  }, [currentStep, breathCount]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const renderMainContent = () => (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Motivasyon Kartı */}
      <Animated.View style={[styles.motivationCard, { transform: [{ scale: pulseAnimation }] }]}>
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.motivationGradient}
        >
          <Ionicons name="heart" size={40} color="#fff" />
          <Text style={styles.motivationText}>{motivation}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Acil Eylem Butonları */}
      <Text style={styles.sectionTitle}>⚡ Hızlı Eylemler</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCurrentStep('breathing');
          }}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.actionGradient}
          >
            <Ionicons name="leaf" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Nefes Al</Text>
            <Text style={styles.actionSubtitle}>4-4-4 Tekniği</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCurrentStep('activities');
          }}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.actionGradient}
          >
            <Ionicons name="game-controller" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Dikkat Dağıt</Text>
            <Text style={styles.actionSubtitle}>Aktiviteler</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 3 Dakika Zamanlayıcı */}
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Ionicons name="timer" size={24} color={Colors.accent} />
          <Text style={styles.timerTitle}>3 Dakika Kuralı</Text>
        </View>
        <Text style={styles.timerDescription}>
          Sigara isteği genellikle 3 dakika içinde geçer. Bu sürede kendini meşgul et!
        </Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* Hızlı İpuçları */}
      <Text style={styles.sectionTitle}>💡 Hızlı İpuçları</Text>
      <View style={styles.tipsContainer}>
        {[
          { icon: 'water', text: 'Bir bardak soğuk su iç' },
          { icon: 'walk', text: 'Kısa bir yürüyüş yap' },
          { icon: 'call', text: 'Bir yakınını ara' },
          { icon: 'musical-notes', text: 'Favori müziğini aç' },
        ].map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name={tip.icon as any} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* Başardın Butonu */}
      <TouchableOpacity style={styles.successButton} onPress={handleClose}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.successGradient}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.successText}>Başardım! İsteği Atlattım 🎉</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBreathingContent = () => (
    <View style={styles.breathingContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentStep('main')}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.breathingTitle}>Nefes Egzersizi</Text>
      <Text style={styles.breathingSubtitle}>4-4-4 Tekniği</Text>

      <View style={styles.breathCircleContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            {
              transform: [{ scale: breathAnimation }],
            },
          ]}
        >
          <LinearGradient
            colors={
              breathPhase === 'inhale' 
                ? ['#10B981', '#059669']
                : breathPhase === 'hold'
                ? ['#F59E0B', '#D97706']
                : ['#3B82F6', '#2563EB']
            }
            style={styles.breathGradient}
          >
            <Text style={styles.breathCountdown}>{countdown}</Text>
            <Text style={styles.breathPhaseText}>
              {breathPhase === 'inhale' 
                ? 'Nefes Al' 
                : breathPhase === 'hold' 
                ? 'Tut' 
                : 'Nefes Ver'}
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.breathProgress}>
        <Text style={styles.breathProgressText}>
          Nefes Sayısı: {breathCount} / 5
        </Text>
        <View style={styles.breathDots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.breathDot,
                i < breathCount && styles.breathDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.breathInstruction}>
        Rahatla ve nefesine odaklan. Her nefes seni daha güçlü yapıyor.
      </Text>
    </View>
  );

  const renderActivitiesContent = () => (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentStep('main')}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.activitiesTitle}>🎯 Dikkat Dağıtma Aktiviteleri</Text>
      <Text style={styles.activitiesSubtitle}>Birini seç ve başla!</Text>

      <View style={styles.activitiesGrid}>
        {distractionActivities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
              <Ionicons name={activity.icon as any} size={28} color={activity.color} />
            </View>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <View style={styles.activityDuration}>
              <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.activityDurationText}>{activity.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.sosIndicator}>
          <View style={styles.sosLight} />
          <Text style={styles.sosText}>SOS MODU</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {currentStep === 'main' && renderMainContent()}
      {currentStep === 'breathing' && renderBreathingContent()}
      {currentStep === 'activities' && renderActivitiesContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sosIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  sosText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  motivationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  motivationGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  motivationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  timerCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  timerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  tipsContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  successButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  successGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Breathing
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  breathingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  breathingSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 60,
  },
  breathCircleContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  breathGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCountdown: {
    fontSize: 72,
    fontWeight: '800',
    color: '#fff',
  },
  breathPhaseText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  breathProgress: {
    alignItems: 'center',
    marginTop: 40,
  },
  breathProgressText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  breathDots: {
    flexDirection: 'row',
    gap: 10,
  },
  breathDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  breathDotActive: {
    backgroundColor: Colors.primary,
  },
  breathInstruction: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  // Activities
  activitiesTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 50,
    marginBottom: 8,
  },
  activitiesSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  activityDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDurationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});







