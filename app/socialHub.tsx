// Social Hub - Sosyal Özellikler & Meydan Okumalar
// Arkadaşlar, gruplar, challenges, liderlik tablosu

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SemanticColors, Palette, Gradients, withAlpha } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import {
  getFriends,
  getChallenges,
  getLeaderboard,
  getSupportGroups,
  Friend,
  Challenge,
  LeaderboardEntry,
  SupportGroup,
} from '../utils/socialFeatures';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

type TabType = 'challenges' | 'friends' | 'leaderboard' | 'groups';

export default function SocialHubScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('challenges');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groups, setGroups] = useState<SupportGroup[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [friendsData, challengesData, leaderboardData, groupsData] = await Promise.all([
      getFriends(),
      getChallenges(),
      getLeaderboard('streak'),
      getSupportGroups(),
    ]);
    
    setFriends(friendsData);
    setChallenges(challengesData);
    setLeaderboard(leaderboardData);
    setGroups(groupsData);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'challenges', label: 'Meydan Okuma', icon: 'trophy' },
    { id: 'friends', label: 'Arkadaşlar', icon: 'people' },
    { id: 'leaderboard', label: 'Sıralama', icon: 'podium' },
    { id: 'groups', label: 'Gruplar', icon: 'chatbubbles' },
  ];

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
  const monthlyChallenges = challenges.filter(c => c.type === 'monthly');

  const onlineFriends = friends.filter(f => f.status === 'online');

  const renderChallenges = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Daily Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Günlük Meydan Okumalar</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dailyChallenges.filter(c => !c.isCompleted).length} Aktif</Text>
          </View>
        </View>
        
        {dailyChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </View>

      {/* Weekly Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Haftalık Meydan Okumalar</Text>
        </View>
        
        {weeklyChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </View>

      {/* Monthly Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Aylık Meydan Okumalar</Text>
        </View>
        
        {monthlyChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderFriends = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Online Friends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🟢 Çevrimiçi ({onlineFriends.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.onlineFriendsScroll}>
          {onlineFriends.map((friend) => (
            <View key={friend.id} style={styles.onlineFriendCard}>
              <View style={styles.onlineFriendAvatar}>
                <Text style={styles.avatarText}>{friend.avatar}</Text>
                <View style={styles.onlineIndicator} />
              </View>
              <Text style={styles.onlineFriendName} numberOfLines={1}>{friend.name}</Text>
              <Text style={styles.onlineFriendStreak}>🔥 {friend.streak}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* All Friends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Tüm Arkadaşlar ({friends.length})</Text>
        {friends.slice(0, 10).map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </View>

      {/* Find Friends */}
      <View style={styles.section}>
        <ScalePressable style={styles.findFriendsCard}>
          <LinearGradient
            colors={Gradients.purple}
            style={styles.findFriendsGradient}
          >
            <Ionicons name="person-add" size={32} color="#fff" />
            <Text style={styles.findFriendsTitle}>Arkadaş Bul</Text>
            <Text style={styles.findFriendsText}>Sigara bırakma yolculuğunda birlikte güçlü olun</Text>
          </LinearGradient>
        </ScalePressable>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Top 3 */}
      <View style={styles.top3Container}>
        {/* 2nd Place */}
        <View style={styles.top3Item}>
          <View style={[styles.top3Avatar, styles.top3Second]}>
            <Text style={styles.top3AvatarText}>{leaderboard[1]?.avatar}</Text>
          </View>
          <Text style={styles.top3Medal}>🥈</Text>
          <Text style={styles.top3Name}>{leaderboard[1]?.name}</Text>
          <Text style={styles.top3Score}>{leaderboard[1]?.score} gün</Text>
        </View>

        {/* 1st Place */}
        <View style={[styles.top3Item, styles.top3First]}>
          <View style={[styles.top3Avatar, styles.top3FirstAvatar]}>
            <Text style={styles.top3AvatarTextFirst}>{leaderboard[0]?.avatar}</Text>
          </View>
          <Text style={styles.top3Medal}>🥇</Text>
          <Text style={[styles.top3Name, styles.top3NameFirst]}>{leaderboard[0]?.name}</Text>
          <Text style={[styles.top3Score, styles.top3ScoreFirst]}>{leaderboard[0]?.score} gün</Text>
        </View>

        {/* 3rd Place */}
        <View style={styles.top3Item}>
          <View style={[styles.top3Avatar, styles.top3Third]}>
            <Text style={styles.top3AvatarText}>{leaderboard[2]?.avatar}</Text>
          </View>
          <Text style={styles.top3Medal}>🥉</Text>
          <Text style={styles.top3Name}>{leaderboard[2]?.name}</Text>
          <Text style={styles.top3Score}>{leaderboard[2]?.score} gün</Text>
        </View>
      </View>

      {/* Rest of Leaderboard */}
      <View style={styles.section}>
        {leaderboard.slice(3, 20).map((entry) => (
          <LeaderboardCard key={entry.userId} entry={entry} />
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  const renderGroups = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Destek Grupları</Text>
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </View>

      {/* Create Group */}
      <View style={styles.section}>
        <ScalePressable style={styles.createGroupCard}>
          <Ionicons name="add-circle" size={48} color={Palette.primary[500]} />
          <Text style={styles.createGroupTitle}>Grup Oluştur</Text>
          <Text style={styles.createGroupText}>Kendi destek grubunuzu oluşturun</Text>
        </ScalePressable>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sosyal</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab.id);
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? Palette.primary[500] : SemanticColors.text.tertiary}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'friends' && renderFriends()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'groups' && renderGroups()}
      </View>
    </SafeAreaView>
  );
}

