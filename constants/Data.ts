// Sigara Bırakma Verileri

export interface HealthMilestone {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface EducationVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  videoUrl: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredDays: number;
  color: string;
}

// Sağlık İyileşme Zaman Çizelgesi
export const healthMilestones: HealthMilestone[] = [
  {
    id: '1',
    time: '20 dakika',
    title: 'Kalp Atışı Normalleşir',
    description: 'Kalp atış hızınız ve kan basıncınız düşmeye başlar.',
    icon: 'heart',
    color: '#EF4444',
  },
  {
    id: '2',
    time: '12 saat',
    title: 'Karbonmonoksit Düşer',
    description: 'Kanınızdaki karbonmonoksit seviyesi normale döner.',
    icon: 'wind',
    color: '#06B6D4',
  },
  {
    id: '3',
    time: '2-12 hafta',
    title: 'Dolaşım İyileşir',
    description: 'Kan dolaşımınız iyileşir ve akciğer fonksiyonunuz artar.',
    icon: 'activity',
    color: '#10B981',
  },
  {
    id: '4',
    time: '1-9 ay',
    title: 'Öksürük Azalır',
    description: 'Öksürük ve nefes darlığı azalır.',
    icon: 'lungs',
    color: '#3B82F6',
  },
  {
    id: '5',
    time: '1 yıl',
    title: 'Kalp Hastalığı Riski Yarıya İner',
    description: 'Koroner kalp hastalığı riskiniz sigara içenlere göre yarıya düşer.',
    icon: 'heart-pulse',
    color: '#F59E0B',
  },
  {
    id: '6',
    time: '5-15 yıl',
    title: 'İnme Riski Düşer',
    description: 'İnme riskiniz sigara içmeyenlerle aynı seviyeye gelir.',
    icon: 'brain',
    color: '#8B5CF6',
  },
  {
    id: '7',
    time: '10 yıl',
    title: 'Akciğer Kanseri Riski Yarıya İner',
    description: 'Akciğer kanserinden ölüm riskiniz sigara içenlere göre yarıya düşer.',
    icon: 'shield-check',
    color: '#10B981',
  },
  {
    id: '8',
    time: '15 yıl',
    title: 'Kalp Hastalığı Riski Normale Döner',
    description: 'Koroner kalp hastalığı riskiniz hiç sigara içmemiş biriyle aynı olur.',
    icon: 'trophy',
    color: '#FFD700',
  },
];

