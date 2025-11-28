// Social Features & Challenges
// Arkadaşlar, meydan okumalar, grup desteği, liderlik tablosu

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  quitDate: string;
  daysSober: number;
  streak: number;
  level: number;
  isMentor: boolean;
  isAccountabilityPartner: boolean;
  lastActive: string;
  badges: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'breathing' | 'exercise' | 'meditation' | 'social' | 'milestone';
  icon: string;
  xpReward: number;
  startDate: string;
  endDate: string;
  progress: number;
  goal: number;
  isCompleted: boolean;
  participants: number;
  isGroupChallenge: boolean;
  groupId?: string;
}

export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  participants: Friend[];
  startDate: string;
  endDate: string;
  goal: number;
  currentProgress: number;
  xpReward: number;
  isPublic: boolean;
  maxParticipants: number;
  category: string;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  level: number;
  badge: string;
  isCurrentUser: boolean;
  change: 'up' | 'down' | 'same';
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isPrivate: boolean;
  createdAt: string;
  icon: string;
  lastActivity: string;
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  reactions: { emoji: string; count: number }[];
  isSupport: boolean;
}

// Storage Keys
const STORAGE_KEYS = {
  FRIENDS: '@social_friends',
  CHALLENGES: '@social_challenges',
  GROUPS: '@social_groups',
  MESSAGES: '@social_messages',
  LEADERBOARD: '@social_leaderboard',
};

// Sample Avatars
const AVATARS = ['🧑', '👩', '👨', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦳', '🧑‍🦲'];

// Sample Names (Turkish)
const SAMPLE_NAMES = [
  'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 'Zeynep', 
  'Ali', 'Emine', 'Hüseyin', 'Hatice', 'İbrahim', 'Elif',
  'Ömer', 'Merve', 'Yusuf', 'Selin', 'Oğuz', 'Deniz'
];

// Generate random friend
function generateRandomFriend(id: string): Friend {
  const daysOffset = Math.floor(Math.random() * 365);
  const quitDate = new Date();
  quitDate.setDate(quitDate.getDate() - daysOffset);
  
  return {
    id,
    name: SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)],
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    status: ['online', 'offline', 'away'][Math.floor(Math.random() * 3)] as any,
    quitDate: quitDate.toISOString(),
    daysSober: daysOffset,
    streak: Math.min(daysOffset, Math.floor(Math.random() * 100) + 1),
    level: Math.floor(Math.random() * 25) + 1,
    isMentor: Math.random() > 0.8,
    isAccountabilityPartner: Math.random() > 0.9,
    lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    badges: ['🏆', '⭐', '💪', '🔥'].slice(0, Math.floor(Math.random() * 4) + 1),
  };
}

// Friends Functions
export async function getFriends(): Promise<Friend[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting friends:', error);
  }
  
  // Generate sample friends for demo
  const sampleFriends = Array(10).fill(null).map((_, i) => generateRandomFriend(`friend_${i}`));
  await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(sampleFriends));
  return sampleFriends;
}

export async function addFriend(friend: Omit<Friend, 'id'>): Promise<Friend> {
  const friends = await getFriends();
  const newFriend: Friend = {
    ...friend,
    id: `friend_${Date.now()}`,
  };
  friends.push(newFriend);
  await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  return newFriend;
}

export async function removeFriend(friendId: string): Promise<void> {
  const friends = await getFriends();
  const filtered = friends.filter(f => f.id !== friendId);
  await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(filtered));
}

export async function setAccountabilityPartner(friendId: string): Promise<void> {
  const friends = await getFriends();
  const updated = friends.map(f => ({
    ...f,
    isAccountabilityPartner: f.id === friendId,
  }));
  await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(updated));
}

// Challenges Functions
export async function getChallenges(): Promise<Challenge[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting challenges:', error);
  }
  
  return getDefaultChallenges();
}

