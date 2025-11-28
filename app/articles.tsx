// Blog ve Makale Sistemi
// Sağlık haberleri, bilimsel araştırma özetleri, favoriler

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
  Share,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  readTime: number;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
  isFavorite: boolean;
  views: number;
}

type ArticleCategory = 'health' | 'science' | 'motivation' | 'tips' | 'news' | 'research';

// Örnek makaleler
const SAMPLE_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Sigara Bırakmanın Vücudunuza 10 İnanılmaz Etkisi',
    summary: 'Sigara bıraktığınızda vücudunuzda neler değişir? İşte bilmeniz gereken her şey.',
    content: 'Sigara bırakmak, sağlığınız için yapabileceğiniz en önemli kararlardan biridir...',
    category: 'health',
    author: 'Dr. Ayşe Yılmaz',
    publishedAt: '2024-11-20',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tags: ['sağlık', 'akciğer', 'kalp'],
    isFeatured: true,
    isFavorite: false,
    views: 1250,
  },
  {
    id: '2',
    title: 'Nikotin Bağımlılığının Beyindeki Etkileri',
    summary: 'Bilim insanları nikotinin beyin üzerindeki etkilerini açıklıyor.',
    content: 'Nikotin, beynin ödül merkezlerini doğrudan etkileyen güçlü bir maddedir...',
    category: 'science',
    author: 'Prof. Dr. Mehmet Kaya',
    publishedAt: '2024-11-18',
    readTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400',
    tags: ['bilim', 'beyin', 'nikotin'],
    isFeatured: true,
    isFavorite: false,
    views: 980,
  },
  {
    id: '3',
    title: 'Sigara Bırakma Yolculuğunda Motivasyonunuzu Koruyun',
    summary: 'Zor zamanlarda motivasyonunuzu yüksek tutmanın 7 yolu.',
    content: 'Sigara bırakma yolculuğu zorlu olabilir ama doğru stratejilerle başarabilirsiniz...',
    category: 'motivation',
    author: 'Psikolog Zeynep Demir',
    publishedAt: '2024-11-15',
    readTime: 6,
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
    tags: ['motivasyon', 'psikoloji', 'başarı'],
    isFeatured: false,
    isFavorite: false,
    views: 2100,
  },
  {
    id: '4',
    title: '2024 Yılının En Önemli Sigara Araştırmaları',
    summary: 'Bu yıl yapılan en önemli bilimsel araştırmaların özeti.',
    content: '2024 yılı, sigara bağımlılığı araştırmalarında önemli gelişmelere sahne oldu...',
    category: 'research',
    author: 'Araştırma Ekibi',
    publishedAt: '2024-11-10',
    readTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    tags: ['araştırma', 'bilim', '2024'],
    isFeatured: false,
    isFavorite: false,
    views: 750,
  },
  {
    id: '5',
    title: 'Sigara İsteğiyle Başa Çıkmanın Pratik Yolları',
    summary: 'Günlük hayatta uygulayabileceğiniz 15 etkili strateji.',
    content: 'Sigara isteği geldiğinde yapabileceğiniz birçok şey vardır...',
    category: 'tips',
    author: 'Uzman Diyetisyen Elif Çelik',
    publishedAt: '2024-11-08',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    tags: ['ipuçları', 'strateji', 'pratik'],
    isFeatured: false,
    isFavorite: false,
    views: 3200,
  },
  {
    id: '6',
    title: 'Türkiye\'de Sigara Kullanımı: Son İstatistikler',
    summary: 'TÜİK verilerine göre Türkiye\'deki sigara kullanım oranları.',
    content: 'Türkiye İstatistik Kurumu\'nun son verilerine göre...',
    category: 'news',
    author: 'Haber Merkezi',
    publishedAt: '2024-11-05',
    readTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=400',
    tags: ['haber', 'istatistik', 'Türkiye'],
    isFeatured: false,
    isFavorite: false,
    views: 1800,
  },
];

