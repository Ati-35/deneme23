import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors, { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../../constants/DesignTokens';
import { achievements } from '../../constants/Data';
import { ScalePressable } from '../../components/interactions';
import { FadeIn } from '../../components/animations';

const { width } = Dimensions.get('window');

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  id: string;
  icon: IconName;
  label: string;
  route?: string;
  color?: string;
  badge?: string;
}

const quickActions: MenuItem[] = [
  { id: '1', icon: 'fitness', label: 'Detoks Takibi', route: '/detoxTracker', color: Palette.secondary[500] },
  { id: '2', icon: 'happy', label: 'Ruh Hali', route: '/moodTracker', color: Palette.accent[500] },
  { id: '3', icon: 'leaf', label: 'Meditasyon', route: '/meditation', color: Palette.success[500] },
  { id: '4', icon: 'people', label: 'Aile Desteği', route: '/familySupport', color: Palette.purple[500] },
];

const menuItems: MenuItem[] = [
  { id: '1', icon: 'trophy', label: 'Başarılar & Rozetler', route: '/gamification', badge: '3 yeni' },
  { id: '2', icon: 'wallet', label: 'Tasarruf Hedefleri', route: '/savings' },
  { id: '3', icon: 'book', label: 'Günlük', route: '/journal' },
  { id: '4', icon: 'podium', label: 'Sıralama', route: '/leaderboard' },
  { id: '5', icon: 'settings', label: 'Ayarlar', route: '/privacySettings' },
  { id: '6', icon: 'help-circle', label: 'Yardım & Destek' },
  { id: '7', icon: 'document-text', label: 'Gizlilik Politikası' },
  { id: '8', icon: 'information-circle', label: 'Hakkında' },
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const userData = {
    name: 'Kullanıcı',
    email: 'kullanici@email.com',
    quitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    cigarettesPerDay: 20,
    pricePerPack: 50,
    level: 5,
    xp: 950,
    nextLevelXp: 1200,
    streak: 7,
  };

  const daysSinceQuit = Math.floor(
    (Date.now() - userData.quitDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const earnedAchievements = achievements.filter(
    (a) => daysSinceQuit >= a.requiredDays
  );

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: userData.xp / userData.nextLevelXp,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  const showEditAlert = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Profil Düzenleme',
      'Bu özellik yakında eklenecek!',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const handleMenuPress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.route) {
      router.push(item.route as any);
    } else {
      showEditAlert();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>👤 Profil</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={showEditAlert}>
              <Ionicons name="settings-outline" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Profile Card */}
        <FadeIn delay={100}>
          <LinearGradient
            colors={Gradients.primaryVibrant as [string, string, ...string[]]}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative elements */}
            <View style={styles.profileDecor1} />
            <View style={styles.profileDecor2} />
            
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{userData.level}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={showEditAlert}>
                <Ionicons name="pencil" size={16} color={Palette.primary[500]} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            
            {/* XP Progress */}
            <View style={styles.xpContainer}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>Seviye {userData.level}</Text>
                <Text style={styles.xpText}>{userData.xp} / {userData.nextLevelXp} XP</Text>
              </View>
              <View style={styles.xpBar}>
                <Animated.View 
                  style={[
                    styles.xpFill,
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.profileStats}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{daysSinceQuit}</Text>
                <Text style={styles.profileStatLabel}>Gün Sigarasız</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{userData.streak} 🔥</Text>
                <Text style={styles.profileStatLabel}>Günlük Seri</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>₺{daysSinceQuit * userData.pricePerPack}</Text>
                <Text style={styles.profileStatLabel}>Tasarruf</Text>
              </View>
            </View>
          </LinearGradient>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={150}>
          <Text style={styles.sectionTitle}>🚀 Hızlı Erişim</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <ScalePressable
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[
                  styles.quickActionIcon,
                  { backgroundColor: withAlpha(action.color!, 0.15) }
                ]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* Smoking Info */}
        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>🚬 Sigara Bilgilerim</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon="calendar-outline"
              label="Bırakış Tarihi"
              value={userData.quitDate.toLocaleDateString('tr-TR')}
            />
            <InfoRow
              icon="flame-outline"
              label="Günlük Sigara"
              value={`${userData.cigarettesPerDay} adet`}
            />
            <InfoRow
              icon="cash-outline"
              label="Paket Fiyatı"
              value={`₺${userData.pricePerPack}`}
              isLast
            />
          </View>
        </FadeIn>

        {/* Badges Preview */}
        <FadeIn delay={250}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Rozetlerim</Text>
            <TouchableOpacity onPress={() => router.push('/gamification')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {achievements.slice(0, 5).map((achievement) => {
              const isEarned = daysSinceQuit >= achievement.requiredDays;
              return (
                <ScalePressable
                  key={achievement.id}
                  style={[styles.badgeCard, !isEarned && styles.badgeLocked]}
                  onPress={() => router.push('/gamification')}
                >
                  <View
                    style={[
                      styles.badgeIcon,
                      { backgroundColor: isEarned ? achievement.color + '30' : SemanticColors.background.tertiary },
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon as IconName}
                      size={28}
                      color={isEarned ? achievement.color : SemanticColors.text.tertiary}
                    />
                    {!isEarned && (
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={12} color={SemanticColors.text.tertiary} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.badgeTitle, !isEarned && styles.textMuted]}>
                    {achievement.title}
                  </Text>
                </ScalePressable>
              );
            })}
          </ScrollView>
        </FadeIn>

        {/* Settings */}
        <FadeIn delay={300}>
          <Text style={styles.sectionTitle}>⚙️ Hızlı Ayarlar</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon="notifications-outline"
              label="Bildirimler"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <SettingRow
              icon="moon-outline"
              label="Karanlık Mod"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <SettingRow
              icon="alarm-outline"
              label="Günlük Hatırlatıcı"
              value={dailyReminder}
              onValueChange={setDailyReminder}
              isLast
            />
          </View>
        </FadeIn>

        {/* Menu */}
        <FadeIn delay={350}>
          <Text style={styles.sectionTitle}>📋 Menü</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                onPress={() => handleMenuPress(item)}
                showBorder={index < menuItems.length - 1}
              />
            ))}
          </View>
        </FadeIn>

        {/* Logout Button */}
        <FadeIn delay={400}>
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color={Palette.error[500]} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </FadeIn>

        {/* Version */}
        <Text style={styles.version}>Sigara Bırak v2.0.0</Text>

        <View style={{ height: ComponentHeight.tabBar + 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: IconName;
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ icon, label, value, isLast }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={20} color={Palette.primary[500]} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface SettingRowProps {
  icon: IconName;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}

function SettingRow({ icon, label, value, onValueChange, isLast }: SettingRowProps) {
  return (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={20} color={Palette.primary[500]} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: SemanticColors.border.default, true: withAlpha(Palette.primary[500], 0.4) }}
        thumbColor={value ? Palette.primary[500] : SemanticColors.text.tertiary}
      />
    </View>
  );
}

