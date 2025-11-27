import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../constants/DesignTokens';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

interface WeekData {
  moneySaved: number;
  cigarettesAvoided: number;
  healthImprovement: number;
  daysSmokeFree: number;
  cravingsResisted: number;
  exerciseMinutes: number;
  meditationMinutes: number;
  journalEntries: number;
  badges: number;
  xpEarned: number;
}

const weeklyData: WeekData = {
  moneySaved: 350,
  cigarettesAvoided: 140,
  healthImprovement: 12,
  daysSmokeFree: 7,
  cravingsResisted: 23,
  exerciseMinutes: 180,
  meditationMinutes: 45,
  journalEntries: 5,
  badges: 2,
  xpEarned: 450,
};

const dailyProgress = [
  { day: 'Pzt', cravings: 5, resisted: 5, mood: 7 },
  { day: 'Sal', cravings: 4, resisted: 4, mood: 8 },
  { day: 'Çar', cravings: 6, resisted: 5, mood: 6 },
  { day: 'Per', cravings: 3, resisted: 3, mood: 8 },
  { day: 'Cum', cravings: 4, resisted: 4, mood: 7 },
  { day: 'Cmt', cravings: 2, resisted: 2, mood: 9 },
  { day: 'Paz', cravings: 3, resisted: 3, mood: 8 },
];

const highlights = [
  { id: '1', icon: 'trophy', text: '5 gün üst üste sigara isteğine direnebildin!', color: Palette.accent[500] },
  { id: '2', icon: 'heart', text: 'Kan basıncın normale dönmeye başladı', color: Palette.error[500] },
  { id: '3', icon: 'fitness', text: '180 dakika egzersiz yaptın', color: Palette.success[500] },
  { id: '4', icon: 'cash', text: 'Bu hafta ₺350 tasarruf ettin', color: Palette.primary[500] },
];

