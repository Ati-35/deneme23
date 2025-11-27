import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../../constants/DesignTokens';
import { ScalePressable } from '../../components/interactions';
import { FadeIn } from '../../components/animations';

const { width } = Dimensions.get('window');

type IconName = keyof typeof Ionicons.glyphMap;

interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  gradient: readonly string[];
}

const categories: Category[] = [
  { id: 'all', name: 'Tümü', icon: 'grid', color: Palette.primary[500], gradient: Gradients.primary },
  { id: 'education', name: 'Eğitim', icon: 'school', color: Palette.info[500], gradient: Gradients.info },
  { id: 'community', name: 'Topluluk', icon: 'people', color: Palette.purple[500], gradient: Gradients.purple },
  { id: 'tips', name: 'İpuçları', icon: 'bulb', color: Palette.accent[500], gradient: Gradients.accent },
  { id: 'wellness', name: 'Wellness', icon: 'leaf', color: Palette.success[500], gradient: Gradients.success },
];

// New feature shortcuts for the discover page
interface FeatureShortcut {
  id: string;
  name: string;
  icon: IconName;
  gradient: readonly string[];
  route: string;
  badge?: string;
}

const featureShortcuts: FeatureShortcut[] = [
  { id: '1', name: 'AI Koç', icon: 'sparkles', gradient: Gradients.purple, route: '/aiCoach', badge: 'YENİ' },
  { id: '2', name: 'Nefes', icon: 'fitness', gradient: Gradients.ocean, route: '/breathingExercise' },
  { id: '3', name: 'Oyunlar', icon: 'game-controller', gradient: Gradients.accent, route: '/miniGames' },
  { id: '4', name: 'Arkadaşlar', icon: 'people', gradient: Gradients.sunset, route: '/socialMatch' },
  { id: '5', name: 'Uyku', icon: 'moon', gradient: ['#1a1a2e', '#16213e'] as const, route: '/sleepTracker', badge: 'YENİ' },
  { id: '6', name: 'Sesli Günlük', icon: 'mic', gradient: Gradients.info, route: '/voiceJournal' },
];

interface ContentItem {
  id: string;
  type: 'article' | 'video' | 'challenge' | 'community' | 'meditation' | 'game';
  title: string;
  description: string;
  image?: string;
  duration?: string;
  category: string;
  featured?: boolean;
  participants?: number;
  likes?: number;
}

const contentItems: ContentItem[] = [
  {
    id: '1',
    type: 'article',
    title: 'Nikotin Bağımlılığını Anlamak',
    description: 'Beyin kimyası ve bağımlılık döngüsü hakkında bilimsel bilgiler',
    duration: '8 dk okuma',
    category: 'education',
    featured: true,
    likes: 234,
  },
  {
    id: '2',
    type: 'meditation',
    title: 'Sabah Meditasyonu',
    description: 'Güne sakin ve odaklı başla',
    duration: '10 dk',
    category: 'wellness',
    featured: true,
  },
  {
    id: '3',
    type: 'challenge',
    title: '7 Günlük Nefes Challenge',
    description: 'Her gün nefes egzersizi yaparak akciğerlerini güçlendir',
    category: 'tips',
    participants: 1247,
  },
  {
    id: '4',
    type: 'game',
    title: 'Hafıza Oyunu',
    description: 'Dikkatini dağıt ve beynini eğlendir',
    category: 'wellness',
    duration: '3-5 dk',
  },
  {
    id: '5',
    type: 'community',
    title: 'Başarı Hikayeleri',
    description: 'Sigarayı bırakan binlerce kişinin ilham veren hikayeleri',
    category: 'community',
    participants: 3421,
  },
  {
    id: '6',
    type: 'video',
    title: 'Tetikleyicilerle Başa Çıkmak',
    description: 'Uzman psikologdan pratik öneriler',
    duration: '12 dk video',
    category: 'education',
    likes: 567,
  },
];