function getDefaultChallenges(): Challenge[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  return [
    // Daily Challenges
    {
      id: 'daily_1',
      title: 'Sabah Nefes Egzersizi',
      description: '5 dakika nefes egzersizi yap',
      type: 'daily',
      category: 'breathing',
      icon: '🌬️',
      xpReward: 30,
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      progress: 0,
      goal: 1,
      isCompleted: false,
      participants: Math.floor(Math.random() * 500) + 100,
      isGroupChallenge: false,
    },
    {
      id: 'daily_2',
      title: '10 Dakika Yürüyüş',
      description: 'Kısa bir yürüyüş yap',
      type: 'daily',
      category: 'exercise',
      icon: '🚶',
      xpReward: 25,
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      progress: 0,
      goal: 1,
      isCompleted: false,
      participants: Math.floor(Math.random() * 300) + 50,
      isGroupChallenge: false,
    },
    {
      id: 'daily_3',
      title: 'Günlük Yaz',
      description: 'Bugün nasıl hissediyorsun?',
      type: 'daily',
      category: 'social',
      icon: '📝',
      xpReward: 20,
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      progress: 0,
      goal: 1,
      isCompleted: false,
      participants: Math.floor(Math.random() * 400) + 200,
      isGroupChallenge: false,
    },
    // Weekly Challenges
    {
      id: 'weekly_1',
      title: 'Haftalık Meditasyon',
      description: '7 gün boyunca meditasyon yap',
      type: 'weekly',
      category: 'meditation',
      icon: '🧘',
      xpReward: 200,
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      progress: 0,
      goal: 7,
      isCompleted: false,
      participants: Math.floor(Math.random() * 200) + 50,
      isGroupChallenge: true,
    },
    {
      id: 'weekly_2',
      title: '50.000 Adım',
      description: 'Bu hafta 50.000 adım at',
      type: 'weekly',
      category: 'exercise',
      icon: '👟',
      xpReward: 250,
      startDate: now.toISOString(),
      endDate: nextWeek.toISOString(),
      progress: 0,
      goal: 50000,
      isCompleted: false,
      participants: Math.floor(Math.random() * 150) + 30,
      isGroupChallenge: true,
    },
    // Monthly Challenges
    {
      id: 'monthly_1',
      title: '30 Gün Sigarasız',
      description: 'Tam bir ay sigara içme!',
      type: 'monthly',
      category: 'milestone',
      icon: '🏆',
      xpReward: 1000,
      startDate: now.toISOString(),
      endDate: nextMonth.toISOString(),
      progress: 0,
      goal: 30,
      isCompleted: false,
      participants: Math.floor(Math.random() * 1000) + 500,
      isGroupChallenge: true,
    },
    // Special Challenges
    {
      id: 'special_1',
      title: 'Mentor Ol',
      description: 'Yeni başlayan birine yardım et',
      type: 'special',
      category: 'social',
      icon: '🎓',
      xpReward: 500,
      startDate: now.toISOString(),
      endDate: nextMonth.toISOString(),
      progress: 0,
      goal: 1,
      isCompleted: false,
      participants: Math.floor(Math.random() * 100) + 20,
      isGroupChallenge: false,
    },
  ];
}

export async function completeChallenge(challengeId: string): Promise<number> {
  const challenges = await getChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  
  if (!challenge || challenge.isCompleted) {
    return 0;
  }
  
  challenge.isCompleted = true;
  challenge.progress = challenge.goal;
  
  await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
  
  return challenge.xpReward;
}

export async function updateChallengeProgress(challengeId: string, progress: number): Promise<void> {
  const challenges = await getChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  
  if (challenge && !challenge.isCompleted) {
    challenge.progress = Math.min(progress, challenge.goal);
    if (challenge.progress >= challenge.goal) {
      challenge.isCompleted = true;
    }
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
}

// Leaderboard Functions
export async function getLeaderboard(type: 'streak' | 'level' | 'xp' = 'streak'): Promise<LeaderboardEntry[]> {
  // Generate sample leaderboard for demo
  const entries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < 50; i++) {
    const score = type === 'streak' 
      ? Math.floor(Math.random() * 365) + 1
      : type === 'level'
        ? Math.floor(Math.random() * 50) + 1
        : Math.floor(Math.random() * 10000) + 100;
    
    entries.push({
      rank: 0,
      userId: `user_${i}`,
      name: SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)],
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      score,
      streak: Math.floor(Math.random() * 365) + 1,
      level: Math.floor(Math.random() * 50) + 1,
      badge: ['🥇', '🥈', '🥉', '🏅', '⭐'][Math.min(i, 4)],
      isCurrentUser: i === Math.floor(Math.random() * 50),
      change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as any,
    });
  }
  
  // Sort by score
  entries.sort((a, b) => b.score - a.score);
  
  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return entries;
}

export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
  const leaderboard = await getLeaderboard();
  return leaderboard.find(e => e.isCurrentUser) || null;
}

