// Video Kütüphanesi
// 100+ eğitim videosu, uzman röportajları, meditasyon

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: number; // saniye
  thumbnailUrl: string;
  videoUrl: string;
  category: VideoCategory;
  instructor: string;
  level: VideoLevel;
  tags: string[];
  views: number;
  rating: number;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
}

export type VideoCategory = 
  | 'education'
  | 'motivation'
  | 'breathing'
  | 'meditation'
  | 'exercise'
  | 'nutrition'
  | 'psychology'
  | 'success_stories'
  | 'expert_talks';

export type VideoLevel = 'beginner' | 'intermediate' | 'advanced';

export interface VideoCategory {
  id: VideoCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Video kategorileri
export const VIDEO_CATEGORIES: VideoCategory[] = [
  {
    id: 'education',
    name: 'Eğitim',
    icon: 'school',
    color: '#3B82F6',
    description: 'Sigara ve nikotin bağımlılığı hakkında bilgi',
  },
  {
    id: 'motivation',
    name: 'Motivasyon',
    icon: 'rocket',
    color: '#F59E0B',
    description: 'Motivasyon ve ilham verici içerikler',
  },
  {
    id: 'breathing',
    name: 'Nefes Egzersizi',
    icon: 'fitness',
    color: '#10B981',
    description: 'Sigara isteğiyle başa çıkma teknikleri',
  },
  {
    id: 'meditation',
    name: 'Meditasyon',
    icon: 'leaf',
    color: '#8B5CF6',
    description: 'Rahatlama ve mindfulness egzersizleri',
  },
  {
    id: 'exercise',
    name: 'Egzersiz',
    icon: 'barbell',
    color: '#EF4444',
    description: 'Fiziksel aktivite ve spor videoları',
  },
  {
    id: 'nutrition',
    name: 'Beslenme',
    icon: 'nutrition',
    color: '#22C55E',
    description: 'Sağlıklı beslenme önerileri',
  },
  {
    id: 'psychology',
    name: 'Psikoloji',
    icon: 'brain',
    color: '#EC4899',
    description: 'Bağımlılık psikolojisi ve davranış değişikliği',
  },
  {
    id: 'success_stories',
    name: 'Başarı Hikayeleri',
    icon: 'trophy',
    color: '#F97316',
    description: 'Sigarayı bırakan kişilerin hikayeleri',
  },
  {
    id: 'expert_talks',
    name: 'Uzman Görüşleri',
    icon: 'person',
    color: '#6366F1',
    description: 'Doktor ve uzmanlardan öneriler',
  },
];

// Video veritabanı
export const VIDEOS: Video[] = [
  // Eğitim Videoları
  {
    id: 'edu_1',
    title: 'Nikotin Bağımlılığını Anlamak',
    description: 'Nikotinin beyinde nasıl çalıştığını ve bağımlılık mekanizmasını öğrenin.',
    duration: 720,
    thumbnailUrl: 'https://picsum.photos/seed/edu1/400/225',
    videoUrl: 'https://example.com/videos/education/nicotine.mp4',
    category: 'education',
    instructor: 'Prof. Dr. Ahmet Yıldız',
    level: 'beginner',
    tags: ['nikotin', 'bağımlılık', 'beyin'],
    views: 15420,
    rating: 4.8,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-01-15',
  },
  {
    id: 'edu_2',
    title: 'Sigara Dumanındaki Tehlikeler',
    description: '7000+ kimyasal madde ve sağlık etkileri hakkında detaylı bilgi.',
    duration: 540,
    thumbnailUrl: 'https://picsum.photos/seed/edu2/400/225',
    videoUrl: 'https://example.com/videos/education/chemicals.mp4',
    category: 'education',
    instructor: 'Uzm. Dr. Zeynep Kaya',
    level: 'beginner',
    tags: ['kimyasallar', 'sağlık', 'tehlike'],
    views: 12300,
    rating: 4.7,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-02-10',
  },
  {
    id: 'edu_3',
    title: 'Pasif İçicilik ve Riskleri',
    description: 'Çevrenizdekileri de etkileyen sigara dumanının tehlikeleri.',
    duration: 480,
    thumbnailUrl: 'https://picsum.photos/seed/edu3/400/225',
    videoUrl: 'https://example.com/videos/education/passive.mp4',
    category: 'education',
    instructor: 'Dr. Elif Demir',
    level: 'beginner',
    tags: ['pasif içicilik', 'aile', 'çocuklar'],
    views: 8700,
    rating: 4.6,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-03-05',
  },

  // Motivasyon Videoları
  {
    id: 'mot_1',
    title: 'Her Gün Yeni Bir Başlangıç',
    description: 'Sigarayı bırakma yolculuğunda motivasyonunuzu yüksek tutun.',
    duration: 360,
    thumbnailUrl: 'https://picsum.photos/seed/mot1/400/225',
    videoUrl: 'https://example.com/videos/motivation/fresh-start.mp4',
    category: 'motivation',
    instructor: 'Yaşam Koçu Mehmet Can',
    level: 'beginner',
    tags: ['motivasyon', 'başlangıç', 'umut'],
    views: 22500,
    rating: 4.9,
    isFeatured: true,
    isNew: true,
    createdAt: '2024-11-01',
  },
  {
    id: 'mot_2',
    title: 'Zor Anları Aşmak',
    description: 'Sigara isteği geldiğinde kendinizi nasıl motive edersiniz?',
    duration: 420,
    thumbnailUrl: 'https://picsum.photos/seed/mot2/400/225',
    videoUrl: 'https://example.com/videos/motivation/tough-times.mp4',
    category: 'motivation',
    instructor: 'Psikolog Ayşe Yılmaz',
    level: 'intermediate',
    tags: ['zorluk', 'başa çıkma', 'güç'],
    views: 18900,
    rating: 4.8,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-08-20',
  },

  // Nefes Egzersizleri
  {
    id: 'breath_1',
    title: '4-7-8 Nefes Tekniği',
    description: 'Anksiyeteyi azaltan ve sakinleştiren güçlü nefes egzersizi.',
    duration: 300,
    thumbnailUrl: 'https://picsum.photos/seed/breath1/400/225',
    videoUrl: 'https://example.com/videos/breathing/478.mp4',
    category: 'breathing',
    instructor: 'Yoga Eğitmeni Seda Öz',
    level: 'beginner',
    tags: ['nefes', '4-7-8', 'sakinlik'],
    views: 35200,
    rating: 4.9,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-04-15',
  },
  {
    id: 'breath_2',
    title: 'Kutu Nefesi (Box Breathing)',
    description: 'Navy SEAL\'lerin kullandığı stres yönetimi tekniği.',
    duration: 360,
    thumbnailUrl: 'https://picsum.photos/seed/breath2/400/225',
    videoUrl: 'https://example.com/videos/breathing/box.mp4',
    category: 'breathing',
    instructor: 'Yoga Eğitmeni Seda Öz',
    level: 'beginner',
    tags: ['nefes', 'kutu', 'stres'],
    views: 28400,
    rating: 4.8,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-05-10',
  },
  {
    id: 'breath_3',
    title: 'Acil Rahatlama Nefesi',
    description: 'Sigara isteği geldiğinde anında uygulayabileceğiniz teknik.',
    duration: 180,
    thumbnailUrl: 'https://picsum.photos/seed/breath3/400/225',
    videoUrl: 'https://example.com/videos/breathing/emergency.mp4',
    category: 'breathing',
    instructor: 'Yoga Eğitmeni Seda Öz',
    level: 'beginner',
    tags: ['nefes', 'acil', 'kriz'],
    views: 41200,
    rating: 4.9,
    isFeatured: true,
    isNew: true,
    createdAt: '2024-10-28',
  },

  // Meditasyon Videoları
  {
    id: 'med_1',
    title: 'Sabah Meditasyonu',
    description: 'Güne pozitif enerji ile başlamak için 10 dakikalık meditasyon.',
    duration: 600,
    thumbnailUrl: 'https://picsum.photos/seed/med1/400/225',
    videoUrl: 'https://example.com/videos/meditation/morning.mp4',
    category: 'meditation',
    instructor: 'Meditasyon Uzmanı Deniz Su',
    level: 'beginner',
    tags: ['sabah', 'meditasyon', 'enerji'],
    views: 45600,
    rating: 4.9,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-02-20',
  },
  {
    id: 'med_2',
    title: 'Sigara İsteğini Yönetme Meditasyonu',
    description: 'Özel olarak sigara bırakanlar için tasarlanmış meditasyon.',
    duration: 900,
    thumbnailUrl: 'https://picsum.photos/seed/med2/400/225',
    videoUrl: 'https://example.com/videos/meditation/craving.mp4',
    category: 'meditation',
    instructor: 'Meditasyon Uzmanı Deniz Su',
    level: 'beginner',
    tags: ['meditasyon', 'istek', 'kontrol'],
    views: 38900,
    rating: 4.9,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-03-15',
  },
  {
    id: 'med_3',
    title: 'Uyku Öncesi Rahatlama',
    description: 'Derin ve kaliteli uyku için rahatlama meditasyonu.',
    duration: 1200,
    thumbnailUrl: 'https://picsum.photos/seed/med3/400/225',
    videoUrl: 'https://example.com/videos/meditation/sleep.mp4',
    category: 'meditation',
    instructor: 'Meditasyon Uzmanı Deniz Su',
    level: 'beginner',
    tags: ['uyku', 'rahatlama', 'gece'],
    views: 52300,
    rating: 4.9,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-04-10',
  },

  // Egzersiz Videoları
  {
    id: 'ex_1',
    title: '10 Dakikada Stres Atma',
    description: 'Evde yapabileceğiniz basit ama etkili egzersizler.',
    duration: 600,
    thumbnailUrl: 'https://picsum.photos/seed/ex1/400/225',
    videoUrl: 'https://example.com/videos/exercise/stress-relief.mp4',
    category: 'exercise',
    instructor: 'Fitness Eğitmeni Kaan Yılmaz',
    level: 'beginner',
    tags: ['egzersiz', 'stres', 'ev'],
    views: 19800,
    rating: 4.7,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-05-25',
  },
  {
    id: 'ex_2',
    title: 'Sabah Enerjisi Egzersizleri',
    description: 'Güne enerjik başlamak için 15 dakikalık antrenman.',
    duration: 900,
    thumbnailUrl: 'https://picsum.photos/seed/ex2/400/225',
    videoUrl: 'https://example.com/videos/exercise/morning.mp4',
    category: 'exercise',
    instructor: 'Fitness Eğitmeni Kaan Yılmaz',
    level: 'intermediate',
    tags: ['sabah', 'enerji', 'antrenman'],
    views: 24600,
    rating: 4.8,
    isFeatured: true,
    isNew: true,
    createdAt: '2024-11-05',
  },

  // Beslenme Videoları
  {
    id: 'nut_1',
    title: 'Sigara Bırakırken Beslenme',
    description: 'Kilo almadan sağlıklı beslenmek için ipuçları.',
    duration: 540,
    thumbnailUrl: 'https://picsum.photos/seed/nut1/400/225',
    videoUrl: 'https://example.com/videos/nutrition/basics.mp4',
    category: 'nutrition',
    instructor: 'Diyetisyen Gül Çiçek',
    level: 'beginner',
    tags: ['beslenme', 'kilo', 'sağlık'],
    views: 16700,
    rating: 4.6,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-06-10',
  },
  {
    id: 'nut_2',
    title: 'Detoks Smoothie Tarifleri',
    description: 'Vücudunuzu temizlemek için 5 harika smoothie tarifi.',
    duration: 480,
    thumbnailUrl: 'https://picsum.photos/seed/nut2/400/225',
    videoUrl: 'https://example.com/videos/nutrition/smoothies.mp4',
    category: 'nutrition',
    instructor: 'Diyetisyen Gül Çiçek',
    level: 'beginner',
    tags: ['detoks', 'smoothie', 'tarif'],
    views: 21400,
    rating: 4.8,
    isFeatured: true,
    isNew: true,
    createdAt: '2024-10-20',
  },

  // Psikoloji Videoları
  {
    id: 'psy_1',
    title: 'Bağımlılığın Psikolojisi',
    description: 'Bağımlılık davranışını anlamak ve yönetmek.',
    duration: 840,
    thumbnailUrl: 'https://picsum.photos/seed/psy1/400/225',
    videoUrl: 'https://example.com/videos/psychology/addiction.mp4',
    category: 'psychology',
    instructor: 'Psikolog Dr. Selma Ak',
    level: 'intermediate',
    tags: ['psikoloji', 'bağımlılık', 'davranış'],
    views: 14300,
    rating: 4.7,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-07-05',
  },
  {
    id: 'psy_2',
    title: 'Tetikleyicileri Tanıma',
    description: 'Sigara içme isteğini tetikleyen durumları belirleme.',
    duration: 660,
    thumbnailUrl: 'https://picsum.photos/seed/psy2/400/225',
    videoUrl: 'https://example.com/videos/psychology/triggers.mp4',
    category: 'psychology',
    instructor: 'Psikolog Dr. Selma Ak',
    level: 'intermediate',
    tags: ['tetikleyici', 'farkındalık', 'analiz'],
    views: 17800,
    rating: 4.8,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-08-12',
  },

  // Başarı Hikayeleri
  {
    id: 'story_1',
    title: 'Ahmet\'in 1 Yıllık Yolculuğu',
    description: '25 yıllık sigara bağımlılığını nasıl yendi?',
    duration: 720,
    thumbnailUrl: 'https://picsum.photos/seed/story1/400/225',
    videoUrl: 'https://example.com/videos/stories/ahmet.mp4',
    category: 'success_stories',
    instructor: 'Ahmet Kara',
    level: 'beginner',
    tags: ['hikaye', 'başarı', 'ilham'],
    views: 32100,
    rating: 4.9,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-04-25',
  },
  {
    id: 'story_2',
    title: 'Ayşe: Hamilelikte Bıraktım',
    description: 'Annelik motivasyonu ile sigara bırakma hikayesi.',
    duration: 600,
    thumbnailUrl: 'https://picsum.photos/seed/story2/400/225',
    videoUrl: 'https://example.com/videos/stories/ayse.mp4',
    category: 'success_stories',
    instructor: 'Ayşe Yıldırım',
    level: 'beginner',
    tags: ['hamilelik', 'annelik', 'motivasyon'],
    views: 28700,
    rating: 4.9,
    isFeatured: false,
    isNew: true,
    createdAt: '2024-11-10',
  },

  // Uzman Görüşleri
  {
    id: 'expert_1',
    title: 'Kardiyolog Uyarıyor',
    description: 'Kalp sağlığı ve sigara ilişkisi hakkında uzman görüşü.',
    duration: 780,
    thumbnailUrl: 'https://picsum.photos/seed/expert1/400/225',
    videoUrl: 'https://example.com/videos/expert/cardio.mp4',
    category: 'expert_talks',
    instructor: 'Kardiyolog Prof. Dr. Can Özkan',
    level: 'beginner',
    tags: ['uzman', 'kalp', 'sağlık'],
    views: 19200,
    rating: 4.8,
    isFeatured: true,
    isNew: false,
    createdAt: '2024-09-15',
  },
  {
    id: 'expert_2',
    title: 'Psikiyatrist ile Söyleşi',
    description: 'Bağımlılık tedavisi ve ilaç desteği hakkında bilgiler.',
    duration: 960,
    thumbnailUrl: 'https://picsum.photos/seed/expert2/400/225',
    videoUrl: 'https://example.com/videos/expert/psychiatry.mp4',
    category: 'expert_talks',
    instructor: 'Psikiyatrist Dr. Leyla Şen',
    level: 'intermediate',
    tags: ['psikiyatri', 'tedavi', 'ilaç'],
    views: 11500,
    rating: 4.7,
    isFeatured: false,
    isNew: false,
    createdAt: '2024-07-20',
  },
];

// Yardımcı fonksiyonlar
export const getVideosByCategory = (category: VideoCategory): Video[] => {
  return VIDEOS.filter(v => v.category === category);
};

export const getFeaturedVideos = (): Video[] => {
  return VIDEOS.filter(v => v.isFeatured);
};

export const getNewVideos = (): Video[] => {
  return VIDEOS.filter(v => v.isNew);
};

export const getPopularVideos = (limit: number = 10): Video[] => {
  return [...VIDEOS].sort((a, b) => b.views - a.views).slice(0, limit);
};

export const getTopRatedVideos = (limit: number = 10): Video[] => {
  return [...VIDEOS].sort((a, b) => b.rating - a.rating).slice(0, limit);
};

export const searchVideos = (query: string): Video[] => {
  const lowerQuery = query.toLowerCase();
  return VIDEOS.filter(v =>
    v.title.toLowerCase().includes(lowerQuery) ||
    v.description.toLowerCase().includes(lowerQuery) ||
    v.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};