// Challenge Card Component
function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = (challenge.progress / challenge.goal) * 100;
  
  return (
    <ScalePressable style={[styles.challengeCard, challenge.isCompleted && styles.challengeCompleted]}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeIconContainer}>
          <Text style={styles.challengeIcon}>{challenge.icon}</Text>
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
        </View>
        <View style={styles.challengeReward}>
          <Text style={styles.challengeXP}>+{challenge.xpReward}</Text>
          <Text style={styles.challengeXPLabel}>XP</Text>
        </View>
      </View>
      
      <View style={styles.challengeProgressBar}>
        <View style={[styles.challengeProgressFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeProgress}>
          {challenge.progress} / {challenge.goal}
        </Text>
        <View style={styles.challengeParticipants}>
          <Ionicons name="people" size={14} color={SemanticColors.text.tertiary} />
          <Text style={styles.challengeParticipantsText}>{challenge.participants}</Text>
        </View>
      </View>
    </ScalePressable>
  );
}

// Friend Card Component
function FriendCard({ friend }: { friend: Friend }) {
  return (
    <ScalePressable style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
        {friend.status === 'online' && <View style={styles.friendOnlineIndicator} />}
      </View>
      <View style={styles.friendInfo}>
        <View style={styles.friendNameRow}>
          <Text style={styles.friendName}>{friend.name}</Text>
          {friend.isMentor && (
            <View style={styles.mentorBadge}>
              <Text style={styles.mentorBadgeText}>Mentor</Text>
            </View>
          )}
        </View>
        <Text style={styles.friendStats}>
          🔥 {friend.streak} gün • Seviye {friend.level}
        </Text>
      </View>
      <TouchableOpacity style={styles.friendAction}>
        <Ionicons name="chatbubble-outline" size={20} color={Palette.primary[500]} />
      </TouchableOpacity>
    </ScalePressable>
  );
}

// Leaderboard Card Component
function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={[styles.leaderboardCard, entry.isCurrentUser && styles.leaderboardCardCurrent]}>
      <Text style={[styles.leaderboardRank, entry.isCurrentUser && styles.leaderboardRankCurrent]}>
        {entry.rank}
      </Text>
      <View style={styles.leaderboardAvatar}>
        <Text style={styles.leaderboardAvatarText}>{entry.avatar}</Text>
      </View>
      <View style={styles.leaderboardInfo}>
        <Text style={[styles.leaderboardName, entry.isCurrentUser && styles.leaderboardNameCurrent]}>
          {entry.name} {entry.isCurrentUser && '(Sen)'}
        </Text>
        <Text style={styles.leaderboardLevel}>Seviye {entry.level}</Text>
      </View>
      <View style={styles.leaderboardScore}>
        <Text style={[styles.leaderboardScoreText, entry.isCurrentUser && styles.leaderboardScoreTextCurrent]}>
          {entry.score}
        </Text>
        <Text style={styles.leaderboardScoreLabel}>gün</Text>
      </View>
    </View>
  );
}