// Support Groups
export async function getSupportGroups(): Promise<SupportGroup[]> {
  return [
    {
      id: 'group_1',
      name: 'Yeni Başlayanlar',
      description: 'Sigara bırakmaya yeni başlayanlar için destek grubu',
      memberCount: Math.floor(Math.random() * 500) + 100,
      category: 'Başlangıç',
      isPrivate: false,
      createdAt: new Date().toISOString(),
      icon: '🌱',
      lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    },
    {
      id: 'group_2',
      name: 'Uzun Yol Arkadaşları',
      description: '30+ gün sigarasız olanlar',
      memberCount: Math.floor(Math.random() * 300) + 50,
      category: 'İlerleme',
      isPrivate: false,
      createdAt: new Date().toISOString(),
      icon: '🏃',
      lastActivity: new Date(Date.now() - Math.random() * 7200000).toISOString(),
    },
    {
      id: 'group_3',
      name: 'Stres Yönetimi',
      description: 'Stresli anlarda destek grubu',
      memberCount: Math.floor(Math.random() * 400) + 150,
      category: 'Destek',
      isPrivate: false,
      createdAt: new Date().toISOString(),
      icon: '😌',
      lastActivity: new Date(Date.now() - Math.random() * 1800000).toISOString(),
    },
    {
      id: 'group_4',
      name: 'Mentorlar',
      description: 'Deneyimli kullanıcılar yeni başlayanlara yardım ediyor',
      memberCount: Math.floor(Math.random() * 100) + 20,
      category: 'Mentorluk',
      isPrivate: false,
      createdAt: new Date().toISOString(),
      icon: '🎓',
      lastActivity: new Date(Date.now() - Math.random() * 900000).toISOString(),
    },
  ];
}

// Support Messages
export async function getSupportMessages(groupId: string): Promise<SupportMessage[]> {
  const messages: SupportMessage[] = [];
  
  const sampleMessages = [
    'Bugün çok zor bir gün geçirdim ama dayanıyorum! 💪',
    'Herkese günaydın! 7. günümdeyim!',
    'Sigara isteği geldi ama nefes egzersizi yaptım, geçti!',
    'Bu topluluk harika, teşekkürler herkese! ❤️',
    'Aynen devam! Yapabilirsin!',
    'Ben de aynı durumdan geçtim, bir kaç dakika sonra geçecek güven bana.',
    'Sabah kahvesiyle sigara içmeden 10. günüm! ☕',
    'Motivasyonunuz için teşekkürler!',
  ];
  
  for (let i = 0; i < 20; i++) {
    messages.push({
      id: `msg_${i}`,
      userId: `user_${Math.floor(Math.random() * 100)}`,
      userName: SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)],
      userAvatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      reactions: [
        { emoji: '❤️', count: Math.floor(Math.random() * 20) },
        { emoji: '💪', count: Math.floor(Math.random() * 15) },
        { emoji: '👏', count: Math.floor(Math.random() * 10) },
      ],
      isSupport: Math.random() > 0.5,
    });
  }
  
  // Sort by timestamp
  messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return messages;
}

export async function sendSupportMessage(groupId: string, message: string): Promise<SupportMessage> {
  const newMessage: SupportMessage = {
    id: `msg_${Date.now()}`,
    userId: 'current_user',
    userName: 'Ben',
    userAvatar: '🧑',
    message,
    timestamp: new Date().toISOString(),
    reactions: [],
    isSupport: true,
  };
  
  // In a real app, this would send to a server
  return newMessage;
}

// Share Progress
export interface ShareableProgress {
  days: number;
  streak: number;
  savings: number;
  cigarettesAvoided: number;
  healthScore: number;
  level: number;
}

export function generateShareText(progress: ShareableProgress): string {
  return `🎉 ${progress.days} gündür sigarasız!

📊 İlerlemem:
🔥 ${progress.streak} günlük seri
💰 ₺${progress.savings.toLocaleString()} tasarruf
🚭 ${progress.cigarettesAvoided} sigara içilmedi
❤️ Sağlık skoru: ${progress.healthScore}%
⭐ Seviye ${progress.level}

#SigarayıBırak #SigarasızHayat #SağlıklıYaşam`;
}

export default {
  getFriends,
  addFriend,
  removeFriend,
  setAccountabilityPartner,
  getChallenges,
  completeChallenge,
  updateChallengeProgress,
  getLeaderboard,
  getUserRank,
  getSupportGroups,
  getSupportMessages,
  sendSupportMessage,
  generateShareText,
};