const communityPosts = [
  {
    id: '1',
    user: 'Ahmet K.',
    avatar: 'A',
    content: '30 gündür sigarasızım! 🎉 Hiç bu kadar iyi hissetmemiştim.',
    likes: 45,
    comments: 12,
    time: '2s önce',
  },
  {
    id: '2',
    user: 'Ayşe M.',
    avatar: 'Y',
    content: 'Bugün çok zorlandım ama nefes egzersizleri gerçekten yardımcı oldu.',
    likes: 32,
    comments: 8,
    time: '5s önce',
  },
];

export default function DiscoverScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const filteredContent = contentItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery === '' || matchesSearch);
  });

  const featuredContent = contentItems.filter(item => item.featured);

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  };

  const getContentIcon = (type: ContentItem['type']): IconName => {
    switch (type) {
      case 'article': return 'document-text';
      case 'video': return 'play-circle';
      case 'challenge': return 'trophy';
      case 'community': return 'people';
      case 'meditation': return 'leaf';
      case 'game': return 'game-controller';
      default: return 'document';
    }
  };

  const getContentColor = (type: ContentItem['type']) => {
    switch (type) {
      case 'article': return Palette.info[500];
      case 'video': return Palette.error[500];
      case 'challenge': return Palette.accent[500];
      case 'community': return Palette.purple[500];
      case 'meditation': return Palette.success[500];
      case 'game': return Palette.primary[500];
      default: return Palette.primary[500];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Keşfet 🔍</Text>
              <Text style={styles.subtitle}>Öğren, ilham al, bağlan</Text>
            </View>
            <View style={styles.headerButtons}>
              <ScalePressable 
                onPress={() => router.push('/leaderboard')}
                haptic="light"
              >
                <LinearGradient
                  colors={Gradients.accent as [string, string]}
                  style={styles.leaderboardBtn}
                >
                  <Ionicons name="trophy" size={20} color="#fff" />
                </LinearGradient>
              </ScalePressable>
              <ScalePressable 
                onPress={() => router.push('/weeklyReport')}
                haptic="light"
              >
                <View style={styles.reportBtn}>
                  <Ionicons name="bar-chart" size={20} color={SemanticColors.text.primary} />
                </View>
              </ScalePressable>
            </View>
          </View>
        </FadeIn>

        {/* Search Bar */}
        <FadeIn delay={50}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={SemanticColors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="İçerik, özellik veya kişi ara..."
              placeholderTextColor={SemanticColors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={SemanticColors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </FadeIn>

        {/* Feature Shortcuts */}
        <FadeIn delay={75}>
          <Text style={styles.sectionTitle}>⚡ Hızlı Erişim</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortcutsContainer}
          >
            {featureShortcuts.map((feature) => (
              <ScalePressable
                key={feature.id}
                style={styles.shortcutCard}
                onPress={() => router.push(feature.route as any)}
                scaleValue={0.95}
              >
                <LinearGradient
                  colors={feature.gradient as [string, string]}
                  style={styles.shortcutGradient}
                >
                  {feature.badge && (
                    <View style={styles.shortcutBadge}>
                      <Text style={styles.shortcutBadgeText}>{feature.badge}</Text>
                    </View>
                  )}
                  <Ionicons name={feature.icon} size={24} color="#fff" />
                  <Text style={styles.shortcutName}>{feature.name}</Text>
                </LinearGradient>
              </ScalePressable>
            ))}
          </ScrollView>
        </FadeIn>

        {/* Categories */}
        <FadeIn delay={100}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: withAlpha(category.color, 0.15) },
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={18}
                    color={isSelected ? category.color : SemanticColors.text.tertiary}
                  />
                  <Text style={[
                    styles.categoryText,
                    isSelected && { color: category.color },
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </FadeIn>

        {/* AI Coach Promo */}
        <FadeIn delay={120}>
          <ScalePressable 
            onPress={() => router.push('/aiCoach')}
            scaleValue={0.98}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1'] as [string, string]}
                style={styles.aiPromoCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.aiPromoIcon}>
                  <Ionicons name="sparkles" size={28} color="#fff" />
                </View>
                <View style={styles.aiPromoContent}>
                  <Text style={styles.aiPromoTitle}>AI Koçunla Konuş</Text>
                  <Text style={styles.aiPromoText}>
                    Sigara isteği mi var? Hemen yardım al!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </Animated.View>
          </ScalePressable>
        </FadeIn>

        {/* Featured Section */}
        {selectedCategory === 'all' && (
          <FadeIn delay={150}>
            <Text style={styles.sectionTitle}>⭐ Öne Çıkanlar</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {featuredContent.map((item, index) => (
                <ScalePressable
                  key={item.id}
                  style={styles.featuredCard}
                  scaleValue={0.98}
                >
                  <LinearGradient
                    colors={
                      item.type === 'meditation' 
                        ? Gradients.forest as [string, string]
                        : Gradients.midnight as [string, string]
                    }
                    style={styles.featuredGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.featuredBadge}>
                      <Ionicons name={getContentIcon(item.type)} size={16} color="#fff" />
                      <Text style={styles.featuredBadgeText}>
                        {item.type === 'article' ? 'Makale' : 
                         item.type === 'meditation' ? 'Meditasyon' : 'Video'}
                      </Text>
                    </View>
                    <Text style={styles.featuredTitle}>{item.title}</Text>
                    <Text style={styles.featuredDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.featuredMeta}>
                      {item.duration && (
                        <View style={styles.featuredMetaItem}>
                          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.featuredMetaText}>{item.duration}</Text>
                        </View>
                      )}
                      {item.likes && (
                        <View style={styles.featuredMetaItem}>
                          <Ionicons name="heart" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.featuredMetaText}>{item.likes}</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </ScalePressable>
              ))}
            </ScrollView>
          </FadeIn>
        )}

        {/* Community Feed */}
        {(selectedCategory === 'all' || selectedCategory === 'community') && (
          <FadeIn delay={200}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👥 Topluluk</Text>
              <TouchableOpacity onPress={() => router.push('/socialMatch')}>
                <Text style={styles.seeAllText}>Arkadaş Bul</Text>
              </TouchableOpacity>
            </View>
            {communityPosts.map((post) => (
              <ScalePressable key={post.id} style={styles.communityPost} scaleValue={0.99}>
                <View style={styles.communityHeader}>
                  <LinearGradient
                    colors={Gradients.primary as [string, string]}
                    style={styles.communityAvatar}
                  >
                    <Text style={styles.communityAvatarText}>{post.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.communityUserInfo}>
                    <Text style={styles.communityUserName}>{post.user}</Text>
                    <Text style={styles.communityTime}>{post.time}</Text>
                  </View>
                </View>
                <Text style={styles.communityContent}>{post.content}</Text>
                <View style={styles.communityActions}>
                  <TouchableOpacity style={styles.communityAction}>
                    <Ionicons name="heart-outline" size={20} color={SemanticColors.text.secondary} />
                    <Text style={styles.communityActionText}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.communityAction}>
                    <Ionicons name="chatbubble-outline" size={20} color={SemanticColors.text.secondary} />
                    <Text style={styles.communityActionText}>{post.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.communityAction}>
                    <Ionicons name="share-outline" size={20} color={SemanticColors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </ScalePressable>
            ))}
          </FadeIn>
        )}

        {/* Content Grid */}
        <FadeIn delay={250}>
          <Text style={styles.sectionTitle}>📚 İçerikler</Text>
          <View style={styles.contentGrid}>
            {filteredContent.map((item) => (
              <ScalePressable
                key={item.id}
                style={styles.contentCard}
                scaleValue={0.98}
                onPress={() => {
                  if (item.type === 'game') {
                    router.push('/miniGames');
                  } else if (item.type === 'meditation') {
                    router.push('/meditation');
                  }
                }}
              >
                <View style={[
                  styles.contentIconContainer,
                  { backgroundColor: withAlpha(getContentColor(item.type), 0.15) }
                ]}>
                  <Ionicons
                    name={getContentIcon(item.type)}
                    size={28}
                    color={getContentColor(item.type)}
                  />
                </View>
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.contentDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.contentMeta}>
                    {item.duration && (
                      <View style={styles.contentMetaItem}>
                        <Ionicons name="time-outline" size={12} color={SemanticColors.text.tertiary} />
                        <Text style={styles.contentMetaText}>{item.duration}</Text>
                      </View>
                    )}
                    {item.participants && (
                      <View style={styles.contentMetaItem}>
                        <Ionicons name="people-outline" size={12} color={SemanticColors.text.tertiary} />
                        <Text style={styles.contentMetaText}>{item.participants} katılımcı</Text>
                      </View>
                    )}
                    {item.likes && (
                      <View style={styles.contentMetaItem}>
                        <Ionicons name="heart" size={12} color={Palette.error[400]} />
                        <Text style={styles.contentMetaText}>{item.likes}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={SemanticColors.text.tertiary}
                />
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>🚀 Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            <ScalePressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/challenges')}
            >
              <LinearGradient
                colors={Gradients.accent as [string, string]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="trophy" size={32} color="#fff" />
                <Text style={styles.quickActionTitle}>Günlük Görevler</Text>
                <Text style={styles.quickActionSubtitle}>3 görev bekliyor</Text>
              </LinearGradient>
            </ScalePressable>
            <ScalePressable 
              style={styles.quickActionCard}
              onPress={() => router.push('/expertConsultation')}
            >
              <LinearGradient
                colors={Gradients.info as [string, string]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="medical" size={32} color="#fff" />
                <Text style={styles.quickActionTitle}>Uzman Desteği</Text>
                <Text style={styles.quickActionSubtitle}>7/24 Danışmanlık</Text>
              </LinearGradient>
            </ScalePressable>
          </View>
        </FadeIn>

        {/* Tab bar spacing */}
        <View style={{ height: ComponentHeight.tabBar + 20 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.heading.h2,
    color: SemanticColors.text.primary,
  },
  subtitle: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.xs,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  leaderboardBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.accent,
  },
  reportBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  shortcutsContainer: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  shortcutCard: {
    width: 80,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  shortcutGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  shortcutBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  shortcutBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: Palette.purple[600],
  },
  shortcutName: {
    ...Typography.caption.medium,
    color: '#fff',
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: SemanticColors.surface.default,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  categoryText: {
    ...Typography.label.small,
    color: SemanticColors.text.secondary,
  },
  aiPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    ...Shadows.lg,
  },
  aiPromoIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPromoContent: {
    flex: 1,
  },
  aiPromoTitle: {
    ...Typography.label.large,
    color: '#fff',
  },
  aiPromoText: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.label.small,
    color: Palette.primary[500],
  },
  featuredContainer: {
    paddingBottom: Spacing.md,
  },
  featuredCard: {
    width: width * 0.75,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  featuredGradient: {
    padding: Spacing.lg,
    minHeight: 180,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: withAlpha('#fff', 0.2),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  featuredBadgeText: {
    ...Typography.caption.medium,
    color: '#fff',
    fontWeight: '600',
  },
  featuredTitle: {
    ...Typography.heading.h4,
    color: '#fff',
    marginBottom: Spacing.sm,
  },
  featuredDescription: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featuredMetaText: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  communityPost: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  communityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  communityAvatarText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  communityUserInfo: {
    flex: 1,
  },
  communityUserName: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  communityTime: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  communityContent: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  communityActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  communityAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  communityActionText: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  contentGrid: {
    marginBottom: Spacing.xl,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    gap: Spacing.md,
  },
  contentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  contentDescription: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  contentMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  contentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentMetaText: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  quickActionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  quickActionTitle: {
    ...Typography.label.medium,
    color: '#fff',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
