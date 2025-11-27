import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/DesignTokens';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  prompt: string;
}

const quickActions: QuickAction[] = [
  { id: '1', icon: 'heart', label: 'Sigara isteği var', prompt: 'Şu an sigara içmek istiyorum. Ne yapmalıyım?' },
  { id: '2', icon: 'sad', label: 'Stresli hissediyorum', prompt: 'Çok stresli hissediyorum ve sigara içmek geçiyor aklımdan.' },
  { id: '3', icon: 'help-circle', label: 'Motivasyon lazım', prompt: 'Motivasyonum düştü, beni motive eder misin?' },
  { id: '4', icon: 'bulb', label: 'İpucu ver', prompt: 'Sigara bırakma konusunda günlük bir ipucu ver.' },
];

const aiResponses: Record<string, string[]> = {
  sigara: [
    'Derin bir nefes al ve 4 saniye tut, sonra yavaşça ver. İstek genellikle 3-5 dakika içinde geçer. Sen bunu atlattın! 💪',
    'Bu an zor olabilir ama hatırla: Her "hayır" dediğinde beynin yeniden yapılanıyor. Bir bardak su iç ve 5 dakika yürüyüş yap.',
    'İstek dalgası gibi gelir ve gider. Şu an bir dalganın üstündesin - bekle, geçecek. Nefes egzersizi yapmayı dene! 🌊',
  ],
  stres: [
    'Stres zamanları en zor anlardır. Ama sigara stresi azaltmaz, sadece bağımlılık döngüsünü besler. 5 derin nefes al.',
    'Stresle başa çıkmak için sağlıklı alternatifler dene: Kısa bir yürüyüş, sevdiğin bir müzik, ya da bir arkadaşınla konuş.',
    'Beynin şu an eski alışkanlığa dönmek istiyor. Ama sen yeni, sağlıklı yollar öğreniyorsun. Bu süreç zaman alır, sabırlı ol. 🧘',
  ],
  motivasyon: [
    'Her sigarasız gün bir zafer! Şu ana kadar vücudun iyileşmeye başladı: Kalp atışın normalleşti, oksijen seviyesin arttı.',
    'Düşün: Neden başladın? O sebep hâlâ geçerli. Ailenin sağlığı, kendi sağlığın, tasarruflar... Hepsi değerli! ✨',
    'Bırakma sürecinde inişler ve çıkışlar normal. Önemli olan devam etmek. Her gün bir adım daha ileri gidiyorsun!',
  ],
  ipucu: [
    '💡 Günün İpucu: Sigara isteği geldiğinde ellerini meşgul et. Stres topu, kalem çevirme veya origami dene!',
    '💡 Günün İpucu: Bol su iç! Hem toksinleri atarsın hem de el-ağız alışkanlığını tatmin edersin.',
    '💡 Günün İpucu: Tetikleyicilerini tanı. Kahve içerken mi, yemekten sonra mı istek geliyor? O anları planla.',
    '💡 Günün İpucu: Başarı günlüğü tut. Her gün neyi başardığını yaz, küçük zaferler bile önemli!',
  ],
  default: [
    'Seninle her konuda konuşabilirim. Sigara bırakma yolculuğunda yanındayım! 🌟',
    'Anladım. Bu konuda sana nasıl yardımcı olabilirim?',
    'İyi gidiyorsun! Devam et, her gün daha güçlü oluyorsun.',
  ],
};

export default function AICoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Merhaba! Ben senin AI koçunum 🤖 Sigara bırakma yolculuğunda sana yardımcı olmak için buradayım. Nasıl hissediyorsun bugün?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('sigara') || lowerMessage.includes('istek') || lowerMessage.includes('içmek')) {
      return aiResponses.sigara[Math.floor(Math.random() * aiResponses.sigara.length)];
    }
    if (lowerMessage.includes('stres') || lowerMessage.includes('gergin') || lowerMessage.includes('sinir')) {
      return aiResponses.stres[Math.floor(Math.random() * aiResponses.stres.length)];
    }
    if (lowerMessage.includes('motivasyon') || lowerMessage.includes('motive') || lowerMessage.includes('düştü')) {
      return aiResponses.motivasyon[Math.floor(Math.random() * aiResponses.motivasyon.length)];
    }
    if (lowerMessage.includes('ipucu') || lowerMessage.includes('öneri') || lowerMessage.includes('tavsiye')) {
      return aiResponses.ipucu[Math.floor(Math.random() * aiResponses.ipucu.length)];
    }
    
    return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient
            colors={Gradients.purple as [string, string]}
            style={styles.avatarGradient}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Koçum</Text>
            <Text style={styles.headerSubtitle}>7/24 Destek</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            {!message.isUser && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={Palette.purple[500]} />
              </View>
            )}
            <View style={[
              styles.messageContent,
              message.isUser ? styles.userContent : styles.aiContent,
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser && styles.userText,
              ]}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={14} color={Palette.purple[500]} />
            </View>
            <View style={[styles.messageContent, styles.aiContent, styles.typingContent]}>
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
              <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={() => sendMessage(action.prompt)}
            >
              <Ionicons name={action.icon} size={16} color={Palette.purple[500]} />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Mesajını yaz..."
            placeholderTextColor={SemanticColors.text.tertiary}
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
            <LinearGradient
              colors={inputText.trim() ? Gradients.purple as [string, string] : [SemanticColors.border.default, SemanticColors.border.default]}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={18} color="#fff" />
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
    backgroundColor: SemanticColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.subtle,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SemanticColors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.label.large,
    color: SemanticColors.text.primary,
  },
  headerSubtitle: {
    ...Typography.caption.medium,
    color: Palette.success[500],
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withAlpha(Palette.purple[500], 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  userContent: {
    backgroundColor: Palette.primary[500],
    borderBottomRightRadius: BorderRadius.xs,
  },
  aiContent: {
    backgroundColor: SemanticColors.surface.default,
    borderBottomLeftRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  messageText: {
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  typingContent: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.purple[500],
  },
  quickActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
    paddingVertical: Spacing.sm,
  },
  quickActionsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: withAlpha(Palette.purple[500], 0.1),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: withAlpha(Palette.purple[500], 0.2),
    marginRight: Spacing.sm,
  },
  quickActionText: {
    ...Typography.caption.large,
    color: Palette.purple[500],
    fontWeight: '600',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
    padding: Spacing.md,
    backgroundColor: SemanticColors.background.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body.medium,
    color: SemanticColors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  sendButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