const CATEGORIES: { id: ArticleCategory; name: string; icon: string; color: string }[] = [
  { id: 'health', name: 'Sağlık', icon: 'heart', color: '#EF4444' },
  { id: 'science', name: 'Bilim', icon: 'flask', color: '#8B5CF6' },
  { id: 'motivation', name: 'Motivasyon', icon: 'rocket', color: '#F59E0B' },
  { id: 'tips', name: 'İpuçları', icon: 'bulb', color: '#10B981' },
  { id: 'news', name: 'Haberler', icon: 'newspaper', color: '#3B82F6' },
  { id: 'research', name: 'Araştırma', icon: 'document-text', color: '#EC4899' },
];

export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavorites || article.isFavorite;
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  const featuredArticles = articles.filter(a => a.isFeatured);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const toggleFavorite = (articleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setArticles(prev =>
      prev.map(a =>
        a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
      )
    );
  };

  const shareArticle = async (article: Article) => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.summary}\n\nSigaraBırak uygulamasından paylaşıldı.`,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const getCategoryInfo = (category: ArticleCategory) => {
    return CATEGORIES.find(c => c.id === category);
  };

  const renderFeaturedCard = (article: Article) => (
    <TouchableOpacity
      key={article.id}
      style={styles.featuredCard}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: article.imageUrl }}
        style={styles.featuredImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredGradient}
      >
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.featuredBadgeText}>Öne Çıkan</Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredAuthor}>{article.author}</Text>
          <Text style={styles.featuredDot}>•</Text>
          <Text style={styles.featuredReadTime}>{article.readTime} dk okuma</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderArticleCard = (article: Article) => {
    const categoryInfo = getCategoryInfo(article.category);

    return (
      <TouchableOpacity key={article.id} style={styles.articleCard}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.articleImage}
        />
        <View style={styles.articleContent}>
          <View style={styles.articleHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo?.color + '20' }]}>
              <Ionicons
                name={categoryInfo?.icon as any}
                size={12}
                color={categoryInfo?.color}
              />
              <Text style={[styles.categoryText, { color: categoryInfo?.color }]}>
                {categoryInfo?.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(article.id)}
            >
              <Ionicons
                name={article.isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={article.isFavorite ? Colors.error : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.articleTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.articleSummary} numberOfLines={2}>
            {article.summary}
          </Text>

          <View style={styles.articleFooter}>
            <View style={styles.articleMeta}>
              <Text style={styles.articleAuthor}>{article.author}</Text>
              <Text style={styles.articleDot}>•</Text>
              <Text style={styles.articleReadTime}>{article.readTime} dk</Text>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareArticle(article)}
            >
              <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.title}>📚 Makaleler</Text>
          <TouchableOpacity
            style={[styles.favoriteFilter, showFavorites && styles.favoriteFilterActive]}
            onPress={() => setShowFavorites(!showFavorites)}
          >
            <Ionicons
              name={showFavorites ? 'heart' : 'heart-outline'}
              size={22}
              color={showFavorites ? Colors.error : Colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Makale ara..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'all' && styles.categoryButtonTextActive,
            ]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
                selectedCategory === category.id && { borderColor: category.color },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? category.color : Colors.textSecondary}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && { color: category.color },
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Articles */}
        {selectedCategory === 'all' && featuredArticles.length > 0 && !searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Öne Çıkanlar</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {featuredArticles.map(renderFeaturedCard)}
            </ScrollView>
          </View>
        )}

        {/* Articles List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {showFavorites ? '❤️ Favorilerim' : '📰 Tüm Makaleler'}
            </Text>
            <Text style={styles.articleCount}>
              {filteredArticles.length} makale
            </Text>
          </View>

          {filteredArticles.length > 0 ? (
            filteredArticles.map(renderArticleCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                {showFavorites ? 'Henüz favori makaleniz yok' : 'Makale bulunamadı'}
              </Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
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
  favoriteFilter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteFilterActive: {
    backgroundColor: Colors.error + '15',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  articleCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  featuredContainer: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: width * 0.75,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 6,
  },
  featuredReadTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  articleImage: {
    width: 100,
    height: 120,
  },
  articleContent: {
    flex: 1,
    padding: 12,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  articleSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  articleDot: {
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 4,
  },
  articleReadTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  shareButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});