// Eğitim Videoları
export const educationVideos: EducationVideo[] = [
  {
    id: '1',
    title: 'Sigarayı Neden Bırakmalısınız?',
    duration: '8:45',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    category: 'Başlangıç',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
  {
    id: '2',
    title: 'Nikotin Bağımlılığını Anlamak',
    duration: '12:30',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400',
    category: 'Bilgi',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
  {
    id: '3',
    title: 'İlk Hafta Nasıl Geçer?',
    duration: '10:15',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    category: 'Rehber',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
  {
    id: '4',
    title: 'Stresle Başa Çıkma Teknikleri',
    duration: '15:00',
    thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
    category: 'Teknikler',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
  {
    id: '5',
    title: 'Nefes Egzersizleri',
    duration: '7:20',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    category: 'Egzersiz',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
  {
    id: '6',
    title: 'Motivasyonunuzu Koruyun',
    duration: '9:45',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
    category: 'Motivasyon',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  },
];

// Başarı Rozetleri
export const achievements: Achievement[] = [
  {
    id: '1',
    title: 'İlk Adım',
    description: '1 gün sigarasız',
    icon: 'star',
    requiredDays: 1,
    color: '#CD7F32',
  },
  {
    id: '2',
    title: '3 Gün Savaşçısı',
    description: '3 gün sigarasız',
    icon: 'flash',
    requiredDays: 3,
    color: '#F59E0B',
  },
  {
    id: '3',
    title: 'Haftalık Kahraman',
    description: '7 gün sigarasız',
    icon: 'medal',
    requiredDays: 7,
    color: '#C0C0C0',
  },
  {
    id: '4',
    title: '2 Hafta Ustası',
    description: '14 gün sigarasız',
    icon: 'ribbon',
    requiredDays: 14,
    color: '#3B82F6',
  },
  {
    id: '5',
    title: 'Aylık Savaşçı',
    description: '30 gün sigarasız',
    icon: 'trophy',
    requiredDays: 30,
    color: '#FFD700',
  },
  {
    id: '6',
    title: 'Çeyrek Yıl',
    description: '90 gün sigarasız',
    icon: 'shield',
    requiredDays: 90,
    color: '#EC4899',
  },
  {
    id: '7',
    title: '100 Gün Efsanesi',
    description: '100 gün sigarasız',
    icon: 'crown',
    requiredDays: 100,
    color: '#8B5CF6',
  },
  {
    id: '8',
    title: 'Yarım Yıl Kralı',
    description: '180 gün sigarasız',
    icon: 'diamond',
    requiredDays: 180,
    color: '#06B6D4',
  },
  {
    id: '9',
    title: 'Yıllık Şampiyon',
    description: '365 gün sigarasız',
    icon: 'planet',
    requiredDays: 365,
    color: '#10B981',
  },
  {
    id: '10',
    title: 'Efsane',
    description: '2 yıl sigarasız',
    icon: 'rocket',
    requiredDays: 730,
    color: '#EF4444',
  },
];

// Motivasyon Sözleri
export const motivationalQuotes = [
  {
    quote: "Her gün sigara içmeden geçirdiğin bir gün, sağlığına yaptığın bir yatırımdır.",
    author: "Anonim"
  },
  {
    quote: "Bırakmak için en iyi zaman dündü. İkinci en iyi zaman bugün.",
    author: "Çin Atasözü"
  },
  {
    quote: "Başarısızlık, sadece bir sonraki denemeye giden yoldur.",
    author: "Thomas Edison"
  },
  {
    quote: "Sen düşündüğünden çok daha güçlüsün.",
    author: "Anonim"
  },
  {
    quote: "Her ustanın bir zamanlar çaylak olduğunu unutma.",
    author: "Anonim"
  },
  {
    quote: "Bugün yaptığın seçimler, yarının sağlığını belirler.",
    author: "Anonim"
  },
  {
    quote: "Nikotin bağımlılığı geçici, özgürlük kalıcıdır.",
    author: "Anonim"
  },
  {
    quote: "Her sigara isteği atlattığında, karakterin güçleniyor.",
    author: "Anonim"
  },
  {
    quote: "Akciğerlerin, sevdiklerin ve cüzdanın sana teşekkür ediyor.",
    author: "Anonim"
  },
  {
    quote: "Düşersen kalk, önemli olan devam etmek.",
    author: "Anonim"
  },
];

// Nefes Egzersizi Teknikleri
export const breathingTechniques = [
  {
    id: '1',
    name: '4-4-4 Kutusu',
    description: '4 saniye nefes al, 4 saniye tut, 4 saniye ver',
    inhale: 4,
    hold: 4,
    exhale: 4,
    rounds: 5,
  },
  {
    id: '2',
    name: '4-7-8 Rahatlama',
    description: '4 saniye nefes al, 7 saniye tut, 8 saniye ver',
    inhale: 4,
    hold: 7,
    exhale: 8,
    rounds: 4,
  },
  {
    id: '3',
    name: 'Derin Nefes',
    description: '5 saniye derin nefes al, 5 saniye yavaşça ver',
    inhale: 5,
    hold: 0,
    exhale: 5,
    rounds: 10,
  },
];

// Dikkat Dağıtma Aktiviteleri
export const distractionActivities = [
  { id: '1', title: 'Bir bardak su iç', icon: 'water', duration: '1 dk', category: 'hızlı' },
  { id: '2', title: 'Yürüyüşe çık', icon: 'walk', duration: '10 dk', category: 'fiziksel' },
  { id: '3', title: 'Sakız çiğne', icon: 'nutrition', duration: '5 dk', category: 'hızlı' },
  { id: '4', title: 'Bir arkadaşını ara', icon: 'call', duration: '10 dk', category: 'sosyal' },
  { id: '5', title: '10 şınav çek', icon: 'fitness', duration: '2 dk', category: 'fiziksel' },
  { id: '6', title: 'Duş al', icon: 'water-outline', duration: '10 dk', category: 'fiziksel' },
  { id: '7', title: 'Puzzle çöz', icon: 'extension-puzzle', duration: '15 dk', category: 'zihinsel' },
  { id: '8', title: 'Müzik dinle', icon: 'musical-notes', duration: '5 dk', category: 'rahatlama' },
  { id: '9', title: 'Meyve ye', icon: 'nutrition', duration: '5 dk', category: 'hızlı' },
  { id: '10', title: 'Dişlerini fırçala', icon: 'sparkles', duration: '3 dk', category: 'hızlı' },
];

// Topluluk Paylaşımları (Örnek)
export const communityPosts = [
  {
    id: '1',
    username: 'AhmetY',
    avatar: 'A',
    content: '30. günümü kutluyorum! 🎉 İlk hafta çok zordu ama şimdi kendimi harika hissediyorum.',
    likes: 45,
    comments: 12,
    time: '2 saat önce',
    daysSmokeFree: 30,
  },
  {
    id: '2',
    username: 'MerveCan',
    avatar: 'M',
    content: 'Sabahları kahvemi içerken en çok zorlanıyorum. Sizin önerileriniz nedir?',
    likes: 23,
    comments: 28,
    time: '5 saat önce',
    daysSmokeFree: 7,
  },
  {
    id: '3',
    username: 'EmreK',
    avatar: 'E',
    content: '100 gün! Asla başaramayacağımı düşünüyordum. Herkese cesaret veriyorum!',
    likes: 89,
    comments: 34,
    time: '1 gün önce',
    daysSmokeFree: 100,
  },
  {
    id: '4',
    username: 'ZeynepA',
    avatar: 'Z',
    content: 'Bugün ilk günüm. Çok heyecanlıyım ama aynı zamanda korkuyorum. Destek olur musunuz?',
    likes: 67,
    comments: 45,
    time: '30 dakika önce',
    daysSmokeFree: 1,
  },
];


