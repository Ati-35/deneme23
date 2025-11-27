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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';

const { width } = Dimensions.get('window');

interface Supporter {
  id: string;
  name: string;
  avatar: string;
  relationship: string;
  color: string;
  isActive: boolean;
  lastSeen?: string;
  encouragements: number;
}

const supporters: Supporter[] = [
  {
    id: '1',
    name: 'Ayşe',
    avatar: 'A',
    relationship: 'Eş',
    color: Palette.error[400],
    isActive: true,
    encouragements: 45,
  },
  {
    id: '2',
    name: 'Mehmet',
    avatar: 'M',
    relationship: 'Kardeş',
    color: Palette.info[500],
    isActive: true,
    lastSeen: '5dk önce',
    encouragements: 23,
  },
  {
    id: '3',
    name: 'Zeynep',
    avatar: 'Z',
    relationship: 'Arkadaş',
    color: Palette.success[500],
    isActive: false,
    lastSeen: '2s önce',
    encouragements: 12,
  },
  {
    id: '4',
    name: 'Ali',
    avatar: 'L',
    relationship: 'Baba',
    color: Palette.accent[500],
    isActive: false,
    lastSeen: '1g önce',
    encouragements: 8,
  },
];

interface Encouragement {
  id: string;
  from: string;
  avatar: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'message' | 'milestone' | 'sos' | 'celebration';
}

const encouragements: Encouragement[] = [
  {
    id: '1',
    from: 'Ayşe',
    avatar: 'A',
    message: 'Bugün de çok güçlüsün! Seninle gurur duyuyorum ❤️',
    time: '10dk önce',
    isRead: false,
    type: 'message',
  },
  {
    id: '2',
    from: 'Mehmet',
    avatar: 'M',
    message: '7 günü tamamladın, harikasın! 🎉',
    time: '2s önce',
    isRead: true,
    type: 'milestone',
  },
  {
    id: '3',
    from: 'Zeynep',
    avatar: 'Z',
    message: 'Zor anlar geçici, sen kalıcısın! 💪',
    time: '5s önce',
    isRead: true,
    type: 'sos',
  },
  {
    id: '4',
    from: 'Ali',
    avatar: 'L',
    message: 'Oğlum, çok doğru bir karar verdin. Arkandayım!',
    time: '1g önce',
    isRead: true,
    type: 'message',
  },
];