export default function WeeklyReportScreen() {
  const progressAnims = useRef(dailyProgress.map(() => new Animated.Value(0))).current;
  const [showShareModal, setShowShareModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      ...progressAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 100,
          useNativeDriver: false,
        })
      ),
    ]).start();
  }, []);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `🎉 Haftalık Sigara Bırakma Raporum!\n\n🚭 ${weeklyData.daysSmokeFree} gün sigarasız\n💰 ₺${weeklyData.moneySaved} tasarruf\n🚬 ${weeklyData.cigarettesAvoided} sigara içilmedi\n💪 ${weeklyData.cravingsResisted} isteğe direndim\n\n#SigaraBırak #SağlıklıYaşam`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '😐';
    return '😔';
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
            <Text style={styles.title}>📊 Haftalık Rapor</Text>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Date Range */}
        <FadeIn delay={50}>
          <View style={styles.dateRange}>
            <Ionicons name="calendar" size={18} color={SemanticColors.text.secondary} />
            <Text style={styles.dateText}>18 - 24 Kasım 2024</Text>
          </View>
        </FadeIn>

        {/* Hero Stats Card */}
        <FadeIn delay={100}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={Gradients.primaryVibrant as [string, string, string]}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroDecor1} />
              <View style={styles.heroDecor2} />
              
              <Text style={styles.heroTitle}>Bu Hafta Harika Geçti! 🎉</Text>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{weeklyData.daysSmokeFree}</Text>
                  <Text style={styles.heroStatLabel}>Gün Sigarasız</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>₺{weeklyData.moneySaved}</Text>
                  <Text style={styles.heroStatLabel}>Tasarruf</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{weeklyData.cigarettesAvoided}</Text>
                  <Text style={styles.heroStatLabel}>Sigara İçilmedi</Text>
                </View>
              </View>

              <View style={styles.xpBadge}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.xpText}>+{weeklyData.xpEarned} XP Kazandın</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </FadeIn>

        {/* Highlights */}
        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>✨ Öne Çıkanlar</Text>
          <View style={styles.highlightsContainer}>
            {highlights.map((item, index) => (
              <View key={item.id} style={styles.highlightItem}>
                <View style={[styles.highlightIcon, { backgroundColor: withAlpha(item.color, 0.15) }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.highlightText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </FadeIn>

        {/* Daily Breakdown */}
        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>📅 Günlük Özet</Text>
          <View style={styles.dailyCard}>
            {dailyProgress.map((day, index) => (
              <View key={day.day} style={styles.dailyRow}>
                <Text style={styles.dayLabel}>{day.day}</Text>
                <View style={styles.dailyBarContainer}>
                  <Animated.View
                    style={[
                      styles.dailyBar,
                      {
                        width: progressAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${(day.resisted / day.cravings) * 100}%`],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dailyStats}>
                  {day.resisted}/{day.cravings}
                </Text>
                <Text style={styles.moodEmoji}>{getMoodEmoji(day.mood)}</Text>
              </View>
            ))}
            <View style={styles.dailyLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Palette.primary[500] }]} />
                <Text style={styles.legendText}>Direniş Başarısı</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendEmoji}>😊</Text>
                <Text style={styles.legendText}>Ruh Hali</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Activity Stats */}
        <FadeIn delay={400}>
          <Text style={styles.sectionTitle}>🏃 Aktivite İstatistikleri</Text>
          <View style={styles.activityGrid}>
            <View style={styles.activityCard}>
              <LinearGradient
                colors={Gradients.forest as [string, string]}
                style={styles.activityIcon}
              >
                <Ionicons name="fitness" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.activityValue}>{weeklyData.exerciseMinutes}dk</Text>
              <Text style={styles.activityLabel}>Egzersiz</Text>
            </View>
            <View style={styles.activityCard}>
              <LinearGradient
                colors={Gradients.purple as [string, string]}
                style={styles.activityIcon}
              >
                <Ionicons name="leaf" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.activityValue}>{weeklyData.meditationMinutes}dk</Text>
              <Text style={styles.activityLabel}>Meditasyon</Text>
            </View>
            <View style={styles.activityCard}>
              <LinearGradient
                colors={Gradients.ocean as [string, string]}
                style={styles.activityIcon}
              >
                <Ionicons name="book" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.activityValue}>{weeklyData.journalEntries}</Text>
              <Text style={styles.activityLabel}>Günlük Girişi</Text>
            </View>
            <View style={styles.activityCard}>
              <LinearGradient
                colors={Gradients.accent as [string, string]}
                style={styles.activityIcon}
              >
                <Ionicons name="trophy" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.activityValue}>{weeklyData.badges}</Text>
              <Text style={styles.activityLabel}>Yeni Rozet</Text>
            </View>
          </View>
        </FadeIn>

        {/* Health Progress */}
        <FadeIn delay={500}>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons name="heart" size={24} color={Palette.error[500]} />
              <Text style={styles.healthTitle}>Sağlık İyileşmesi</Text>
            </View>
            <Text style={styles.healthValue}>+{weeklyData.healthImprovement}%</Text>
            <Text style={styles.healthText}>
              Bu hafta vücudun önemli iyileşmeler gösterdi. Akciğer kapasiten artmaya,
              kan basıncın normalleşmeye devam ediyor.
            </Text>
            <TouchableOpacity style={styles.healthButton}>
              <Text style={styles.healthButtonText}>Detaylı Raporu Gör</Text>
              <Ionicons name="arrow-forward" size={16} color={Palette.primary[500]} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Next Week Goals */}
        <FadeIn delay={600}>
          <View style={styles.goalsCard}>
            <LinearGradient
              colors={[withAlpha(Palette.info[500], 0.15), withAlpha(Palette.info[500], 0.05)]}
              style={styles.goalsGradient}
            >
              <View style={styles.goalsHeader}>
                <Ionicons name="flag" size={24} color={Palette.info[500]} />
                <Text style={styles.goalsTitle}>Gelecek Hafta Hedefleri</Text>
              </View>
              <View style={styles.goalsList}>
                <View style={styles.goalItem}>
                  <Ionicons name="checkbox-outline" size={20} color={Palette.info[500]} />
                  <Text style={styles.goalText}>7 gün daha sigarasız kal</Text>
                </View>
                <View style={styles.goalItem}>
                  <Ionicons name="checkbox-outline" size={20} color={Palette.info[500]} />
                  <Text style={styles.goalText}>200 dakika egzersiz yap</Text>
                </View>
                <View style={styles.goalItem}>
                  <Ionicons name="checkbox-outline" size={20} color={Palette.info[500]} />
                  <Text style={styles.goalText}>Her gün günlük yaz</Text>
                </View>
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
    marginBottom: Spacing.sm,
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
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dateText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
  },
  heroCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.primary,
  },
  heroDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withAlpha('#fff', 0.1),
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: withAlpha('#fff', 0.05),
  },
  heroTitle: {
    ...Typography.heading.h3,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    ...Typography.stat.small,
    color: '#fff',
  },
  heroStatLabel: {
    ...Typography.caption.small,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.xs,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    alignSelf: 'center',
  },
  xpText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  highlightsContainer: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  dailyCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  dayLabel: {
    ...Typography.label.small,
    color: SemanticColors.text.secondary,
    width: 32,
  },
  dailyBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: SemanticColors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dailyBar: {
    height: '100%',
    backgroundColor: Palette.primary[500],
    borderRadius: 4,
  },
  dailyStats: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
    width: 32,
    textAlign: 'right',
  },
  moodEmoji: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  dailyLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  legendEmoji: {
    fontSize: 12,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  activityCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  activityValue: {
    ...Typography.stat.small,
    color: SemanticColors.text.primary,
  },
  activityLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  healthCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  healthTitle: {
    ...Typography.label.large,
    color: SemanticColors.text.primary,
  },
  healthValue: {
    ...Typography.stat.large,
    color: Palette.success[500],
    marginBottom: Spacing.sm,
  },
  healthText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  healthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  healthButtonText: {
    ...Typography.label.medium,
    color: Palette.primary[500],
  },
  goalsCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: withAlpha(Palette.info[500], 0.2),
  },
  goalsGradient: {
    padding: Spacing.lg,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  goalsTitle: {
    ...Typography.label.large,
    color: SemanticColors.text.primary,
  },
  goalsList: {
    gap: Spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  goalText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
  },
});

