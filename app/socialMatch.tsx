import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

interface MatchUser {
  id: string;
  name: string;
  avatar: string;
  daysSmokeeFree: number;
  city: string;
  interests: string[];
  motivation: string;
  matchScore: number;
}

const potentialMatches: MatchUser[] = [
  {
    id: '1',
    name: 'Elif Y.',
    avatar: 'E',
    daysSmokeeFree: 12,
    city: 'İstanbul',
    interests: ['Yürüyüş', 'Kitap', 'Yoga'],
    motivation: 'Ailem için bırakıyorum',
    matchScore: 95,
  },
  {
    id: '2',
    name: 'Ahmet K.',
    avatar: 'A',
    daysSmokeeFree: 8,
    city: 'Ankara',
    interests: ['Koşu', 'Müzik', 'Yemek'],
    motivation: 'Sağlığım için',
    matchScore: 88,
  },
  {
    id: '3',
    name: 'Zeynep M.',
    avatar: 'Z',
    daysSmokeeFree: 15,
    city: 'İzmir',
    interests: ['Bisiklet', 'Resim', 'Meditasyon'],
    motivation: 'Özgür olmak için',
    matchScore: 82,
  },
  {
    id: '4',
    name: 'Mehmet D.',
    avatar: 'M',
    daysSmokeeFree: 5,
    city: 'Bursa',
    interests: ['Futbol', 'Film', 'Oyun'],
    motivation: 'Ekonomik nedenler',
    matchScore: 75,
  },
];

const connectedFriends = [
  { id: '1', name: 'Ayşe S.', avatar: 'A', daysSmokeeFree: 21, lastActive: '2s önce' },
  { id: '2', name: 'Can B.', avatar: 'C', daysSmokeeFree: 14, lastActive: '5dk önce' },
  { id: '3', name: 'Deniz K.', avatar: 'D', daysSmokeeFree: 9, lastActive: '1s önce' },
];