interface MenuItemProps {
  icon: IconName;
  label: string;
  badge?: string;
  onPress: () => void;
  showBorder?: boolean;
}

function MenuItem({ icon, label, badge, onPress, showBorder = true }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !showBorder && { borderBottomWidth: 0 }]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={20} color={SemanticColors.text.secondary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={SemanticColors.text.tertiary} />
    </TouchableOpacity>
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
    paddingBottom: 100, // Tab bar için alan
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading.h2,
    color: SemanticColors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  profileCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.primary,
  },
  profileDecor1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withAlpha('#fff', 0.1),
  },
  profileDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: withAlpha('#fff', 0.05),
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Palette.accent[500],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  levelBadgeText: {
    ...Typography.label.small,
    color: '#fff',
    fontWeight: '700',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  profileName: {
    ...Typography.heading.h3,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    ...Typography.body.small,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.lg,
  },
  xpContainer: {
    marginBottom: Spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  xpLabel: {
    ...Typography.label.small,
    color: '#fff',
  },
  xpText: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    ...Typography.stat.small,
    color: '#fff',
  },
  profileStatLabel: {
    ...Typography.caption.small,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    ...Shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    ...Typography.label.small,
    color: SemanticColors.text.primary,
  },
  infoCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoLabel: {
    flex: 1,
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  infoValue: {
    ...Typography.label.medium,
    color: Palette.primary[500],
  },
  badgesContainer: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  badgeCard: {
    width: 100,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: SemanticColors.surface.default,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    ...Typography.caption.medium,
    color: SemanticColors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  textMuted: {
    color: SemanticColors.text.tertiary,
  },
  settingsCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  menuCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: SemanticColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
  },
  menuBadge: {
    backgroundColor: Palette.primary[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  menuBadgeText: {
    ...Typography.caption.small,
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(Palette.error[500], 0.1),
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: withAlpha(Palette.error[500], 0.2),
  },
  logoutText: {
    ...Typography.label.large,
    color: Palette.error[500],
  },
  version: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
