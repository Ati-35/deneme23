// Profesyonel Destek - Uzman Danışmanlık
// Psikolog ve terapist randevu sistemi, video görüşme entegrasyonu

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Expert {
  id: string;
  name: string;
  title: string;
  specialty: string[];
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  languages: string[];
  availability: string;
  pricePerSession: number;
  bio: string;
  isOnline: boolean;
}

interface Appointment {
  id: string;
  expertId: string;
  expertName: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface SupportResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  actionType: 'link' | 'phone' | 'internal';
}

// Örnek uzman verileri
const EXPERTS: Expert[] = [
  {
    id: '1',
    name: 'Dr. Ayşe Yılmaz',
    title: 'Klinik Psikolog',
    specialty: ['Bağımlılık Terapisi', 'CBT', 'Stres Yönetimi'],
    avatar: 'A',
    rating: 4.9,
    reviewCount: 156,
    experience: 12,
    languages: ['Türkçe', 'İngilizce'],
    availability: 'Bugün müsait',
    pricePerSession: 800,
    bio: 'Sigara bağımlılığı ve davranış değişikliği konusunda uzman. 12 yıllık deneyim.',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Dr. Mehmet Kaya',
    title: 'Psikiyatrist',
    specialty: ['Bağımlılık Psikiyatrisi', 'İlaç Tedavisi'],
    avatar: 'M',
    rating: 4.8,
    reviewCount: 234,
    experience: 15,
    languages: ['Türkçe'],
    availability: 'Yarın müsait',
    pricePerSession: 1200,
    bio: 'Nikotin bağımlılığı tedavisinde ilaç ve psikoterapi kombinasyonu uzmanı.',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Zeynep Demir',
    title: 'Psikolojik Danışman',
    specialty: ['Motivasyonel Görüşme', 'Grup Terapisi'],
    avatar: 'Z',
    rating: 4.7,
    reviewCount: 89,
    experience: 8,
    languages: ['Türkçe', 'Almanca'],
    availability: 'Bu hafta müsait',
    pricePerSession: 500,
    bio: 'Sigara bırakma grupları ve bireysel danışmanlık deneyimi.',
    isOnline: true,
  },
];

// Destek kaynakları
const SUPPORT_RESOURCES: SupportResource[] = [
  {
    id: '1',
    title: 'ALO 171 Sigara Bırakma Hattı',
    description: 'Ücretsiz 7/24 destek hattı',
    icon: 'call',
    color: '#10B981',
    action: '171',
    actionType: 'phone',
  },
  {
    id: '2',
    title: 'Sağlık Bakanlığı Danışma',
    description: 'Online randevu ve bilgi',
    icon: 'globe',
    color: '#3B82F6',
    action: 'https://sigarabirakma.saglik.gov.tr',
    actionType: 'link',
  },
  {
    id: '3',
    title: 'Topluluk Desteği',
    description: 'Deneyimlerini paylaş',
    icon: 'people',
    color: '#8B5CF6',
    action: 'community',
    actionType: 'internal',
  },
  {
    id: '4',
    title: 'Acil Kriz Desteği',
    description: 'Anında yardım al',
    icon: 'alert-circle',
    color: '#EF4444',
    action: 'sos',
    actionType: 'internal',
  },
];

