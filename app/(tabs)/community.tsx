import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { communityPosts } from '../../constants/Data';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
  const [selectedTab, setSelectedTab] = useState('feed');
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});

  const toggleLike = (postId: string) => {
    setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>👥 Topluluk</Text>
          <Text style={styles.subtitle}>Birlikte daha güçlüyüz!</Text>
        </View>

        {/* Topluluk İstatistikleri */}
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12,458</Text>
              <Text style={styles.statLabel}>Üye</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>847</Text>
              <Text style={styles.statLabel}>Bugün Aktif</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.3M</Text>
              <Text style={styles.statLabel}>Sigara Bırakıldı</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Seçimi */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'feed' && styles.tabActive]}
            onPress={() => setSelectedTab('feed')}
          >
            <Ionicons
              name="newspaper-outline"
              size={20}
              color={selectedTab === 'feed' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'feed' && styles.tabTextActive]}>
              Akış
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'stories' && styles.tabActive]}
            onPress={() => setSelectedTab('stories')}
          >
            <Ionicons
              name="trophy-outline"
              size={20}
              color={selectedTab === 'stories' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, selectedTab === 'stories' && styles.tabTextActive]}>
              Başarı Hikayeleri
            </Text>
          </TouchableOpacity>
        </View>

        {/* Paylaşım Oluştur */}
        <View style={styles.createPost}>
          <View style={styles.createPostAvatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <TextInput
            style={styles.createPostInput}
            placeholder="Düşüncelerini paylaş..."
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.createPostButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Paylaşımlar */}
        {communityPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAvatar}>
                <Text style={styles.avatarText}>{post.avatar}</Text>
              </View>
              <View style={styles.postUserInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.postUsername}>{post.username}</Text>
                  <View style={styles.daysBadge}>
                    <Ionicons name="flame" size={12} color={Colors.accent} />
                    <Text style={styles.daysText}>{post.daysSmokeFree} gün</Text>
                  </View>
                </View>
                <Text style={styles.postTime}>{post.time}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleLike(post.id)}
              >
                <Ionicons
                  name={liked[post.id] ? 'heart' : 'heart-outline'}
                  size={22}
                  color={liked[post.id] ? Colors.error : Colors.textSecondary}
                />
                <Text style={[styles.actionText, liked[post.id] && { color: Colors.error }]}>
                  {post.likes + (liked[post.id] ? 1 : 0)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.actionText}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Grup Önerileri */}
        <Text style={styles.sectionTitle}>🎯 Önerilen Gruplar</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupsContainer}
        >
          <GroupCard
            name="Yeni Başlayanlar"
            members={3420}
            color="#10B981"
            icon="leaf"
          />
          <GroupCard
            name="1 Yıl Kulübü"
            members={892}
            color="#F59E0B"
            icon="trophy"
          />
          <GroupCard
            name="Motivasyon Grubu"
            members={5621}
            color="#8B5CF6"
            icon="heart"
          />
          <GroupCard
            name="Egzersiz & Sağlık"
            members={2145}
            color="#3B82F6"
            icon="fitness"
          />
        </ScrollView>

        {/* Haftalık Sıralama */}
        <Text style={styles.sectionTitle}>🏆 Haftalık Liderler</Text>
        <View style={styles.leaderboardCard}>
          {[
            { rank: 1, name: 'AhmetY', days: 365, color: Colors.gold },
            { rank: 2, name: 'MerveCan', days: 245, color: Colors.silver },
            { rank: 3, name: 'EmreK', days: 180, color: Colors.bronze },
          ].map((leader) => (
            <View key={leader.rank} style={styles.leaderItem}>
              <View style={[styles.rankBadge, { backgroundColor: leader.color }]}>
                <Text style={styles.rankText}>{leader.rank}</Text>
              </View>
              <View style={styles.leaderAvatar}>
                <Text style={styles.avatarText}>{leader.name[0]}</Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{leader.name}</Text>
                <Text style={styles.leaderDays}>{leader.days} gün sigarasız</Text>
              </View>
              <Ionicons name="flame" size={24} color={Colors.accent} />
            </View>
          ))}
        </View>

        {/* Destek Butonu */}
        <TouchableOpacity style={styles.supportButton}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.supportGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <Text style={styles.supportText}>Destek Al</Text>
            <Text style={styles.supportSubtext}>7/24 topluluk desteği</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface GroupCardProps {
  name: string;
  members: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function GroupCard({ name, members, color, icon }: GroupCardProps) {
  return (
    <View style={styles.groupCard}>
      <View style={[styles.groupIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.groupName}>{name}</Text>
      <Text style={styles.groupMembers}>{members.toLocaleString()} üye</Text>
      <TouchableOpacity style={[styles.joinButton, { backgroundColor: color }]}>
        <Text style={styles.joinText}>Katıl</Text>
      </TouchableOpacity>
    </View>
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
    paddingBottom: 100, // Tab bar için alan
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
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
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  createPost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    color: Colors.text,
  },
  createPostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  postCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postUsername: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  daysText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  groupsContainer: {
    paddingBottom: 10,
  },
  groupCard: {
    width: 150,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  leaderboardCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  leaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  leaderDays: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  supportButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  supportText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  supportSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
});





