// Expert Consultation System
// Uzman destek, online görüşme, randevu sistemi

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Expert {
  id: string;
  name: string;
  title: string;
  specialty: ExpertSpecialty;
  avatar: string;
  rating: number;
  reviewCount: number;
  bio: string;
  experience: number; // years
  languages: string[];
  availability: AvailabilitySlot[];
  price: number; // per session in TL
  isOnline: boolean;
  nextAvailable: string;
  tags: string[];
}

export type ExpertSpecialty = 
  | 'psychologist'
  | 'therapist'
  | 'counselor'
  | 'addiction_specialist'
  | 'health_coach'
  | 'nutritionist';

export interface AvailabilitySlot {
  day: string; // e.g., "Pazartesi"
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string; // e.g., "09:00"
  available: boolean;
}

export interface Appointment {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  rating?: number;
  review?: string;
  price: number;
  isPaid: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'system';
  isRead: boolean;
}

export interface Conversation {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  expertId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

// Storage Keys
const STORAGE_KEYS = {
  APPOINTMENTS: '@expert_appointments',
  CONVERSATIONS: '@expert_conversations',
  MESSAGES: '@expert_messages',
  FAVORITES: '@expert_favorites',
};

// Sample Experts
const SAMPLE_EXPERTS: Expert[] = [
  {
    id: 'expert_1',
    name: 'Dr. Ayşe Yılmaz',
    title: 'Klinik Psikolog',
    specialty: 'psychologist',
    avatar: '👩‍⚕️',
    rating: 4.9,
    reviewCount: 156,
    bio: 'Bağımlılık ve davranış değişikliği konusunda 15 yıllık deneyime sahibim. Sigara bırakma sürecinde bilişsel davranışçı terapi yöntemlerini kullanıyorum.',
    experience: 15,
    languages: ['Türkçe', 'İngilizce'],
    availability: generateAvailability(),
    price: 500,
    isOnline: true,
    nextAvailable: getNextAvailable(),
    tags: ['Bağımlılık', 'CBT', 'Stres Yönetimi'],
  },
  {
    id: 'expert_2',
    name: 'Mehmet Kaya',
    title: 'Bağımlılık Danışmanı',
    specialty: 'addiction_specialist',
    avatar: '👨‍💼',
    rating: 4.8,
    reviewCount: 203,
    bio: 'Kendim de eski bir sigara bağımlısıydım. 10 yıldır sigarasızım ve bu deneyimimi danışanlarımla paylaşıyorum.',
    experience: 10,
    languages: ['Türkçe'],
    availability: generateAvailability(),
    price: 350,
    isOnline: true,
    nextAvailable: getNextAvailable(),
    tags: ['Motivasyon', 'Destek Grubu', 'Kişisel Deneyim'],
  },
  {
    id: 'expert_3',
    name: 'Dr. Zeynep Demir',
    title: 'Göğüs Hastalıkları Uzmanı',
    specialty: 'health_coach',
    avatar: '👩‍⚕️',
    rating: 4.7,
    reviewCount: 89,
    bio: 'Sigara kullanımının akciğer sağlığı üzerindeki etkilerini ve bırakma sürecindeki fiziksel değişimleri açıklıyorum.',
    experience: 12,
    languages: ['Türkçe', 'İngilizce', 'Almanca'],
    availability: generateAvailability(),
    price: 600,
    isOnline: false,
    nextAvailable: getNextAvailable(),
    tags: ['Akciğer Sağlığı', 'Tıbbi Danışmanlık', 'Detoks'],
  },
  {
    id: 'expert_4',
    name: 'Can Özturk',
    title: 'Sağlık Koçu',
    specialty: 'health_coach',
    avatar: '🧑‍🦱',
    rating: 4.6,
    reviewCount: 124,
    bio: 'Bütünsel yaklaşımla sigara bırakma, beslenme ve egzersiz planları oluşturuyorum.',
    experience: 8,
    languages: ['Türkçe'],
    availability: generateAvailability(),
    price: 300,
    isOnline: true,
    nextAvailable: getNextAvailable(),
    tags: ['Sağlıklı Yaşam', 'Egzersiz', 'Beslenme'],
  },
  {
    id: 'expert_5',
    name: 'Dr. Elif Aksoy',
    title: 'Psikoterapist',
    specialty: 'therapist',
    avatar: '👩‍🏫',
    rating: 4.9,
    reviewCount: 178,
    bio: 'Sigara bağımlılığının psikolojik kökenlerini ele alıyorum. Bilinçaltı çalışması ve hipnoterapi uyguluyorum.',
    experience: 20,
    languages: ['Türkçe', 'İngilizce'],
    availability: generateAvailability(),
    price: 700,
    isOnline: true,
    nextAvailable: getNextAvailable(),
    tags: ['Hipnoterapi', 'Bilinçaltı', 'Derin Terapi'],
  },
];

// Helper functions
function generateAvailability(): AvailabilitySlot[] {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  
  return days.map(day => ({
    day,
    slots: times.map(time => ({
      time,
      available: Math.random() > 0.3,
    })),
  }));
}

function getNextAvailable(): string {
  const now = new Date();
  const hoursToAdd = Math.floor(Math.random() * 48) + 1;
  now.setHours(now.getHours() + hoursToAdd);
  return now.toISOString();
}

// Get All Experts
export async function getExperts(): Promise<Expert[]> {
  return SAMPLE_EXPERTS;
}

// Get Expert by ID
export async function getExpertById(expertId: string): Promise<Expert | null> {
  return SAMPLE_EXPERTS.find(e => e.id === expertId) || null;
}

// Get Experts by Specialty
export async function getExpertsBySpecialty(specialty: ExpertSpecialty): Promise<Expert[]> {
  return SAMPLE_EXPERTS.filter(e => e.specialty === specialty);
}

// Get Online Experts
export async function getOnlineExperts(): Promise<Expert[]> {
  return SAMPLE_EXPERTS.filter(e => e.isOnline);
}

// Search Experts
export async function searchExperts(query: string): Promise<Expert[]> {
  const lowerQuery = query.toLowerCase();
  return SAMPLE_EXPERTS.filter(e => 
    e.name.toLowerCase().includes(lowerQuery) ||
    e.title.toLowerCase().includes(lowerQuery) ||
    e.bio.toLowerCase().includes(lowerQuery) ||
    e.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// Appointments
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const appointments = await getAppointments();
  const now = new Date();
  
  return appointments
    .filter(a => new Date(a.date) >= now && a.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getPastAppointments(): Promise<Appointment[]> {
  const appointments = await getAppointments();
  const now = new Date();
  
  return appointments
    .filter(a => new Date(a.date) < now || a.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function bookAppointment(
  expertId: string,
  date: string,
  time: string,
  type: 'video' | 'audio' | 'chat'
): Promise<Appointment | null> {
  const expert = await getExpertById(expertId);
  if (!expert) return null;
  
  const appointment: Appointment = {
    id: `appointment_${Date.now()}`,
    expertId,
    expertName: expert.name,
    expertAvatar: expert.avatar,
    date,
    time,
    duration: 50,
    type,
    status: 'scheduled',
    price: expert.price,
    isPaid: false,
  };
  
  try {
    const appointments = await getAppointments();
    appointments.push(appointment);
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return appointment;
  } catch (error) {
    console.error('Error booking appointment:', error);
    return null;
  }
}

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  try {
    const appointments = await getAppointments();
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (appointment) {
      appointment.status = 'cancelled';
      await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return false;
  }
}

export async function rateAppointment(
  appointmentId: string,
  rating: number,
  review?: string
): Promise<boolean> {
  try {
    const appointments = await getAppointments();
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (appointment) {
      appointment.rating = rating;
      appointment.review = review;
      await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error rating appointment:', error);
    return false;
  }
}

// Conversations & Messages
export async function getConversations(): Promise<Conversation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    const allMessages: Message[] = data ? JSON.parse(data) : [];
    return allMessages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  type: 'text' | 'image' | 'voice' = 'text'
): Promise<Message> {
  const message: Message = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId: 'current_user',
    senderName: 'Ben',
    senderAvatar: '🧑',
    content,
    timestamp: new Date().toISOString(),
    type,
    isRead: true,
  };
  
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = data ? JSON.parse(data) : [];
    messages.push(message);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    
    // Update conversation
    const conversations = await getConversations();
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = content;
      conv.lastMessageTime = message.timestamp;
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function startConversation(expertId: string): Promise<Conversation | null> {
  const expert = await getExpertById(expertId);
  if (!expert) return null;
  
  const conversations = await getConversations();
  
  // Check if conversation already exists
  const existing = conversations.find(c => c.expertId === expertId);
  if (existing) return existing;
  
  const conversation: Conversation = {
    id: `conv_${Date.now()}`,
    expertId,
    expertName: expert.name,
    expertAvatar: expert.avatar,
    lastMessage: 'Merhaba! Size nasıl yardımcı olabilirim?',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    isActive: true,
  };
  
  try {
    conversations.push(conversation);
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: expertId,
      senderName: expert.name,
      senderAvatar: expert.avatar,
      content: 'Merhaba! Size nasıl yardımcı olabilirim?',
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
    };
    
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = data ? JSON.parse(data) : [];
    messages.push(welcomeMessage);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    
    return conversation;
  } catch (error) {
    console.error('Error starting conversation:', error);
    return null;
  }
}

// Favorites
export async function getFavoriteExperts(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

export async function toggleFavoriteExpert(expertId: string): Promise<boolean> {
  try {
    const favorites = await getFavoriteExperts();
    const index = favorites.indexOf(expertId);
    
    if (index === -1) {
      favorites.push(expertId);
    } else {
      favorites.splice(index, 1);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return index === -1;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

// Get Expert Reviews
export async function getExpertReviews(expertId: string): Promise<Review[]> {
  // Generate sample reviews
  const reviews: Review[] = [];
  const comments = [
    'Çok yardımcı oldu, teşekkürler!',
    'Profesyonel yaklaşımı sayesinde sigara bırakma sürecim çok daha kolay oldu.',
    'Harika bir deneyimdi, herkese tavsiye ederim.',
    'Anlayışlı ve sabırlı bir uzman.',
    'İlk seansdan sonra bile fark yarattı.',
    'Düzenli görüşmelerimiz çok faydalı oluyor.',
  ];
  
  for (let i = 0; i < 10; i++) {
    reviews.push({
      id: `review_${i}`,
      expertId,
      userId: `user_${i}`,
      userName: ['Ahmet', 'Ayşe', 'Mehmet', 'Fatma', 'Ali', 'Zeynep'][i % 6],
      rating: Math.floor(Math.random() * 2) + 4,
      comment: comments[Math.floor(Math.random() * comments.length)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: Math.floor(Math.random() * 20),
    });
  }
  
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Specialty Labels
export const SPECIALTY_LABELS: Record<ExpertSpecialty, { label: string; icon: string }> = {
  psychologist: { label: 'Psikolog', icon: '🧠' },
  therapist: { label: 'Psikoterapist', icon: '💭' },
  counselor: { label: 'Danışman', icon: '🤝' },
  addiction_specialist: { label: 'Bağımlılık Uzmanı', icon: '🎯' },
  health_coach: { label: 'Sağlık Koçu', icon: '💪' },
  nutritionist: { label: 'Beslenme Uzmanı', icon: '🥗' },
};

export default {
  getExperts,
  getExpertById,
  getExpertsBySpecialty,
  getOnlineExperts,
  searchExperts,
  getAppointments,
  getUpcomingAppointments,
  getPastAppointments,
  bookAppointment,
  cancelAppointment,
  rateAppointment,
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  getFavoriteExperts,
  toggleFavoriteExpert,
  getExpertReviews,
  SPECIALTY_LABELS,
};