// Group Card Component
function GroupCard({ group }: { group: SupportGroup }) {
  return (
    <ScalePressable style={styles.groupCard}>
      <View style={styles.groupIconContainer}>
        <Text style={styles.groupIcon}>{group.icon}</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupDescription} numberOfLines={1}>{group.description}</Text>
        <View style={styles.groupMeta}>
          <Ionicons name="people" size={14} color={SemanticColors.text.tertiary} />
          <Text style={styles.groupMembers}>{group.memberCount} üye</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.groupJoinButton}>
        <Text style={styles.groupJoinText}>Katıl</Text>
      </TouchableOpacity>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SemanticColors.text.primary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Palette.primary[500],
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.text.tertiary,
  },
  tabTextActive: {
    color: Palette.primary[500],
  },

  content: {
    flex: 1,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary[500],
  },

  // Challenge Card
  challengeCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  challengeCompleted: {
    backgroundColor: withAlpha(Palette.success[500], 0.1),
    borderColor: withAlpha(Palette.success[500], 0.3),
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  challengeIcon: {
    fontSize: 22,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  challengeDescription: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  challengeReward: {
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  challengeXP: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.accent[500],
  },
  challengeXPLabel: {
    fontSize: 10,
    color: Palette.accent[500],
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: withAlpha(Palette.primary[500], 0.2),
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: Palette.primary[500],
    borderRadius: 3,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.text.secondary,
  },
  challengeParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeParticipantsText: {
    fontSize: 12,
    color: SemanticColors.text.tertiary,
  },

  // Online Friends
  onlineFriendsScroll: {
    marginLeft: -Spacing.lg,
    marginRight: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  onlineFriendCard: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 70,
  },
  onlineFriendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  avatarText: {
    fontSize: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.success[500],
    borderWidth: 2,
    borderColor: SemanticColors.surface.default,
  },
  onlineFriendName: {
    fontSize: 12,
    fontWeight: '600',
    color: SemanticColors.text.primary,
    textAlign: 'center',
  },
  onlineFriendStreak: {
    fontSize: 11,
    color: SemanticColors.text.secondary,
  },

  // Friend Card
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    position: 'relative',
  },
  friendAvatarText: {
    fontSize: 24,
  },
  friendOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.success[500],
    borderWidth: 2,
    borderColor: SemanticColors.surface.default,
  },
  friendInfo: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  mentorBadge: {
    backgroundColor: withAlpha(Palette.purple[500], 0.15),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mentorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.purple[500],
  },
  friendStats: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  friendAction: {
    padding: Spacing.sm,
  },

  // Find Friends
  findFriendsCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  findFriendsGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  findFriendsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: Spacing.md,
  },
  findFriendsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Top 3
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  top3Item: {
    alignItems: 'center',
    width: (width - Spacing.lg * 2) / 3,
  },
  top3First: {
    marginBottom: Spacing.lg,
  },
  top3Avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  top3FirstAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: withAlpha('#FFD700', 0.2),
  },
  top3Second: {
    backgroundColor: withAlpha('#C0C0C0', 0.2),
  },
  top3Third: {
    backgroundColor: withAlpha('#CD7F32', 0.2),
  },
  top3AvatarText: {
    fontSize: 28,
  },
  top3AvatarTextFirst: {
    fontSize: 36,
  },
  top3Medal: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  top3Name: {
    fontSize: 13,
    fontWeight: '600',
    color: SemanticColors.text.primary,
    textAlign: 'center',
  },
  top3NameFirst: {
    fontSize: 15,
  },
  top3Score: {
    fontSize: 12,
    color: SemanticColors.text.secondary,
  },
  top3ScoreFirst: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.accent[500],
  },

  // Leaderboard Card
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  leaderboardCardCurrent: {
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    borderColor: Palette.primary[500],
  },
  leaderboardRank: {
    width: 28,
    fontSize: 14,
    fontWeight: '700',
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
  leaderboardRankCurrent: {
    color: Palette.primary[500],
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  leaderboardAvatarText: {
    fontSize: 20,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  leaderboardNameCurrent: {
    color: Palette.primary[500],
  },
  leaderboardLevel: {
    fontSize: 12,
    color: SemanticColors.text.secondary,
  },
  leaderboardScore: {
    alignItems: 'center',
  },
  leaderboardScoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: SemanticColors.text.primary,
  },
  leaderboardScoreTextCurrent: {
    color: Palette.primary[500],
  },
  leaderboardScoreLabel: {
    fontSize: 10,
    color: SemanticColors.text.tertiary,
  },

  // Group Card
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(Palette.info[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  groupIcon: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
    color: SemanticColors.text.primary,
  },
  groupDescription: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: SemanticColors.text.tertiary,
  },
  groupJoinButton: {
    backgroundColor: Palette.primary[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  groupJoinText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  // Create Group
  createGroupCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SemanticColors.border.subtle,
    borderStyle: 'dashed',
  },
  createGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SemanticColors.text.primary,
    marginTop: Spacing.md,
  },
  createGroupText: {
    fontSize: 13,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
});




