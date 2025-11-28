// İnteraktif Quiz Sistemi
// Eğitim modülleri için quiz ve sertifika sistemi

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizProps {
  title: string;
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  onClose: () => void;
  passingScore?: number;
}

// Örnek sorular
export const SAMPLE_QUIZ_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'Sigara bıraktıktan ne kadar süre sonra kalp atış hızı normale döner?',
    options: ['20 dakika', '2 saat', '12 saat', '24 saat'],
    correctIndex: 0,
    explanation: 'Sigara bıraktıktan 20 dakika sonra kalp atış hızı ve tansiyon normale dönmeye başlar.',
  },
  {
    id: '2',
    question: 'Nikotin beyinde hangi nörotransmitterin salınımını artırır?',
    options: ['Serotonin', 'Dopamin', 'Adrenalin', 'Melatonin'],
    correctIndex: 1,
    explanation: 'Nikotin, beynin ödül merkezinde dopamin salınımını artırarak bağımlılık yaratır.',
  },
  {
    id: '3',
    question: 'Bir sigarada yaklaşık kaç zararlı kimyasal madde bulunur?',
    options: ['100', '500', '2000', '7000'],
    correctIndex: 3,
    explanation: 'Sigara dumanında 7000\'den fazla kimyasal madde bulunur ve bunların 70\'i kanser yapıcıdır.',
  },
  {
    id: '4',
    question: 'Sigara bıraktıktan kaç ay sonra akciğer fonksiyonları iyileşmeye başlar?',
    options: ['1 hafta', '1 ay', '3 ay', '1 yıl'],
    correctIndex: 2,
    explanation: '3 ay sonra akciğer fonksiyonları ve kan dolaşımı önemli ölçüde iyileşir.',
  },
  {
    id: '5',
    question: 'Pasif içicilik ile ilgili hangisi doğrudur?',
    options: [
      'Zararsızdır',
      'Aktif içicilik kadar zararlıdır',
      'Akciğer kanseri riskini %20-30 artırır',
      'Sadece çocukları etkiler',
    ],
    correctIndex: 2,
    explanation: 'Pasif içicilik, içici olmayanların akciğer kanseri riskini %20-30 oranında artırır.',
  },
];

export default function QuizSystem({ title, questions, onComplete, onClose, passingScore = 70 }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const finalScore = (score / questions.length) * 100;
  const passed = finalScore >= passingScore;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleSelectOption = (index: number) => {
    if (showAnswer) return;
    
    setSelectedIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirm = () => {
    if (selectedIndex === null) return;

    setShowAnswer(true);
    setAnswers(prev => [...prev, selectedIndex]);

    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Yanlış cevap animasyonu
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Geçiş animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedIndex(null);
        setShowAnswer(false);
        slideAnim.setValue(50);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      setIsComplete(true);
      onComplete(finalScore, passed);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showAnswer) {
      return selectedIndex === index ? styles.optionSelected : styles.option;
    }
    
    if (index === currentQuestion.correctIndex) {
      return styles.optionCorrect;
    }
    
    if (index === selectedIndex && index !== currentQuestion.correctIndex) {
      return styles.optionWrong;
    }
    
    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (!showAnswer) {
      return selectedIndex === index ? styles.optionTextSelected : styles.optionText;
    }
    
    if (index === currentQuestion.correctIndex) {
      return styles.optionTextCorrect;
    }
    
    if (index === selectedIndex) {
      return styles.optionTextWrong;
    }
    
    return styles.optionText;
  };

  if (isComplete) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={passed ? [Colors.success + '20', Colors.background] : [Colors.error + '20', Colors.background]}
          style={styles.resultGradient}
        >
          <View style={styles.resultContent}>
            <View style={[styles.resultIcon, { backgroundColor: passed ? Colors.success : Colors.error }]}>
              <Ionicons
                name={passed ? 'trophy' : 'refresh'}
                size={48}
                color="#fff"
              />
            </View>
            
            <Text style={styles.resultTitle}>
              {passed ? '🎉 Tebrikler!' : '😔 Tekrar Deneyin'}
            </Text>
            
            <Text style={styles.resultScore}>
              {Math.round(finalScore)}%
            </Text>
            
            <Text style={styles.resultMessage}>
              {questions.length} sorudan {score} tanesini doğru cevapladınız.
            </Text>
            
            {passed && (
              <View style={styles.certificatePreview}>
                <Ionicons name="ribbon" size={32} color={Colors.primary} />
                <Text style={styles.certificateText}>
                  "{title}" sertifikası kazandınız!
                </Text>
              </View>
            )}
            
            <View style={styles.resultButtons}>
              {!passed && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setCurrentIndex(0);
                    setScore(0);
                    setAnswers([]);
                    setSelectedIndex(null);
                    setShowAnswer(false);
                    setIsComplete(false);
                  }}
                >
                  <Ionicons name="refresh" size={20} color={Colors.primary} />
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.questionCounter}>
          {currentIndex + 1}/{questions.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Question */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateX: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getOptionStyle(index)}
                onPress={() => handleSelectOption(index)}
                disabled={showAnswer}
                activeOpacity={0.8}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={getOptionTextStyle(index)}>{option}</Text>
                {showAnswer && index === currentQuestion.correctIndex && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                )}
                {showAnswer && index === selectedIndex && index !== currentQuestion.correctIndex && (
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {showAnswer && (
            <View style={styles.explanationContainer}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {!showAnswer ? (
          <TouchableOpacity
            style={[styles.confirmButton, selectedIndex === null && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={selectedIndex === null}
          >
            <Text style={styles.confirmButtonText}>Cevabı Kontrol Et</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    width: 40,
    textAlign: 'right',
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 12,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.success,
    gap: 12,
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '15',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.error,
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  optionTextSelected: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: 15,
    color: Colors.success,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionTextWrong: {
    flex: 1,
    fontSize: 15,
    color: Colors.error,
    fontWeight: '600',
    lineHeight: 22,
  },
  explanationContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  nextButton: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  resultGradient: {
    flex: 1,
  },
  resultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  certificatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  certificateText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  closeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});







