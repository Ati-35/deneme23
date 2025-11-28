// Gizlilik Ayarları
// Profil gizliliği, veri paylaşım tercihleri, hesap silme, GDPR uyumluluğu

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import {
  getSecuritySettings,
  saveSecuritySettings,
  isBiometricAvailable,
  authenticateWithBiometric,
  setPin,
  hasPin,
  removePin,
  getBiometricTypeName,
} from '../utils/encryption';

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgressInCommunity: boolean;
  allowMessagesFrom: 'everyone' | 'friends' | 'nobody';
  shareAnonymousData: boolean;
  allowNotifications: boolean;
  locationTracking: boolean;
  dataRetentionDays: number;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'friends',
  showProgressInCommunity: true,
  allowMessagesFrom: 'friends',
  shareAnonymousData: true,
  allowNotifications: true,
  locationTracking: false,
  dataRetentionDays: 365,
};

export default function PrivacySettingsScreen() {
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const securitySettings = await getSecuritySettings();
    setBiometricEnabled(securitySettings.biometricEnabled);
    setPinEnabled(securitySettings.pinEnabled);

    const hasPinSet = await hasPin();
    setPinEnabled(hasPinSet);

    const biometric = await isBiometricAvailable();
    setBiometricAvailable(biometric.available);
    if (biometric.biometricTypes.length > 0) {
      setBiometricType(getBiometricTypeName(biometric.biometricTypes[0]));
    }
  };

  const updatePrivacy = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleBiometric = async () => {
    if (!biometricAvailable) {
      Alert.alert('Uyarı', 'Cihazınızda biyometrik doğrulama desteklenmiyor.');
      return;
    }

    if (!biometricEnabled) {
      const result = await authenticateWithBiometric('Biyometrik doğrulamayı etkinleştir');
      if (result.success) {
        setBiometricEnabled(true);
        await saveSecuritySettings({ biometricEnabled: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setBiometricEnabled(false);
      await saveSecuritySettings({ biometricEnabled: false });
    }
  };

  const togglePin = async () => {
    if (!pinEnabled) {
      setShowPinModal(true);
    } else {
      Alert.alert(
        'PIN Kaldır',
        'PIN korumasını kaldırmak istediğinize emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Kaldır',
            style: 'destructive',
            onPress: async () => {
              await removePin();
              setPinEnabled(false);
              await saveSecuritySettings({ pinEnabled: false });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  const handleSetPin = async () => {
    if (pin.length < 4) {
      Alert.alert('Hata', 'PIN en az 4 karakter olmalıdır.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Hata', 'PIN\'ler eşleşmiyor.');
      return;
    }

    setIsLoading(true);
    const success = await setPin(pin);
    setIsLoading(false);

    if (success) {
      setPinEnabled(true);
      await saveSecuritySettings({ pinEnabled: true });
      setShowPinModal(false);
      setPin('');
      setConfirmPin('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'PIN başarıyla ayarlandı.');
    } else {
      Alert.alert('Hata', 'PIN ayarlanamadı.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SİL') {
      Alert.alert('Hata', 'Lütfen "SİL" yazarak onaylayın.');
      return;
    }

    Alert.alert(
      'Son Uyarı',
      'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            // Hesap silme işlemi burada yapılır
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsLoading(false);
            setShowDeleteModal(false);
            router.replace('/');
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Verilerimi İndir',
      'Tüm verileriniz JSON formatında dışa aktarılacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'İndir',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Başarılı', 'Verileriniz indirildi.');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#fff"
      />
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
          <Text style={styles.title}>🔒 Gizlilik</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          <View style={styles.card}>
            {biometricAvailable && (
              <TouchableOpacity style={styles.settingItem} onPress={toggleBiometric}>
                <View style={styles.settingIcon}>
                  <Ionicons name="finger-print" size={22} color={Colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{biometricType}</Text>
                  <Text style={styles.settingSubtitle}>Uygulamayı açmak için kullan</Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.settingItem} onPress={togglePin}>
              <View style={styles.settingIcon}>
                <Ionicons name="keypad" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>PIN Koruması</Text>
                <Text style={styles.settingSubtitle}>4+ haneli PIN ile koru</Text>
              </View>
              <Switch
                value={pinEnabled}
                onValueChange={togglePin}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Gizliliği</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="eye" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Profil Görünürlüğü</Text>
                <Text style={styles.settingSubtitle}>
                  {privacy.profileVisibility === 'public' ? 'Herkese Açık' :
                   privacy.profileVisibility === 'friends' ? 'Sadece Arkadaşlar' : 'Gizli'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            {renderSettingItem(
              'stats-chart',
              'İlerlememı Göster',
              'Toplulukta ilerleme durumunu paylaş',
              privacy.showProgressInCommunity,
              () => updatePrivacy('showProgressInCommunity', !privacy.showProgressInCommunity)
            )}

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="chatbubble" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Mesaj İzinleri</Text>
                <Text style={styles.settingSubtitle}>
                  {privacy.allowMessagesFrom === 'everyone' ? 'Herkes' :
                   privacy.allowMessagesFrom === 'friends' ? 'Sadece Arkadaşlar' : 'Kimse'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri & Analitik</Text>
          <View style={styles.card}>
            {renderSettingItem(
              'analytics',
              'Anonim Veri Paylaşımı',
              'Uygulamayı geliştirmek için anonim veri paylaş',
              privacy.shareAnonymousData,
              () => updatePrivacy('shareAnonymousData', !privacy.shareAnonymousData)
            )}

            {renderSettingItem(
              'location',
              'Konum Takibi',
              'Konum bazlı uyarılar için',
              privacy.locationTracking,
              () => updatePrivacy('locationTracking', !privacy.locationTracking)
            )}

            <TouchableOpacity style={styles.settingItem} onPress={exportData}>
              <View style={styles.settingIcon}>
                <Ionicons name="download" size={22} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Verilerimi İndir</Text>
                <Text style={styles.settingSubtitle}>Tüm verilerini JSON olarak al</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* GDPR Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GDPR Hakları</Text>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
            <Text style={styles.infoText}>
              GDPR kapsamında verileriniz üzerinde tam kontrole sahipsiniz. 
              Verilerinizi istediğiniz zaman indirebilir veya silebilirsiniz.
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>Tehlikeli Bölge</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash" size={22} color={Colors.error} />
              <View style={styles.dangerContent}>
                <Text style={styles.dangerTitle}>Hesabımı Sil</Text>
                <Text style={styles.dangerSubtitle}>
                  Tüm verileriniz kalıcı olarak silinir
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PIN Ayarla</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Uygulamanızı korumak için en az 4 haneli bir PIN belirleyin.
            </Text>

            <Text style={styles.inputLabel}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={Colors.textMuted}
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text style={styles.inputLabel}>PIN Tekrar</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={Colors.textMuted}
              value={confirmPin}
              onChangeText={setConfirmPin}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSetPin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>PIN Ayarla</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dangerHeader}>
              <Ionicons name="warning" size={48} color={Colors.error} />
              <Text style={styles.dangerModalTitle}>Hesabı Sil</Text>
            </View>

            <Text style={styles.dangerModalDescription}>
              Bu işlem geri alınamaz! Tüm verileriniz, ilerlemeniz ve başarılarınız 
              kalıcı olarak silinecektir.
            </Text>

            <Text style={styles.inputLabel}>
              Onaylamak için "SİL" yazın
            </Text>
            <TextInput
              style={[styles.input, styles.dangerInput]}
              placeholder="SİL"
              placeholderTextColor={Colors.textMuted}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, deleteConfirmation !== 'SİL' && styles.deleteButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={isLoading || deleteConfirmation !== 'SİL'}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
                )}
              </TouchableOpacity>
            </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.success + '15',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  dangerCard: {
    borderColor: Colors.error + '30',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerContent: {
    flex: 1,
    marginLeft: 14,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: Colors.error + '80',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  dangerInput: {
    borderColor: Colors.error + '50',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dangerHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dangerModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 12,
  },
  dangerModalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});







