import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { educationVideos, EducationVideo } from '../../constants/Data';

const { width, height } = Dimensions.get('window');

const categories = ['Tümü', 'Başlangıç', 'Bilgi', 'Rehber', 'Teknikler', 'Egzersiz', 'Motivasyon'];

export default function EducationScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedVideo, setSelectedVideo] = useState<EducationVideo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const videoRef = useRef<Video>(null);

  const filteredVideos = selectedCategory === 'Tümü'
    ? educationVideos
    : educationVideos.filter(v => v.category === selectedCategory);

  const openVideo = (video: EducationVideo) => {
    setSelectedVideo(video);
    setIsModalVisible(true);
  };

  const closeVideo = async () => {
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
    }
    setIsModalVisible(false);
    setSelectedVideo(null);
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
          <Text style={styles.title}>📚 Eğitimler</Text>
          <Text style={styles.subtitle}>Bilgi güçtür, öğrenmeye devam et!</Text>
        </View>

        {/* Öne Çıkan Video */}
        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={() => openVideo(educationVideos[0])}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: educationVideos[0].thumbnail }}
            style={styles.featuredImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.featuredOverlay}
          >
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.featuredBadgeText}>Öne Çıkan</Text>
            </View>
            <View style={styles.playIconLarge}>
              <Ionicons name="play" size={36} color="#fff" />
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>{educationVideos[0].title}</Text>
              <View style={styles.featuredMeta}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.featuredDuration}>{educationVideos[0].duration}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Kategoriler */}
        <Text style={styles.sectionTitle}>🎯 Kategoriler</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Video Listesi - Yatay Kaydırma */}
        <Text style={styles.sectionTitle}>🎬 Eğitim Videoları</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videosContainer}
          decelerationRate="fast"
          snapToInterval={width * 0.7 + 12}
        >
          {filteredVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              onPress={() => openVideo(video)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: video.thumbnail }}
                style={styles.videoThumbnail}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.videoOverlay}
              >
                <View style={styles.playIcon}>
                  <Ionicons name="play" size={24} color="#fff" />
                </View>
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={12} color="#fff" />
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </LinearGradient>
              <View style={styles.videoInfo}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{video.category}</Text>
                </View>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tüm Videolar Listesi */}
        <Text style={styles.sectionTitle}>📋 Tüm Eğitimler</Text>
        {filteredVideos.map((video) => (
          <TouchableOpacity
            key={`list-${video.id}`}
            style={styles.listCard}
            onPress={() => openVideo(video)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: video.thumbnail }}
              style={styles.listThumbnail}
            />
            <View style={styles.listInfo}>
              <View style={styles.listCategoryTag}>
                <Text style={styles.listCategoryText}>{video.category}</Text>
              </View>
              <Text style={styles.listTitle} numberOfLines={2}>
                {video.title}
              </Text>
              <View style={styles.listMeta}>
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.listDuration}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.listPlayBtn}>
              <Ionicons name="play-circle" size={36} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Günlük İpucu */}
        <View style={styles.tipCard}>
          <LinearGradient
            colors={[Colors.primary + '20', Colors.primaryDark + '10']}
            style={styles.tipGradient}
          >
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={28} color={Colors.accent} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>💡 Günün İpucu</Text>
              <Text style={styles.tipText}>
                Sigara isteği geldiğinde derin nefes al ve 10'a kadar say. 
                Bu basit teknik, isteğin geçmesine yardımcı olur.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideo}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeVideo} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedVideo?.title}
            </Text>
            <View style={{ width: 44 }} />
          </View>
          
          <View style={styles.videoPlayerContainer}>
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={{
                uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          </View>

          <View style={styles.videoDetails}>
            <Text style={styles.videoDetailTitle}>{selectedVideo?.title}</Text>
            <View style={styles.videoDetailMeta}>
              <View style={styles.detailTag}>
                <Ionicons name="folder-outline" size={14} color={Colors.primary} />
                <Text style={styles.detailTagText}>{selectedVideo?.category}</Text>
              </View>
              <View style={styles.detailTag}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.detailTagText}>{selectedVideo?.duration}</Text>
              </View>
            </View>
            <Text style={styles.videoDescription}>
              Bu eğitim videosu sigara bırakma yolculuğunuzda size yardımcı olacak 
              önemli bilgiler ve teknikler içermektedir. Düzenli olarak izleyerek 
              motivasyonunuzu yüksek tutabilirsiniz.
            </Text>
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
  featuredCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  featuredBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  playIconLarge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredInfo: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
  },
  videosContainer: {
    paddingBottom: 10,
  },
  videoCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  videoThumbnail: {
    width: '100%',
    height: 160,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  videoInfo: {
    padding: 16,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listThumbnail: {
    width: 100,
    height: 70,
    borderRadius: 10,
  },
  listInfo: {
    flex: 1,
    marginLeft: 14,
  },
  listCategoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  listCategoryText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listPlayBtn: {
    marginLeft: 10,
  },
  tipCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 24,
  },
  tipGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.backgroundLight,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
  videoDetails: {
    padding: 20,
  },
  videoDetailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  videoDetailMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailTagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  videoDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});





