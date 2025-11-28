// Kişiselleştirilmiş AI Asistan - ChatGPT-style konuşma arayüzü
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/Colors';
import { getCurrentRisk, getPersonalizedAdvice, getTriggerAnalysis } from '../utils/aiPrediction';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'emergency' | 'motivation';
}

interface QuickReply {
  id: string;
  text: string;
  icon: string;
  action: string;
}

// AI Yanıt Şablonları
const AI_RESPONSES = {
  greeting: [
    'Merhaba! 👋 Ben senin sigara bırakma asistanınım. Bugün sana nasıl yardımcı olabilirim?',
    'Hoş geldin! 🌟 Bugün kendini nasıl hissediyorsun? Seninle konuşmak için buradayım.',
    'Selam! 💪 Yolculuğunda yanındayım. Benimle her şeyi paylaşabilirsin.',
  ],
  craving: [
    'Sigara isteği çok normal, bu senin zayıf olduğun anlamına gelmiyor. 💪 Şimdi derin bir nefes al ve 10\'a kadar say. Bu istek birkaç dakika içinde geçecek.',
    'Bu an zor olabilir ama hatırla: her dakika sigarasız geçirdiğin, bedeninin iyileştiği bir dakika. 🌱 Birlikte bir nefes egzersizi yapalım mı?',
    'Anladım, istek gelmiş. Biliyorsun bu dalgalar gibi, gelir ve geçer. 🌊 Şu an için bir bardak su iç ve bana ne hissettiğini anlat.',
  ],
  stress: [
    'Stres anlaşılır bir durum. 😔 Ama sigara stresi azaltmaz, sadece geçici bir rahatlama verir. Gerçek rahatlama için birlikte nefes egzersizi yapalım.',
    'Zor bir gün geçiriyorsun galiba. Seninleyim. 🤗 Stresi azaltmak için 5 dakikalık bir yürüyüş veya meditasyon deneyebilir misin?',
    'Stresli hissetmek normal, özellikle bu süreçte. Ama unutma, her zorluk seni daha güçlü yapıyor. 💪 Bana daha fazla anlat, dinliyorum.',
  ],
  motivation: [
    'Sen inanılmaz güçlüsün! 🌟 Bugüne kadar geldin, bu kolay değildi ama başardın. Her gün bir öncekinden daha güçlüsün.',
    'Hatırla neden başladığını: sağlığın, sevdiklerin, özgürlüğün için. 💖 Sen bu yolda yalnız değilsin, binlerce kişi seninle aynı yolculukta.',
    'Her sigara içmediğin an, akciğerlerin şifa buluyor, kalbin daha sağlıklı atıyor. 💚 Sen mucizeler yaratıyorsun!',
  ],
  progress: [
    'İlerleme kaydettiğini görmek harika! 📈 Küçük adımlar büyük değişimlere yol açar. Bugün hangi başarını kutlamak istersin?',
    'Her gün bir öncekinden iyisin. 🏆 Geçmişteki zorluklardan öğrendin ve şimdi daha deneyimlisin.',
    'Yolculuğunda ne kadar ilerlediğini gördüğümde gurur duyuyorum! 🎉 Sen gerçekten başarıyorsun.',
  ],
  emergency: [
    '🆘 Buradayım! Şimdi derin bir nefes al. 4 saniye nefes al, 4 saniye tut, 4 saniye ver. Birlikte yapalım.',
    '🆘 Sakin ol, bu geçecek. Şu an için bir bardak soğuk su iç ve 171 numaralı Sigara Bırakma Hattı\'nı arayabilirsin.',
    '🆘 Seninleyim! Bu anı atlatacaksın. SOS modunu açmak ister misin? Orada nefes egzersizleri ve dikkat dağıtıcı aktiviteler var.',
  ],
  tips: [
    '💡 İpucu: Tetikleyicilerini tanı. Kahve, stres, arkadaş ortamı... Hangileri seni zorluyor?',
    '💡 İpucu: Su iç! Susuzluk bazen sigara isteği gibi hissedilebilir.',
    '💡 İpucu: Ellerini meşgul tut. Stres topu, kalem çevirme gibi aktiviteler yardımcı olabilir.',
    '💡 İpucu: Sigarasız geçirdiğin her gün için kendine küçük bir ödül ver.',
    '💡 İpucu: Egzersiz yap! Vücudun serotonin salgılar ve kendini daha iyi hissedersin.',
  ],
  night: [
    '🌙 Gece geç saatlerde uyanık kalmak zor olabilir. Rahatlatıcı bir aktivite dene: kitap oku, sakin müzik dinle.',
    '🌙 Uyumadan önce ekran kullanımını azalt ve bir bardak ılık süt iç. İyi uykular!',
  ],
  morning: [
    '☀️ Günaydın! Yeni bir gün, yeni fırsatlar. Bugün de güçlü bir gün olacak!',
    '☀️ Sabahları zor olabileceğini biliyorum. Kahveni içerken derin nefes al ve günü planla.',
  ],
};

// Hızlı yanıt seçenekleri
const QUICK_REPLIES: QuickReply[] = [
  { id: '1', text: 'Sigara isteği var', icon: 'flame', action: 'craving' },
  { id: '2', text: 'Stresli hissediyorum', icon: 'sad', action: 'stress' },
  { id: '3', text: 'Motivasyon lazım', icon: 'rocket', action: 'motivation' },
  { id: '4', text: 'Acil yardım!', icon: 'alert-circle', action: 'emergency' },
  { id: '5', text: 'İpucu ver', icon: 'bulb', action: 'tips' },
  { id: '6', text: 'İlerlemem nasıl?', icon: 'trending-up', action: 'progress' },
];