export default function ExpertConsultationScreen() {
  const [selectedTab, setSelectedTab] = useState<'experts' | 'appointments' | 'resources'>('experts');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'video' | 'phone' | 'chat'>('video');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Örnek randevular
  useEffect(() => {
    setAppointments([
      {
        id: '1',
        expertId: '1',
        expertName: 'Dr. Ayşe Yılmaz',
        date: '2024-12-01',
        time: '14:00',
        type: 'video',
        status: 'upcoming',
        notes: 'İlk görüşme - değerlendirme',
      },
    ]);
  }, []);

  const handleResourceAction = (resource: SupportResource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (resource.actionType) {
      case 'phone':
        Linking.openURL(`tel:${resource.action}`);
        break;
      case 'link':
        Linking.openURL(resource.action);
        break;
      case 'internal':
        if (resource.action === 'community') {
          router.push('/(tabs)/community');
        } else if (resource.action === 'sos') {
          router.push('/sos');
        }
        break;
    }
  };

  const bookAppointment = () => {
    if (!selectedExpert || !selectedDate || !selectedTime) {
      Alert.alert('Hata', 'Lütfen tarih ve saat seçin.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      date: selectedDate,
      time: selectedTime,
      type: sessionType,
      status: 'upcoming',
    };

    setAppointments(prev => [...prev, newAppointment]);
    setShowBookingModal(false);
    setSelectedExpert(null);
    setSelectedDate('');
    setSelectedTime('');

    Alert.alert(
      'Randevu Alındı!',
      `${selectedExpert.name} ile ${selectedDate} tarihinde saat ${selectedTime}'de randevunuz oluşturuldu.`,
      [{ text: 'Tamam' }]
    );
  };

  const openBookingModal = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowBookingModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderExpertCard = (expert: Expert) => (
    <TouchableOpacity
      key={expert.id}
      style={styles.expertCard}
      onPress={() => openBookingModal(expert)}
    >
      <View style={styles.expertHeader}>
        <View style={[styles.expertAvatar, expert.isOnline && styles.expertAvatarOnline]}>
          <Text style={styles.expertAvatarText}>{expert.avatar}</Text>
          {expert.isOnline && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.expertInfo}>
          <Text style={styles.expertName}>{expert.name}</Text>
          <Text style={styles.expertTitle}>{expert.title}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{expert.rating}</Text>
            <Text style={styles.reviewCount}>({expert.reviewCount} değerlendirme)</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>₺{expert.pricePerSession}</Text>
          <Text style={styles.priceLabel}>/ seans</Text>
        </View>
      </View>

      <View style={styles.expertTags}>
        {expert.specialty.slice(0, 2).map((spec, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{spec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.expertFooter}>
        <View style={styles.expertStat}>
          <Ionicons name="briefcase" size={14} color={Colors.textSecondary} />
          <Text style={styles.expertStatText}>{expert.experience} yıl deneyim</Text>
        </View>
        <View style={styles.availabilityBadge}>
          <Ionicons name="time" size={12} color={Colors.success} />
          <Text style={styles.availabilityText}>{expert.availability}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => openBookingModal(expert)}
      >
        <Text style={styles.bookButtonText}>Randevu Al</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={[
          styles.appointmentStatus,
          { backgroundColor: appointment.status === 'upcoming' ? Colors.success + '20' : Colors.textMuted + '20' }
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: appointment.status === 'upcoming' ? Colors.success : Colors.textMuted }
          ]} />
          <Text style={[
            styles.statusText,
            { color: appointment.status === 'upcoming' ? Colors.success : Colors.textMuted }
          ]}>
            {appointment.status === 'upcoming' ? 'Yaklaşan' : 'Tamamlandı'}
          </Text>
        </View>
        <View style={styles.sessionTypeBadge}>
          <Ionicons 
            name={appointment.type === 'video' ? 'videocam' : appointment.type === 'phone' ? 'call' : 'chatbubble'} 
            size={14} 
            color={Colors.primary} 
          />
        </View>
      </View>

      <Text style={styles.appointmentExpert}>{appointment.expertName}</Text>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.appointmentDetail}>
          <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.appointmentDetailText}>
            {new Date(appointment.date).toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
        <View style={styles.appointmentDetail}>
          <Ionicons name="time" size={16} color={Colors.textSecondary} />
          <Text style={styles.appointmentDetailText}>{appointment.time}</Text>
        </View>
      </View>

      {appointment.notes && (
        <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
      )}

      <View style={styles.appointmentActions}>
        {appointment.status === 'upcoming' && (
          <>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="videocam" size={18} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Katıl</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
              <Ionicons name="create" size={18} color={Colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: Colors.textSecondary }]}>Değiştir</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>👨‍⚕️ Uzman Desteği</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity 
          style={styles.emergencyBanner}
          onPress={() => Linking.openURL('tel:171')}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.emergencyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="call" size={24} color="#fff" />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>ALO 171 - Sigara Bırakma Hattı</Text>
              <Text style={styles.emergencySubtitle}>Ücretsiz 7/24 destek için tıklayın</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {[
            { id: 'experts', label: 'Uzmanlar', icon: 'people' },
            { id: 'appointments', label: 'Randevularım', icon: 'calendar' },
            { id: 'resources', label: 'Kaynaklar', icon: 'book' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
              onPress={() => setSelectedTab(tab.id as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={selectedTab === tab.id ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {selectedTab === 'experts' && (
          <View>
            <Text style={styles.sectionTitle}>Onaylı Uzmanlar</Text>
            {EXPERTS.map(renderExpertCard)}
          </View>
        )}

        {selectedTab === 'appointments' && (
          <View>
            <Text style={styles.sectionTitle}>Randevularım</Text>
            {appointments.length > 0 ? (
              appointments.map(renderAppointmentCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Henüz randevunuz yok</Text>
                <Text style={styles.emptySubtext}>
                  Uzmanlar sekmesinden randevu alabilirsiniz
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'resources' && (
          <View>
            <Text style={styles.sectionTitle}>Destek Kaynakları</Text>
            {SUPPORT_RESOURCES.map(resource => (
              <TouchableOpacity
                key={resource.id}
                style={styles.resourceCard}
                onPress={() => handleResourceAction(resource)}
              >
                <View style={[styles.resourceIcon, { backgroundColor: resource.color + '20' }]}>
                  <Ionicons name={resource.icon as any} size={24} color={resource.color} />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceDescription}>{resource.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Randevu Al</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {selectedExpert && (
              <>
                <View style={styles.selectedExpert}>
                  <View style={styles.expertAvatar}>
                    <Text style={styles.expertAvatarText}>{selectedExpert.avatar}</Text>
                  </View>
                  <View>
                    <Text style={styles.selectedExpertName}>{selectedExpert.name}</Text>
                    <Text style={styles.selectedExpertTitle}>{selectedExpert.title}</Text>
                  </View>
                </View>

                <Text style={styles.modalLabel}>Seans Türü</Text>
                <View style={styles.sessionTypes}>
                  {[
                    { id: 'video', icon: 'videocam', label: 'Video' },
                    { id: 'phone', icon: 'call', label: 'Telefon' },
                    { id: 'chat', icon: 'chatbubble', label: 'Mesaj' },
                  ].map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.sessionType,
                        sessionType === type.id && styles.sessionTypeActive,
                      ]}
                      onPress={() => setSessionType(type.id as any)}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={sessionType === type.id ? Colors.primary : Colors.textSecondary}
                      />
                      <Text style={[
                        styles.sessionTypeText,
                        sessionType === type.id && { color: Colors.primary },
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.modalLabel}>Tarih</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="YYYY-AA-GG"
                  placeholderTextColor={Colors.textMuted}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                />

                <Text style={styles.modalLabel}>Saat</Text>
                <View style={styles.timeSlots}>
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.timeSlotActive,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        selectedTime === time && { color: '#fff' },
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Seans Ücreti</Text>
                  <Text style={styles.priceValue}>₺{selectedExpert.pricePerSession}</Text>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={bookAppointment}>
                  <Text style={styles.confirmButtonText}>Randevuyu Onayla</Text>
                </TouchableOpacity>
              </>
            )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
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
  placeholder: {
    width: 40,
  },
  emergencyBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  emergencySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  expertCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expertHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  expertAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expertAvatarOnline: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  expertAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  expertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  expertTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  expertTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  expertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expertStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expertStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  availabilityText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  appointmentCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentExpert: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  appointmentNotes: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.backgroundLight,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  resourceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  selectedExpert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  selectedExpertName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedExpertTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  sessionTypes: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  sessionType: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  sessionTypeActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSlotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});




