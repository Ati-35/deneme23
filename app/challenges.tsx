// Meydan Okuma Sistemi
// Günlük görevler, arkadaş mücadeleleri, ödül puanları

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import { addXP } from '../utils/achievementSystem';

const { width } = Dimensions.get('window');

// Types
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'friend';
  category: 'health' | 'mindfulness' | 'social' | 'education' | 'fitness';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  icon: string;
  color: string;
  progress: number;
  target: number;
  deadline?: string;
  isCompleted: boolean;
  friendName?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  isCurrentUser?: boolean;
}

// Günlük Görevler
const DAILY_CHALLENGES: Omit<Challenge, 'id' | 'progress' | 'isCompleted'>[] = [
  {
    title: 'Sabah Motivasyonu',
    description: 'Sabah uyandığında motivasyon bölümünü oku',
    type: 'daily',
    category: 'mindfulness',
    difficulty: 'easy',
    points: 10,
    icon: 'sunny',
    color: '#F59E0B',
    target: 1,
  },
  {
    title: 'Su İç',
    description: '8 bardak su iç',
    type: 'daily',
    category: 'health',
    difficulty: 'easy',
    points: 15,
    icon: 'water',
    color: '#06B6D4',
    target: 8,
  },
  {
    title: 'Nefes Egzersizi',
    description: '3 nefes egzersizi tamamla',
    type: 'daily',
    category: 'mindfulness',
    difficulty: 'medium',
    points: 25,
    icon: 'leaf',
    color: '#10B981',
    target: 3,
  },
  {
    title: 'Günlük Yaz',
    description: 'Günlüğüne en az 1 kayıt ekle',
    type: 'daily',
    category: 'mindfulness',
    difficulty: 'easy',
    points: 20,
    icon: 'book',
    color: '#8B5CF6',
    target: 1,
  },
  {
    title: 'Adım At',
    description: '5000 adım at',
    type: 'daily',
    category: 'fitness',
    difficulty: 'medium',
    points: 30,
    icon: 'walk',
    color: '#EC4899',
    target: 5000,
  },
  {
    title: 'Eğitim İzle',
    description: '1 eğitim videosu izle',
    type: 'daily',
    category: 'education',
    difficulty: 'easy',
    points: 15,
    icon: 'play-circle',
    color: '#3B82F6',
    target: 1,
  },
];

// Haftalık Görevler
const WEEKLY_CHALLENGES: Omit<Challenge, 'id' | 'progress' | 'isCompleted'>[] = [
  {
    title: 'Haftalık Seri',
    description: '7 gün boyunca her gün en az 1 görevi tamamla',
    type: 'weekly',
    category: 'mindfulness',
    difficulty: 'hard',
    points: 100,
    icon: 'flame',
    color: '#EF4444',
    target: 7,
  },
  {
    title: 'Sosyal Kelebek',
    description: 'Toplulukta 5 paylaşım yap veya yorum bırak',
    type: 'weekly',
    category: 'social',
    difficulty: 'medium',
    points: 75,
    icon: 'people',
    color: '#8B5CF6',
    target: 5,
  },
  {
    title: 'Egzersiz Ustası',
    description: 'Bu hafta 20 nefes egzersizi tamamla',
    type: 'weekly',
    category: 'mindfulness',
    difficulty: 'hard',
    points: 150,
    icon: 'fitness',
    color: '#10B981',
    target: 20,
  },
  {
    title: 'Bilgi Avcısı',
    description: '5 eğitim videosu izle',
    type: 'weekly',
    category: 'education',
    difficulty: 'medium',
    points: 80,
    icon: 'school',
    color: '#3B82F6',
    target: 5,
  },
  {
    title: 'Yürüyüş Şampiyonu',
    description: 'Bu hafta toplam 35.000 adım at',
    type: 'weekly',
    category: 'fitness',
    difficulty: 'hard',
    points: 120,
    icon: 'footsteps',
    color: '#F59E0B',
    target: 35000,
  },
];

// Örnek liderlik tablosu
const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'AhmetY', avatar: 'A', points: 2450, streak: 45 },
  { rank: 2, name: 'MerveCan', avatar: 'M', points: 2180, streak: 32 },
  { rank: 3, name: 'EmreK', avatar: 'E', points: 1920, streak: 28 },
  { rank: 4, name: 'ZeynepA', avatar: 'Z', points: 1750, streak: 21 },
  { rank: 5, name: 'BurakS', avatar: 'B', points: 1580, streak: 18 },
  { rank: 6, name: 'Sen', avatar: 'S', points: 850, streak: 7, isCurrentUser: true },
  { rank: 7, name: 'CanD', avatar: 'C', points: 720, streak: 5 },
  { rank: 8, name: 'ElifT', avatar: 'E', points: 650, streak: 4 },
];