// Konuşma analizi - kullanıcının ne istediğini anlama
const analyzeMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('istek') || lowerMessage.includes('içesim') || 
      lowerMessage.includes('sigara') || lowerMessage.includes('dayanamıyorum')) {
    return 'craving';
  }
  if (lowerMessage.includes('stres') || lowerMessage.includes('gergin') || 
      lowerMessage.includes('bunalmış') || lowerMessage.includes('sinir')) {
    return 'stress';
  }
  if (lowerMessage.includes('motivasyon') || lowerMessage.includes('zor') || 
      lowerMessage.includes('bırakacağım') || lowerMessage.includes('güç')) {
    return 'motivation';
  }
  if (lowerMessage.includes('acil') || lowerMessage.includes('yardım') || 
      lowerMessage.includes('sos') || lowerMessage.includes('kriz')) {
    return 'emergency';
  }
  if (lowerMessage.includes('ipucu') || lowerMessage.includes('öneri') || 
      lowerMessage.includes('tavsiye') || lowerMessage.includes('ne yapayım')) {
    return 'tips';
  }
  if (lowerMessage.includes('ilerleme') || lowerMessage.includes('başarı') || 
      lowerMessage.includes('nasıl gidiyor') || lowerMessage.includes('durum')) {
    return 'progress';
  }
  if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || 
      lowerMessage.includes('hey') || lowerMessage.includes('naber')) {
    return 'greeting';
  }
  
  return 'tips'; // Varsayılan
};

// Rastgele yanıt seçme
const getRandomResponse = (category: string): string => {
  const responses = AI_RESPONSES[category as keyof typeof AI_RESPONSES] || AI_RESPONSES.tips;
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    sendInitialMessage();
  }, []);

  const loadUserData = async () => {
    const userData = await getUserData();
    if (userData) {
      setUserName(userData.name);
    }
  };

  const sendInitialMessage = async () => {
    setIsTyping(true);
    
    // Risk durumunu kontrol et
    const currentRisk = await getCurrentRisk();
    const advice = await getPersonalizedAdvice();
    
    setTimeout(() => {
      const greeting = getRandomResponse('greeting');
      let initialMessage = greeting;
      
      // Risk durumuna göre ek mesaj
      if (currentRisk.riskLevel === 'high' || currentRisk.riskLevel === 'critical') {
        initialMessage += '\n\n⚠️ Şu an yüksek riskli bir zaman diliminde olduğunu görüyorum. Dikkatli ol ve gerekirse SOS modunu kullan!';
      }
      
      const welcomeMessage: Message = {
        id: '1',
        text: initialMessage,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      
      setMessages([welcomeMessage]);
      setIsTyping(false);
      
      // Kişiselleştirilmiş öneri mesajı
      if (advice.length > 0) {
        setTimeout(() => {
          const adviceMessage: Message = {
            id: '2',
            text: '💡 ' + advice[0],
            isUser: false,
            timestamp: new Date(),
            type: 'suggestion',
          };
          setMessages(prev => [...prev, adviceMessage]);
        }, 1500);
      }
    }, 1000);
  };

  const sendMessage = (text: string, action?: string) => {
    if (!text.trim() && !action) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Kullanıcı mesajı ekle
    const userMessage: Message = {
      id: Date.now().toString(),
      text: action ? QUICK_REPLIES.find(r => r.action === action)?.text || text : text,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // AI yanıtı
    setTimeout(() => {
      const category = action || analyzeMessage(text);
      const response = getRandomResponse(category);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        type: category === 'emergency' ? 'emergency' : 'text',
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Acil durumda SOS butonu öner
      if (category === 'emergency') {
        setTimeout(() => {
          const sosMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: '🆘 SOS modunu açmak için aşağıdaki butona dokun:',
            isUser: false,
            timestamp: new Date(),
            type: 'emergency',
          };
          setMessages(prev => [...prev, sosMessage]);
        }, 1000);
      }
    }, 1500 + Math.random() * 1000);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage('', reply.action);
  };

  const openSOS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/sos');
  };

  const renderMessage = (message: Message) => {
    const isEmergency = message.type === 'emergency';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!message.isUser && (
          <View style={styles.aiAvatar}>
            <LinearGradient
              colors={isEmergency ? ['#EF4444', '#DC2626'] : [Colors.primary, Colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <Ionicons 
                name={isEmergency ? 'alert' : 'sparkles'} 
                size={16} 
                color="#fff" 
              />
            </LinearGradient>
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userBubble : styles.aiBubble,
            isEmergency && styles.emergencyBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.isUser && styles.userMessageText,
            ]}
          >
            {message.text}
          </Text>
          
          {isEmergency && !message.isUser && message.text.includes('SOS') && (
            <TouchableOpacity style={styles.sosButton} onPress={openSOS}>
              <Ionicons name="warning" size={18} color="#fff" />
              <Text style={styles.sosButtonText}>SOS Modu Aç</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.avatarGradient}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Asistan</Text>
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Her zaman burada</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessageContainer]}>
              <View style={styles.aiAvatar}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="sparkles" size={16} color="#fff" />
                </LinearGradient>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>yazıyor...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesContainer}
        >
          {QUICK_REPLIES.map((reply) => (
            <TouchableOpacity
              key={reply.id}
              style={styles.quickReplyButton}
              onPress={() => handleQuickReply(reply)}
            >
              <Ionicons 
                name={reply.icon as any} 
                size={16} 
                color={reply.action === 'emergency' ? Colors.error : Colors.primary} 
              />
              <Text 
                style={[
                  styles.quickReplyText,
                  reply.action === 'emergency' && { color: Colors.error }
                ]}
              >
                {reply.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Bir şey yaz..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#fff' : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: width * 0.7,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emergencyBubble: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '15',
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    gap: 8,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  quickReplyText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.backgroundLight,
  },
});







