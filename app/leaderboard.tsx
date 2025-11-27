// Liderlik ve Rekabet Sistemi
// Global/yerel sıralamalar, kupalar

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  daysSinceQuit: number;
  level: number;
  badges: number;
  isCurrentUser?: boolean;
  change?: 'up' | 'down' | 'same';
}

interface LeaderboardCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

// Örnek liderlik tablosu verisi
const MOCK_GLOBAL_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'AhmetY', avatar: 'A', points: 15420, streak: 365, daysSinceQuit: 400, level: 52, badges: 45, change: 'same' },
  { id: '2', rank: 2, name: 'MerveCan', avatar: 'M', points: 12850, streak: 245, daysSinceQuit: 300, level: 45, badges: 38, change: 'up' },
  { id: '3', rank: 3, name: 'EmreK', avatar: 'E', points: 11200, streak: 180, daysSinceQuit: 220, level: 40, badges: 32, change: 'down' },
  { id: '4', rank: 4, name: 'ZeynepA', avatar: 'Z', points: 9800, streak: 150, daysSinceQuit: 180, level: 35, badges: 28 },
  { id: '5', rank: 5, name: 'BurakS', avatar: 'B', points: 8500, streak: 120, daysSinceQuit: 150, level: 32, badges: 25 },
  { id: '6', rank: 6, name: 'CanD', avatar: 'C', points: 7200, streak: 90, daysSinceQuit: 120, level: 28, badges: 22 },
  { id: '7', rank: 7, name: 'ElifT', avatar: 'E', points: 6100, streak: 75, daysSinceQuit: 100, level: 25, badges: 18 },
  { id: '8', rank: 8, name: 'DenizK', avatar: 'D', points: 5200, streak: 60, daysSinceQuit: 80, level: 22, badges: 15 },
  { id: '9', rank: 9, name: 'AyşeM', avatar: 'A', points: 4500, streak: 45, daysSinceQuit: 60, level: 19, badges: 12 },
  { id: '10', rank: 10, name: 'MehmetS', avatar: 'M', points: 3800, streak: 30, daysSinceQuit: 45, level: 16, badges: 10 },
  { id: '11', rank: 56, name: 'Sen', avatar: 'S', points: 850, streak: 7, daysSinceQuit: 7, level: 5, badges: 3, isCurrentUser: true },
];

const MOCK_WEEKLY_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'YenidenDoğuş', avatar: 'Y', points: 1250, streak: 7, daysSinceQuit: 14, level: 8, badges: 5, change: 'up' },
  { id: '2', rank: 2, name: 'KararliAdam', avatar: 'K', points: 1100, streak: 5, daysSinceQuit: 10, level: 6, badges: 4, change: 'same' },
  { id: '3', rank: 3, name: 'Sen', avatar: 'S', points: 980, streak: 7, daysSinceQuit: 7, level: 5, badges: 3, isCurrentUser: true, change: 'up' },
  { id: '4', rank: 4, name: 'ÖzgürRuh', avatar: 'Ö', points: 850, streak: 4, daysSinceQuit: 8, level: 5, badges: 3 },
  { id: '5', rank: 5, name: 'GüçlüOl', avatar: 'G', points: 720, streak: 3, daysSinceQuit: 6, level: 4, badges: 2 },
];

const CATEGORIES: LeaderboardCategory[] = [
  { id: 'global', title: 'Global', icon: 'earth', color: '#3B82F6' },
  { id: 'turkey', title: 'Türkiye', icon: 'flag', color: '#EF4444' },
  { id: 'weekly', title: 'Haftalık', icon: 'calendar', color: '#10B981' },
  { id: 'friends', title: 'Arkadaşlar', icon: 'people', color: '#8B5CF6' },
];