export default function ChallengesScreen() {
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly' | 'friends' | 'leaderboard'>('daily');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');
  const [totalPoints, setTotalPoints] = useState(850);
  const [currentStreak, setCurrentStreak] = useState(7);

  useEffect(() => {
    initializeChallenges();
  }, []);

  const initializeChallenges = () => {
    const dailyChallenges: Challenge[] = DAILY_CHALLENGES.map((c, i) => ({
      ...c,
      id: `daily-${i}`,
      progress: Math.floor(Math.random() * (c.target / 2)),
      isCompleted: false,
    }));

    const weeklyChallenges: Challenge[] = WEEKLY_CHALLENGES.map((c, i) => ({
      ...c,
      id: `weekly-${i}`,
      progress: Math.floor(Math.random() * (c.target * 0.6)),
      isCompleted: false,
    }));

    setChallenges([...dailyChallenges, ...weeklyChallenges]);
  };

  const completeChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.isCompleted) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Puanları ekle
    const result = await addXP(challenge.points);
    setTotalPoints(prev => prev + challenge.points);

    // Challenge'ı tamamlandı olarak işaretle
    setChallenges(prev =>
      prev.map(c =>
        c.id === challengeId
          ? { ...c, isCompleted: true, progress: c.target }
          : c
      )
    );

    // Başarı bildirimi
    Alert.alert(
      '🎉 Tebrikler!',
      `"${challenge.title}" görevini tamamladın!\n+${challenge.points} puan kazandın.`,
      [{ text: 'Harika!', style: 'default' }]
    );
  };

  const incrementProgress = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id === challengeId && !c.isCompleted) {
          const newProgress = Math.min(c.progress + 1, c.target);
          const isNowCompleted = newProgress >= c.target;
          
          if (isNowCompleted) {
            setTimeout(() => completeChallenge(challengeId), 300);
          }
          
          return { ...c, progress: newProgress };
        }
        return c;
      })
    );
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const sendFriendChallenge = () => {
    if (!friendUsername.trim()) {
      Alert.alert('Hata', 'Lütfen bir kullanıcı adı girin.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Meydan Okuma Gönderildi!',
      `${friendUsername} kullanıcısına meydan okuma gönderildi. Kabul ettiğinde başlayacak!`,
      [{ text: 'Tamam', style: 'default' }]
    );

    setFriendUsername('');
    setShowFriendModal(false);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return Colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return difficulty;
    }
  };

  const renderChallenge = (challenge: Challenge) => (
    <TouchableOpacity
      key={challenge.id}
      style={[
        styles.challengeCard,
        challenge.isCompleted && styles.challengeCardCompleted,
      ]}
      onPress={() => !challenge.isCompleted && incrementProgress(challenge.id)}
      disabled={challenge.isCompleted}
    >
      <View style={[styles.challengeIcon, { backgroundColor: challenge.color + '20' }]}>
        <Ionicons 
          name={challenge.icon as any} 
          size={28} 
          color={challenge.isCompleted ? Colors.textMuted : challenge.color} 
        />
        {challenge.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.challengeContent}>
        <View style={styles.challengeHeader}>
          <Text style={[
            styles.challengeTitle,
            challenge.isCompleted && styles.challengeTitleCompleted
          ]}>
            {challenge.title}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(challenge.difficulty) }]}>
              {getDifficultyText(challenge.difficulty)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.challengeDescription}>{challenge.description}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(challenge.progress / challenge.target) * 100}%`,
                  backgroundColor: challenge.isCompleted ? Colors.success : challenge.color,
                },
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {challenge.progress}/{challenge.target}
          </Text>
        </View>

        <View style={styles.challengeFooter}>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.pointsText}>{challenge.points} puan</Text>
          </View>
          {challenge.type === 'friend' && challenge.friendName && (
            <Text style={styles.friendName}>vs {challenge.friendName}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {/* Top 3 */}
      <View style={styles.topThree}>
        {SAMPLE_LEADERBOARD.slice(0, 3).map((entry, index) => (
          <View 
            key={entry.rank}
            style={[
              styles.topEntry,
              index === 0 && styles.topEntryFirst,
              index === 1 && styles.topEntrySecond,
              index === 2 && styles.topEntryThird,
            ]}
          >
            <View style={[
              styles.topAvatar,
              { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
            ]}>
              <Text style={styles.topAvatarText}>{entry.avatar}</Text>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{entry.rank}</Text>
            </View>
            <Text style={styles.topName}>{entry.name}</Text>
            <Text style={styles.topPoints}>{entry.points} puan</Text>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={Colors.accent} />
              <Text style={styles.streakText}>{entry.streak}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Rest of leaderboard */}
      <View style={styles.leaderboardList}>
        {SAMPLE_LEADERBOARD.slice(3).map(entry => (
          <View 
            key={entry.rank} 
            style={[
              styles.leaderboardItem,
              entry.isCurrentUser && styles.leaderboardItemCurrent,
            ]}
          >
            <Text style={styles.leaderboardRank}>{entry.rank}</Text>
            <View style={[
              styles.leaderboardAvatar,
              entry.isCurrentUser && { backgroundColor: Colors.primary }
            ]}>
              <Text style={styles.avatarText}>{entry.avatar}</Text>
            </View>
            <View style={styles.leaderboardInfo}>
              <Text style={[
                styles.leaderboardName,
                entry.isCurrentUser && { color: Colors.primary, fontWeight: '700' }
              ]}>
                {entry.name} {entry.isCurrentUser && '(Sen)'}
              </Text>
              <View style={styles.leaderboardMeta}>
                <Ionicons name="flame" size={12} color={Colors.accent} />
                <Text style={styles.leaderboardStreak}>{entry.streak} gün seri</Text>
              </View>
            </View>
            <Text style={styles.leaderboardPoints}>{entry.points}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
  const completedDaily = dailyChallenges.filter(c => c.isCompleted).length;
  const completedWeekly = weeklyChallenges.filter(c => c.isCompleted).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>🎯 Meydan Okumalar</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#fff" />
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Toplam Puan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color="#fff" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Gün Seri</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.statValue}>{completedDaily + completedWeekly}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {[
            { id: 'daily', label: 'Günlük', icon: 'today' },
            { id: 'weekly', label: 'Haftalık', icon: 'calendar' },
            { id: 'friends', label: 'Arkadaş', icon: 'people' },
            { id: 'leaderboard', label: 'Sıralama', icon: 'trophy' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab.id as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={selectedTab === tab.id ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {selectedTab === 'daily' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Günlük Görevler</Text>
              <Text style={styles.sectionCount}>{completedDaily}/{dailyChallenges.length}</Text>
            </View>
            {dailyChallenges.map(renderChallenge)}
          </View>
        )}

        {selectedTab === 'weekly' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Haftalık Görevler</Text>
              <Text style={styles.sectionCount}>{completedWeekly}/{weeklyChallenges.length}</Text>
            </View>
            {weeklyChallenges.map(renderChallenge)}
          </View>
        )}

        {selectedTab === 'friends' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Arkadaş Meydan Okumaları</Text>
            </View>
            
            <TouchableOpacity
              style={styles.inviteCard}
              onPress={() => setShowFriendModal(true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                style={styles.inviteGradient}
              >
                <Ionicons name="add-circle" size={32} color="#fff" />
                <Text style={styles.inviteTitle}>Arkadaşını Davet Et</Text>
                <Text style={styles.inviteSubtitle}>
                  Bir arkadaşına meydan oku ve birlikte ilerleyin!
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Henüz aktif meydan okuma yok</Text>
              <Text style={styles.emptySubtext}>
                Yukarıdaki butona tıklayarak arkadaşlarını davet edebilirsin
              </Text>
            </View>
          </View>
        )}

        {selectedTab === 'leaderboard' && renderLeaderboard()}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Friend Invite Modal */}
      <Modal
        visible={showFriendModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Arkadaş Meydan Okuması</Text>
              <TouchableOpacity onPress={() => setShowFriendModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Arkadaşının kullanıcı adını gir ve ona meydan oku!
              7 gün boyunca kim daha fazla görev tamamlarsa kazanır.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Kullanıcı adı"
              placeholderTextColor={Colors.textMuted}
              value={friendUsername}
              onChangeText={setFriendUsername}
              autoCapitalize="none"
            />

            <View style={styles.modalChallengeTypes}>
              <Text style={styles.modalSubtitle}>Meydan Okuma Türü</Text>
              <View style={styles.challengeTypeRow}>
                <TouchableOpacity style={[styles.challengeType, styles.challengeTypeActive]}>
                  <Ionicons name="flame" size={20} color={Colors.primary} />
                  <Text style={styles.challengeTypeText}>En Uzun Seri</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.challengeType}>
                  <Ionicons name="star" size={20} color={Colors.textSecondary} />
                  <Text style={[styles.challengeTypeText, { color: Colors.textSecondary }]}>En Çok Puan</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={sendFriendChallenge}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Meydan Oku!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  challengeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeCardCompleted: {
    opacity: 0.6,
    backgroundColor: Colors.backgroundLight,
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  completedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeContent: {
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  friendName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  inviteCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  inviteGradient: {
    padding: 24,
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    gap: 12,
  },
  topEntry: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    width: (width - 80) / 3,
  },
  topEntryFirst: {
    marginBottom: 20,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  topEntrySecond: {
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  topEntryThird: {
    borderColor: '#CD7F32',
    borderWidth: 1,
  },
  topAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  topAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  topName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  topPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
  leaderboardList: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderboardItemCurrent: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    marginHorizontal: -4,
    paddingHorizontal: 16,
  },
  leaderboardRank: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  leaderboardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  leaderboardStreak: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  modalChallengeTypes: {
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  challengeTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeTypeActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  challengeTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  modalButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});







