import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../constants/Colors';
import { saveUserData, UserData } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const steps = [
  {
    id: 'welcome',
    icon: 'leaf',
    title: 'Hoş Geldiniz! 🌱',
    subtitle: 'Yeni bir başlangıç için hazır mısınız?',
    description: 'Sigara bırakma yolculuğunuzda size eşlik edeceğiz. Birlikte başaracağız!',
  },
  {
    id: 'name',
    icon: 'person',
    title: 'Sizi Tanıyalım',
    subtitle: 'Size nasıl hitap edelim?',
    description: 'Adınızı girin, sizi desteklerken kullanacağız.',
  },
  {
    id: 'quit-date',
    icon: 'calendar',
    title: 'Bırakış Tarihi',
    subtitle: 'Ne zaman bıraktınız/bırakacaksınız?',
    description: 'İlerlemenizi takip etmek için bu tarih önemli.',
  },
  {
    id: 'cigarettes',
    icon: 'flame',
    title: 'Günlük Tüketim',
    subtitle: 'Günde kaç sigara içiyordunuz?',
    description: 'Bu bilgi, tasarrufunuzu hesaplamamıza yardımcı olacak.',
  },
  {
    id: 'price',
    icon: 'cash',
    title: 'Paket Fiyatı',
    subtitle: 'Bir paket sigara ne kadar?',
    description: 'Biriktirdiğiniz parayı görmek sizi motive edecek!',
  },
  {
    id: 'complete',
    icon: 'checkmark-circle',
    title: 'Hazırsınız! 🎉',
    subtitle: 'Yolculuğunuz başlıyor',
    description: 'Artık sigarasız bir hayata adım atıyorsunuz. Her gün kendinizle gurur duyun!',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [quitDate, setQuitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cigarettesPerDay, setCigarettesPerDay] = useState('20');
  const [pricePerPack, setPricePerPack] = useState('50');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateSlide = (direction: 'next' | 'prev') => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -50 : 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (currentStep < steps.length - 1) {
      animateSlide('next');
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      animateSlide('prev');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const userData: UserData = {
      name: name || 'Kullanıcı',
      email: '',
      quitDate: quitDate.toISOString(),
      cigarettesPerDay: parseInt(cigarettesPerDay) || 20,
      pricePerPack: parseInt(pricePerPack) || 50,
      isOnboarded: true,
    };

    await saveUserData(userData);
    router.replace('/(tabs)');
  };

  const isNextDisabled = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'name':
        return name.trim().length === 0;
      case 'cigarettes':
        return !cigarettesPerDay || parseInt(cigarettesPerDay) <= 0;
      case 'price':
        return !pricePerPack || parseInt(pricePerPack) <= 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
      case 'complete':
        return (
          <View style={styles.welcomeContainer}>
            <LinearGradient
              colors={step.id === 'complete' ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
              style={styles.welcomeIcon}
            >
              <Ionicons name={step.icon as any} size={60} color="#fff" />
            </LinearGradient>
          </View>
        );

      case 'name':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Adınız"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
            />
          </View>
        );

      case 'quit-date':
        return (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.dateButtonText}>
                {quitDate.toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={quitDate}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setQuitDate(date);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>
        );

      case 'cigarettes':
        return (
          <View style={styles.inputContainer}>
            <View style={styles.numberInputContainer}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => {
                  const val = Math.max(1, parseInt(cigarettesPerDay) - 1);
                  setCigarettesPerDay(val.toString());
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="remove" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TextInput
                style={styles.numberInput}
                value={cigarettesPerDay}
                onChangeText={setCigarettesPerDay}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => {
                  const val = parseInt(cigarettesPerDay) + 1;
                  setCigarettesPerDay(val.toString());
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="add" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.unitText}>adet / gün</Text>
            
            <View style={styles.presets}>
              {[10, 15, 20, 25, 30, 40].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.presetChip,
                    parseInt(cigarettesPerDay) === num && styles.presetChipActive,
                  ]}
                  onPress={() => {
                    setCigarettesPerDay(num.toString());
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.presetText,
                      parseInt(cigarettesPerDay) === num && styles.presetTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'price':
        return (
          <View style={styles.inputContainer}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₺</Text>
              <TextInput
                style={styles.priceInput}
                value={pricePerPack}
                onChangeText={setPricePerPack}
                keyboardType="numeric"
                placeholder="50"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <Text style={styles.unitText}>/ paket</Text>
            
            <View style={styles.presets}>
              {[40, 50, 60, 70, 80, 100].map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.presetChip,
                    parseInt(pricePerPack) === price && styles.presetChipActive,
                  ]}
                  onPress={() => {
                    setPricePerPack(price.toString());
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.presetText,
                      parseInt(pricePerPack) === price && styles.presetTextActive,
                    ]}
                  >
                    ₺{price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Yıllık tasarruf hesaplama */}
            {pricePerPack && cigarettesPerDay && (
              <View style={styles.savingsPreview}>
                <Ionicons name="wallet" size={24} color={Colors.money} />
                <View style={styles.savingsInfo}>
                  <Text style={styles.savingsLabel}>Yıllık Tasarrufunuz</Text>
                  <Text style={styles.savingsValue}>
                    ₺{Math.round((parseInt(pricePerPack) * 365 * parseInt(cigarettesPerDay)) / 20).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const step = steps[currentStep];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {steps.length}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.stepContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Step Header */}
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>

            {/* Step Content */}
            {renderStepContent()}
          </Animated.View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 0 && styles.nextButtonFull,
              isNextDisabled() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isNextDisabled()}
          >
            <LinearGradient
              colors={isNextDisabled() ? [Colors.textMuted, Colors.textMuted] : [Colors.primary, Colors.primaryDark]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Başla!' : 'Devam'}
              </Text>
              {currentStep < steps.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  stepHeader: {
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  welcomeIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    gap: 16,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    fontSize: 20,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dateButtonText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  numberButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  numberInput: {
    width: 100,
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#fff',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.money,
    marginRight: 8,
  },
  priceInput: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 120,
    textAlign: 'center',
  },
  savingsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.money + '15',
    borderRadius: 16,
    padding: 16,
    marginTop: 32,
    width: '100%',
  },
  savingsInfo: {
    flex: 1,
  },
  savingsLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  savingsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.money,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});