export default function LeaderboardScreen() {
  const [selectedCategory, setSelectedCategory] = useState('global');
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(MOCK_GLOBAL_LEADERBOARD);

  useEffect(() => {
    loadLeaderboard(selectedCategory);
  }, [selectedCategory]);

  const loadLeaderboard = (category: string) => {
    // Gerçek uygulamada API çağrısı yapılır
    switch (category) {
      case 'weekly':
        setLeaderboardData(MOCK_WEEKLY_LEADERBOARD);
        break;
      case 'friends':
        setLeaderboardData(MOCK_WEEKLY_LEADERBOARD.slice(2, 5));
        break;
      default:
        setLeaderboardData(MOCK_GLOBAL_LEADERBOARD);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simüle edilmiş yenileme
    await new Promise(resolve => setTimeout(resolve, 1500));
    loadLeaderboard(selectedCategory);
    setRefreshing(false);
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return Colors.textSecondary;
    }
  };

  const getRankIcon = (rank: number): string | null => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'ribbon';
      default: return null;
    }
  };

  const getChangeIcon = (change?: string): { icon: string; color: string } | null => {
    switch (change) {
      case 'up': return { icon: 'arrow-up', color: '#10B981' };
      case 'down': return { icon: 'arrow-down', color: '#EF4444' };
      default: return null;
    }
  };

  const currentUser = leaderboardData.find(u => u.isCurrentUser);
  const topThree = leaderboardData.filter(u => u.rank <= 3);
  const restOfList = leaderboardData.filter(u => u.rank > 3 && !u.isCurrentUser);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Liderlik Tablosu</Text>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
                selectedCategory === category.id && { borderColor: category.color },
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={selectedCategory === category.id ? category.color : Colors.textSecondary}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && { color: category.color },
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Current User Card */}
        {currentUser && (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.currentUserCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.currentUserRank}>
              <Text style={styles.currentUserRankText}>#{currentUser.rank}</Text>
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>Senin Sıralaman</Text>
              <View style={styles.currentUserStats}>
                <View style={styles.currentUserStat}>
                  <Ionicons name="star" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.currentUserStatValue}>{currentUser.points}</Text>
                </View>
                <View style={styles.currentUserStat}>
                  <Ionicons name="flame" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.currentUserStatValue}>{currentUser.streak} gün</Text>
                </View>
                <View style={styles.currentUserStat}>
                  <Ionicons name="medal" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.currentUserStatValue}>{currentUser.badges}</Text>
                </View>
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{currentUser.level}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Top 3 Podium */}
        {topThree.length === 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={[styles.podiumItem, styles.podiumSecond]}>
              <View style={[styles.podiumAvatar, { backgroundColor: '#C0C0C0' }]}>
                <Text style={styles.podiumAvatarText}>{topThree[1].avatar}</Text>
                <View style={[styles.podiumRankBadge, { backgroundColor: '#C0C0C0' }]}>
                  <Text style={styles.podiumRankText}>2</Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{topThree[1].name}</Text>
              <Text style={styles.podiumPoints}>{topThree[1].points.toLocaleString()}</Text>
              <View style={styles.podiumStreak}>
                <Ionicons name="flame" size={12} color={Colors.accent} />
                <Text style={styles.podiumStreakText}>{topThree[1].streak}</Text>
              </View>
              <View style={[styles.podiumBar, styles.podiumBarSecond]} />
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, styles.podiumFirst]}>
              <View style={styles.crownContainer}>
                <Ionicons name="trophy" size={28} color="#FFD700" />
              </View>
              <View style={[styles.podiumAvatar, styles.podiumAvatarFirst, { backgroundColor: '#FFD700' }]}>
                <Text style={[styles.podiumAvatarText, styles.podiumAvatarTextFirst]}>{topThree[0].avatar}</Text>
                <View style={[styles.podiumRankBadge, { backgroundColor: '#FFD700' }]}>
                  <Text style={styles.podiumRankText}>1</Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{topThree[0].name}</Text>
              <Text style={[styles.podiumPoints, styles.podiumPointsFirst]}>
                {topThree[0].points.toLocaleString()}
              </Text>
              <View style={styles.podiumStreak}>
                <Ionicons name="flame" size={12} color={Colors.accent} />
                <Text style={styles.podiumStreakText}>{topThree[0].streak}</Text>
              </View>
              <View style={[styles.podiumBar, styles.podiumBarFirst]} />
            </View>

            {/* 3rd Place */}
            <View style={[styles.podiumItem, styles.podiumThird]}>
              <View style={[styles.podiumAvatar, { backgroundColor: '#CD7F32' }]}>
                <Text style={styles.podiumAvatarText}>{topThree[2].avatar}</Text>
                <View style={[styles.podiumRankBadge, { backgroundColor: '#CD7F32' }]}>
                  <Text style={styles.podiumRankText}>3</Text>
                </View>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>{topThree[2].name}</Text>
              <Text style={styles.podiumPoints}>{topThree[2].points.toLocaleString()}</Text>
              <View style={styles.podiumStreak}>
                <Ionicons name="flame" size={12} color={Colors.accent} />
                <Text style={styles.podiumStreakText}>{topThree[2].streak}</Text>
              </View>
              <View style={[styles.podiumBar, styles.podiumBarThird]} />
            </View>
          </View>
        )}

        {/* Rest of Leaderboard */}
        <View style={styles.listContainer}>
          {restOfList.map(user => {
            const changeInfo = getChangeIcon(user.change);
            
            return (
              <View key={user.id} style={styles.listItem}>
                <View style={styles.listRankContainer}>
                  <Text style={styles.listRank}>{user.rank}</Text>
                  {changeInfo && (
                    <Ionicons 
                      name={changeInfo.icon as any} 
                      size={12} 
                      color={changeInfo.color} 
                    />
                  )}
                </View>
                
                <View style={styles.listAvatar}>
                  <Text style={styles.listAvatarText}>{user.avatar}</Text>
                </View>
                
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{user.name}</Text>
                  <View style={styles.listMeta}>
                    <View style={styles.listMetaItem}>
                      <Ionicons name="flame" size={12} color={Colors.accent} />
                      <Text style={styles.listMetaText}>{user.streak}g</Text>
                    </View>
                    <View style={styles.listMetaItem}>
                      <Ionicons name="ribbon" size={12} color={Colors.info} />
                      <Text style={styles.listMetaText}>Lv.{user.level}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.listPoints}>
                  <Text style={styles.listPointsValue}>{user.points.toLocaleString()}</Text>
                  <Text style={styles.listPointsLabel}>puan</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 İstatistikler</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="people" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>12,458</Text>
              <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="flame" size={24} color={Colors.accent} />
              <Text style={styles.statValue}>847</Text>
              <Text style={styles.statLabel}>Bugün Aktif</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statValue}>2.3M</Text>
              <Text style={styles.statLabel}>Sigara Bırakıldı</Text>
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
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingBottom: 16,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: Colors.background,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  currentUserRank: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserRankText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  currentUserInfo: {
    flex: 1,
    marginLeft: 16,
  },
  currentUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  currentUserStats: {
    flexDirection: 'row',
    gap: 16,
  },
  currentUserStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentUserStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  podiumItem: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  podiumFirst: {
    marginBottom: 0,
  },
  podiumSecond: {
    marginBottom: 20,
  },
  podiumThird: {
    marginBottom: 40,
  },
  crownContainer: {
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  podiumAvatarFirst: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  podiumAvatarTextFirst: {
    fontSize: 24,
  },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  podiumRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  podiumPointsFirst: {
    fontSize: 16,
  },
  podiumStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  podiumStreakText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
  podiumBar: {
    width: '80%',
    borderRadius: 8,
  },
  podiumBarFirst: {
    height: 80,
    backgroundColor: '#FFD700' + '40',
  },
  podiumBarSecond: {
    height: 60,
    backgroundColor: '#C0C0C0' + '40',
  },
  podiumBarThird: {
    height: 40,
    backgroundColor: '#CD7F32' + '40',
  },
  listContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listRankContainer: {
    width: 36,
    alignItems: 'center',
  },
  listRank: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  listPoints: {
    alignItems: 'flex-end',
  },
  listPointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  listPointsLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  statsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});