export default function SocialMatchScreen() {
  const [activeTab, setActiveTab] = useState<'discover' | 'friends'>('discover');
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const cardAnims = useRef(potentialMatches.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    potentialMatches.forEach((_, index) => {
      Animated.spring(cardAnims[index], {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    });
  }, []);

  const handleLike = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLikedUsers((prev) => [...prev, userId]);
  };

  const getAvatarGradient = (letter: string) => {
    const gradients: Record<string, readonly string[]> = {
      A: Gradients.primary,
      B: Gradients.ocean,
      C: Gradients.sunset,
      D: Gradients.purple,
      E: Gradients.forest,
      Z: Gradients.accent,
      M: Gradients.info,
    };
    return gradients[letter] || Gradients.primary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>👥 Arkadaş Bul</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Ionicons 
            name="search" 
            size={20} 
            color={activeTab === 'discover' ? '#fff' : SemanticColors.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Keşfet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'friends' ? '#fff' : SemanticColors.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Arkadaşlarım
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{connectedFriends.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'discover' ? (
          <>
            {/* Info Card */}
            <FadeIn delay={0}>
              <LinearGradient
                colors={Gradients.purple as [string, string]}
                style={styles.infoCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.infoIcon}>
                  <Ionicons name="heart" size={32} color="#fff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Birlikte Daha Güçlüyüz!</Text>
                  <Text style={styles.infoText}>
                    Aynı yolculukta olan kişilerle bağlan, birbirinizi destekleyin.
                  </Text>
                </View>
              </LinearGradient>
            </FadeIn>

            {/* Match Cards */}
            <Text style={styles.sectionTitle}>✨ Önerilen Eşleşmeler</Text>
            {potentialMatches.map((user, index) => {
              const isLiked = likedUsers.includes(user.id);
              
              return (
                <Animated.View
                  key={user.id}
                  style={{
                    opacity: cardAnims[index],
                    transform: [{
                      translateY: cardAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }],
                  }}
                >
                  <View style={styles.matchCard}>
                    <View style={styles.matchHeader}>
                      <LinearGradient
                        colors={getAvatarGradient(user.avatar) as [string, string]}
                        style={styles.avatar}
                      >
                        <Text style={styles.avatarText}>{user.avatar}</Text>
                      </LinearGradient>
                      <View style={styles.matchInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.matchName}>{user.name}</Text>
                          <View style={styles.matchScoreBadge}>
                            <Text style={styles.matchScoreText}>{user.matchScore}%</Text>
                          </View>
                        </View>
                        <View style={styles.matchMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="location" size={14} color={SemanticColors.text.tertiary} />
                            <Text style={styles.metaText}>{user.city}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="flame" size={14} color={Palette.success[500]} />
                            <Text style={styles.metaText}>{user.daysSmokeeFree} gün</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.motivation}>"{user.motivation}"</Text>

                    <View style={styles.interests}>
                      {user.interests.map((interest) => (
                        <View key={interest} style={styles.interestTag}>
                          <Text style={styles.interestText}>{interest}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.matchActions}>
                      <TouchableOpacity style={styles.skipButton}>
                        <Ionicons name="close" size={24} color={SemanticColors.text.tertiary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.likeButton, isLiked && styles.likeButtonActive]}
                        onPress={() => handleLike(user.id)}
                        disabled={isLiked}
                      >
                        <LinearGradient
                          colors={isLiked 
                            ? [Palette.success[500], Palette.success[600]] 
                            : Gradients.primary as [string, string]
                          }
                          style={styles.likeGradient}
                        >
                          <Ionicons 
                            name={isLiked ? "checkmark" : "heart"} 
                            size={24} 
                            color="#fff" 
                          />
                          <Text style={styles.likeText}>
                            {isLiked ? 'İstek Gönderildi' : 'Bağlan'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </>
        ) : (
          <>
            {/* Friends List */}
            <FadeIn delay={0}>
              <View style={styles.friendsStats}>
                <View style={styles.friendsStat}>
                  <Text style={styles.friendsStatValue}>{connectedFriends.length}</Text>
                  <Text style={styles.friendsStatLabel}>Arkadaş</Text>
                </View>
                <View style={styles.friendsStatDivider} />
                <View style={styles.friendsStat}>
                  <Text style={styles.friendsStatValue}>{likedUsers.length}</Text>
                  <Text style={styles.friendsStatLabel}>Bekleyen</Text>
                </View>
              </View>
            </FadeIn>

            {connectedFriends.map((friend, index) => (
              <FadeIn key={friend.id} delay={index * 100}>
                <ScalePressable style={styles.friendCard} scaleValue={0.98}>
                  <LinearGradient
                    colors={getAvatarGradient(friend.avatar) as [string, string]}
                    style={styles.friendAvatar}
                  >
                    <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <View style={styles.friendMeta}>
                      <Ionicons name="flame" size={14} color={Palette.success[500]} />
                      <Text style={styles.friendDays}>{friend.daysSmokeeFree} gün sigarasız</Text>
                    </View>
                    <Text style={styles.friendActive}>{friend.lastActive}</Text>
                  </View>
                  <View style={styles.friendActions}>
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble" size={20} color={Palette.primary[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportButton}>
                      <Ionicons name="heart" size={20} color={Palette.error[500]} />
                    </TouchableOpacity>
                  </View>
                </ScalePressable>
              </FadeIn>
            ))}

            {/* Empty State if no friends */}
            {connectedFriends.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={SemanticColors.text.tertiary} />
                <Text style={styles.emptyTitle}>Henüz arkadaşın yok</Text>
                <Text style={styles.emptyText}>
                  Keşfet sekmesinden yeni insanlarla tanış!
                </Text>
              </View>
            )}
          </>
        )}

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
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: SemanticColors.surface.default,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  tabActive: {
    backgroundColor: Palette.primary[500],
    borderColor: Palette.primary[500],
  },
  tabText: {
    ...Typography.label.medium,
    color: SemanticColors.text.secondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: Palette.error[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  tabBadgeText: {
    ...Typography.caption.small,
    color: '#fff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.lg,
  },
  infoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.label.large,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  matchCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  matchInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  matchName: {
    ...Typography.label.large,
    color: SemanticColors.text.primary,
  },
  matchScoreBadge: {
    backgroundColor: withAlpha(Palette.success[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  matchScoreText: {
    ...Typography.caption.medium,
    color: Palette.success[500],
    fontWeight: '600',
  },
  matchMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  motivation: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  interestTag: {
    backgroundColor: SemanticColors.background.tertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  interestText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  matchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SemanticColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  likeButtonActive: {},
  likeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  likeText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  friendsStats: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  friendsStat: {
    flex: 1,
    alignItems: 'center',
  },
  friendsStatValue: {
    ...Typography.stat.medium,
    color: SemanticColors.text.primary,
  },
  friendsStatLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  friendsStatDivider: {
    width: 1,
    backgroundColor: SemanticColors.border.subtle,
    marginHorizontal: Spacing.lg,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  friendDays: {
    ...Typography.caption.medium,
    color: Palette.success[500],
  },
  friendActive: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(Palette.error[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
  },
});