export default function FamilySupportScreen() {
  const [activeTab, setActiveTab] = useState<'supporters' | 'messages' | 'invite'>('supporters');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showSOS, setShowSOS] = useState(false);
  
  const sosAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(sosAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSendSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowSOS(true);
    
    // Simüle edilmiş SOS gönderimi
    setTimeout(() => {
      setShowSOS(false);
      Alert.alert(
        'SOS Gönderildi! 🆘',
        'Destekçilerinize bildirim gönderildi. Yakında seninle iletişime geçecekler.',
        [{ text: 'Tamam' }]
      );
    }, 2000);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Davet Gönderildi! ✉️',
      `${inviteEmail} adresine davet gönderildi.`,
      [{ text: 'Tamam' }]
    );
    setInviteEmail('');
  };

  const getEncouragementIcon = (type: Encouragement['type']) => {
    switch (type) {
      case 'milestone': return 'trophy';
      case 'sos': return 'heart';
      case 'celebration': return 'sparkles';
      default: return 'chatbubble';
    }
  };

  const getEncouragementColor = (type: Encouragement['type']) => {
    switch (type) {
      case 'milestone': return Palette.accent[500];
      case 'sos': return Palette.error[500];
      case 'celebration': return Palette.purple[500];
      default: return Palette.primary[500];
    }
  };

  const renderSupporters = () => (
    <View style={styles.supportersContainer}>
      {/* SOS Button */}
      <Animated.View style={[styles.sosContainer, { transform: [{ scale: sosAnim }] }]}>
        <TouchableOpacity onPress={handleSendSOS} activeOpacity={0.8}>
          <LinearGradient
            colors={Gradients.error as [string, string]}
            style={styles.sosButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="alert-circle" size={32} color="#fff" />
            <Text style={styles.sosTitle}>Zor Anındayım</Text>
            <Text style={styles.sosSubtitle}>Destekçilerine haber gönder</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Supporters Grid */}
      <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Destekçilerin ({supporters.length})</Text>
      <View style={styles.supportersGrid}>
        {supporters.map((supporter) => (
          <ScalePressable
            key={supporter.id}
            style={styles.supporterCard}
            scaleValue={0.98}
          >
            <View style={styles.supporterHeader}>
              <View style={[
                styles.supporterAvatar,
                { backgroundColor: supporter.color }
              ]}>
                <Text style={styles.supporterAvatarText}>{supporter.avatar}</Text>
                {supporter.isActive && <View style={styles.activeIndicator} />}
              </View>
              <View style={styles.supporterInfo}>
                <Text style={styles.supporterName}>{supporter.name}</Text>
                <Text style={styles.supporterRelation}>{supporter.relationship}</Text>
              </View>
            </View>
            <View style={styles.supporterStats}>
              <View style={styles.supporterStat}>
                <Ionicons name="heart" size={16} color={Palette.error[400]} />
                <Text style={styles.supporterStatText}>{supporter.encouragements}</Text>
              </View>
              {supporter.lastSeen && (
                <Text style={styles.supporterLastSeen}>{supporter.lastSeen}</Text>
              )}
            </View>
          </ScalePressable>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <ScalePressable style={styles.quickActionCard}>
          <LinearGradient
            colors={Gradients.primary as [string, string]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Mesaj Gönder</Text>
          </LinearGradient>
        </ScalePressable>
        <ScalePressable style={styles.quickActionCard}>
          <LinearGradient
            colors={Gradients.accent as [string, string]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="share-social" size={24} color="#fff" />
            <Text style={styles.quickActionText}>İlerleme Paylaş</Text>
          </LinearGradient>
        </ScalePressable>
      </View>
    </View>
  );

  const renderMessages = () => (
    <View style={styles.messagesContainer}>
      {encouragements.map((item) => (
        <View 
          key={item.id} 
          style={[
            styles.messageCard,
            !item.isRead && styles.messageCardUnread
          ]}
        >
          <View style={styles.messageHeader}>
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{item.avatar}</Text>
            </View>
            <View style={styles.messageInfo}>
              <View style={styles.messageNameRow}>
                <Text style={styles.messageName}>{item.from}</Text>
                <View style={[
                  styles.messageTypeBadge,
                  { backgroundColor: withAlpha(getEncouragementColor(item.type), 0.15) }
                ]}>
                  <Ionicons 
                    name={getEncouragementIcon(item.type) as any} 
                    size={12} 
                    color={getEncouragementColor(item.type)}
                  />
                </View>
              </View>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.messageText}>{item.message}</Text>
          <View style={styles.messageActions}>
            <TouchableOpacity style={styles.messageAction}>
              <Ionicons name="heart-outline" size={20} color={SemanticColors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageAction}>
              <Ionicons name="chatbubble-outline" size={20} color={SemanticColors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderInvite = () => (
    <View style={styles.inviteContainer}>
      <View style={styles.inviteCard}>
        <Ionicons name="people-circle" size={64} color={Palette.primary[500]} />
        <Text style={styles.inviteTitle}>Destekçi Ekle</Text>
        <Text style={styles.inviteDescription}>
          Ailenizi veya arkadaşlarınızı ekleyerek sigara bırakma yolculuğunuzda destek alın.
        </Text>
        
        <View style={styles.inviteInputContainer}>
          <Ionicons name="mail" size={20} color={SemanticColors.text.tertiary} />
          <TextInput
            style={styles.inviteInput}
            placeholder="E-posta adresi"
            placeholderTextColor={SemanticColors.text.tertiary}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <ScalePressable style={styles.inviteButton} onPress={handleInvite}>
          <LinearGradient
            colors={Gradients.primary as [string, string]}
            style={styles.inviteButtonGradient}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Davet Gönder</Text>
          </LinearGradient>
        </ScalePressable>
      </View>

      <View style={styles.inviteOptions}>
        <Text style={styles.inviteOptionsTitle}>Veya link ile paylaş</Text>
        <View style={styles.shareButtons}>
          <TouchableOpacity style={[styles.shareButton, { backgroundColor: '#25D366' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareButton, { backgroundColor: '#1877F2' }]}>
            <Ionicons name="logo-facebook" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareButton, { backgroundColor: '#1DA1F2' }]}>
            <Ionicons name="logo-twitter" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareButton, { backgroundColor: SemanticColors.surface.elevated }]}>
            <Ionicons name="link" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>💡 Destekçilerin Faydaları</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
            <Text style={styles.benefitText}>Zor anlarda anında destek</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
            <Text style={styles.benefitText}>Başarılarınızı birlikte kutlayın</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
            <Text style={styles.benefitText}>Motivasyon mesajları alın</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
            <Text style={styles.benefitText}>İlerlemenizi paylaşın</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* SOS Overlay */}
      {showSOS && (
        <View style={styles.sosOverlay}>
          <View style={styles.sosOverlayContent}>
            <Animated.View style={[styles.sosOverlayIcon, { transform: [{ scale: sosAnim }] }]}>
              <Ionicons name="alert-circle" size={64} color={Palette.error[500]} />
            </Animated.View>
            <Text style={styles.sosOverlayText}>SOS Gönderiliyor...</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>👨‍👩‍👧 Destek Ağı</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={SemanticColors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={Gradients.purple as [string, string]}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{supporters.length}</Text>
              <Text style={styles.statLabel}>Destekçi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{encouragements.filter(e => !e.isRead).length}</Text>
              <Text style={styles.statLabel}>Yeni Mesaj</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{supporters.reduce((acc, s) => acc + s.encouragements, 0)}</Text>
              <Text style={styles.statLabel}>Teşvik</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['supporters', 'messages', 'invite'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons 
                name={
                  tab === 'supporters' ? 'people' : 
                  tab === 'messages' ? 'chatbubbles' : 'person-add'
                } 
                size={20} 
                color={activeTab === tab ? Palette.primary[500] : SemanticColors.text.tertiary}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'supporters' ? 'Destekçiler' : 
                 tab === 'messages' ? 'Mesajlar' : 'Davet Et'}
              </Text>
              {tab === 'messages' && encouragements.some(e => !e.isRead) && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {encouragements.filter(e => !e.isRead).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {activeTab === 'supporters' && renderSupporters()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'invite' && renderInvite()}

        <View style={{ height: 100 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
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
  statsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.primary,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.stat.large,
    color: '#fff',
  },
  statLabel: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
  },
  tabText: {
    ...Typography.caption.large,
    color: SemanticColors.text.tertiary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Palette.primary[500],
  },
  tabBadge: {
    backgroundColor: Palette.error[500],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tabBadgeText: {
    ...Typography.caption.small,
    color: '#fff',
    fontWeight: '700',
  },
  supportersContainer: {},
  sosContainer: {
    marginBottom: Spacing.lg,
  },
  sosButton: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.error,
  },
  sosTitle: {
    ...Typography.heading.h4,
    color: '#fff',
    marginTop: Spacing.sm,
  },
  sosSubtitle: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  supportersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  supporterCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  supporterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  supporterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  supporterAvatarText: {
    ...Typography.label.large,
    color: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.success[500],
    borderWidth: 2,
    borderColor: SemanticColors.surface.default,
  },
  supporterInfo: {
    flex: 1,
  },
  supporterName: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  supporterRelation: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  supporterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supporterStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  supporterStatText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
  },
  supporterLastSeen: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  quickActionGradient: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionText: {
    ...Typography.label.small,
    color: '#fff',
  },
  messagesContainer: {},
  messageCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  messageCardUnread: {
    borderColor: Palette.primary[500],
    backgroundColor: withAlpha(Palette.primary[500], 0.05),
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  messageAvatarText: {
    ...Typography.label.medium,
    color: '#fff',
  },
  messageInfo: {
    flex: 1,
  },
  messageNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  messageName: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  messageTypeBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTime: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.primary[500],
  },
  messageText: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  messageActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  messageAction: {
    padding: Spacing.xs,
  },
  inviteContainer: {},
  inviteCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  inviteTitle: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inviteDescription: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inviteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.background.tertiary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    width: '100%',
    marginBottom: Spacing.md,
  },
  inviteInput: {
    flex: 1,
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
  inviteButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  inviteButtonText: {
    ...Typography.label.large,
    color: '#fff',
  },
  inviteOptions: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  inviteOptionsTitle: {
    ...Typography.caption.large,
    color: SemanticColors.text.tertiary,
    marginBottom: Spacing.md,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsCard: {
    backgroundColor: withAlpha(Palette.primary[500], 0.1),
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: withAlpha(Palette.primary[500], 0.2),
  },
  benefitsTitle: {
    ...Typography.label.large,
    color: Palette.primary[500],
    marginBottom: Spacing.md,
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    ...Typography.body.medium,
    color: SemanticColors.text.secondary,
  },
  sosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  sosOverlayContent: {
    alignItems: 'center',
  },
  sosOverlayIcon: {
    marginBottom: Spacing.lg,
  },
  sosOverlayText: {
    ...Typography.heading.h3,
    color: '#fff',
  },
});

