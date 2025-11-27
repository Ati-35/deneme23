import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius, ComponentHeight } from '../constants/DesignTokens';
import { ScalePressable } from '../components/interactions';
import { FadeIn } from '../components/animations';

const { width } = Dimensions.get('window');

interface Game {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly string[];
  duration: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  xp: number;
  isNew?: boolean;
}

const games: Game[] = [
  {
    id: '1',
    name: 'Nefes Balonu',
    description: 'Balonları nefes alarak büyüt, vererek patlat',
    icon: 'balloon',
    gradient: Gradients.ocean,
    duration: '2-5 dk',
    difficulty: 'Kolay',
    xp: 50,
    isNew: true,
  },
  {
    id: '2',
    name: 'Hafıza Kartları',
    description: 'Eşleşen kartları bul ve hafızanı güçlendir',
    icon: 'grid',
    gradient: Gradients.purple,
    duration: '3-8 dk',
    difficulty: 'Orta',
    xp: 75,
  },
  {
    id: '3',
    name: 'Renk Akışı',
    description: 'Hızlıca doğru renklere dokun',
    icon: 'color-palette',
    gradient: Gradients.sunset,
    duration: '1-3 dk',
    difficulty: 'Kolay',
    xp: 40,
  },
  {
    id: '4',
    name: 'Kelime Bulmaca',
    description: 'Sağlıklı yaşam kelimelerini bul',
    icon: 'text',
    gradient: Gradients.forest,
    duration: '5-10 dk',
    difficulty: 'Orta',
    xp: 100,
  },
  {
    id: '5',
    name: 'Odak Noktası',
    description: 'Hareket eden noktayı takip et',
    icon: 'locate',
    gradient: Gradients.info,
    duration: '2-4 dk',
    difficulty: 'Zor',
    xp: 120,
    isNew: true,
  },
  {
    id: '6',
    name: 'Sayı Zinciri',
    description: 'Sırayla sayıları bul ve tıkla',
    icon: 'calculator',
    gradient: Gradients.accent,
    duration: '3-6 dk',
    difficulty: 'Zor',
    xp: 150,
  },
];

// Simple Memory Game Component
function MemoryGame({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const emojis = ['🌟', '🎯', '💪', '🏆', '❤️', '🌈', '🔥', '✨'];

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
  };

  const handleCardPress = (index: number) => {
    if (flippedIndices.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        // Match found
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setMatches((m) => m + 1);

          if (matches + 1 === emojis.length) {
            setIsComplete(true);
          }
        }, 300);
        setFlippedIndices([]);
      } else {
        // No match
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <View style={gameStyles.container}>
      <View style={gameStyles.header}>
        <TouchableOpacity onPress={onClose} style={gameStyles.closeButton}>
          <Ionicons name="close" size={24} color={SemanticColors.text.primary} />
        </TouchableOpacity>
        <Text style={gameStyles.title}>Hafıza Kartları</Text>
        <TouchableOpacity onPress={initGame} style={gameStyles.resetButton}>
          <Ionicons name="refresh" size={24} color={Palette.primary[500]} />
        </TouchableOpacity>
      </View>

      <View style={gameStyles.stats}>
        <View style={gameStyles.statItem}>
          <Text style={gameStyles.statLabel}>Hamle</Text>
          <Text style={gameStyles.statValue}>{moves}</Text>
        </View>
        <View style={gameStyles.statItem}>
          <Text style={gameStyles.statLabel}>Eşleşme</Text>
          <Text style={gameStyles.statValue}>{matches}/{emojis.length}</Text>
        </View>
      </View>

      {isComplete ? (
        <View style={gameStyles.completeContainer}>
          <Text style={gameStyles.completeEmoji}>🎉</Text>
          <Text style={gameStyles.completeTitle}>Tebrikler!</Text>
          <Text style={gameStyles.completeText}>
            {moves} hamlede tamamladın!
          </Text>
          <View style={gameStyles.xpBadge}>
            <Ionicons name="star" size={20} color={Palette.accent[500]} />
            <Text style={gameStyles.xpText}>+75 XP Kazandın</Text>
          </View>
          <TouchableOpacity style={gameStyles.playAgainButton} onPress={initGame}>
            <Text style={gameStyles.playAgainText}>Tekrar Oyna</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={gameStyles.grid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              style={[
                gameStyles.card,
                card.isFlipped && gameStyles.cardFlipped,
                card.isMatched && gameStyles.cardMatched,
              ]}
              onPress={() => handleCardPress(index)}
              disabled={card.isMatched}
            >
              {card.isFlipped || card.isMatched ? (
                <Text style={gameStyles.cardEmoji}>{card.emoji}</Text>
              ) : (
                <Ionicons name="help" size={28} color={SemanticColors.text.tertiary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={gameStyles.tip}>
        💡 Bu oyun dikkatini dağıtırken hafızanı güçlendirir!
      </Text>
    </View>
  );
}

export default function MiniGamesScreen() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(450);
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getDifficultyColor = (difficulty: Game['difficulty']) => {
    switch (difficulty) {
      case 'Kolay': return Palette.success[500];
      case 'Orta': return Palette.accent[500];
      case 'Zor': return Palette.error[500];
    }
  };

  if (selectedGame === '2') {
    return <MemoryGame onClose={() => setSelectedGame(null)} />;
  }

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
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={SemanticColors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>🎮 Mini Oyunlar</Text>
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={16} color={Palette.accent[500]} />
              <Text style={styles.xpText}>{totalXP}</Text>
            </View>
          </View>
        </FadeIn>

        {/* Hero Card */}
        <FadeIn delay={100}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <LinearGradient
              colors={Gradients.purple as [string, string]}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Dikkatini Dağıt 🎯</Text>
                <Text style={styles.heroText}>
                  Sigara isteği geldiğinde mini oyunlar oyna ve dikkatini başka yöne çevir!
                </Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Ionicons name="game-controller" size={20} color="#fff" />
                    <Text style={styles.heroStatText}>6 Oyun</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Ionicons name="trophy" size={20} color="#fff" />
                    <Text style={styles.heroStatText}>585 XP Kazanılabilir</Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroDecor}>
                <Ionicons name="game-controller" size={80} color="rgba(255,255,255,0.15)" />
              </View>
            </LinearGradient>
          </Animated.View>
        </FadeIn>

        {/* Games Grid */}
        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>Oyunlar</Text>
          <View style={styles.gamesGrid}>
            {games.map((game, index) => (
              <ScalePressable
                key={game.id}
                style={styles.gameCard}
                scaleValue={0.96}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectedGame(game.id);
                }}
              >
                <LinearGradient
                  colors={game.gradient as [string, string]}
                  style={styles.gameGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {game.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>YENİ</Text>
                    </View>
                  )}
                  <View style={styles.gameIcon}>
                    <Ionicons name={game.icon} size={32} color="#fff" />
                  </View>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameDesc} numberOfLines={2}>
                    {game.description}
                  </Text>
                  <View style={styles.gameMeta}>
                    <View style={styles.gameMetaItem}>
                      <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.gameMetaText}>{game.duration}</Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: withAlpha(getDifficultyColor(game.difficulty), 0.3) }]}>
                      <Text style={[styles.difficultyText, { color: '#fff' }]}>{game.difficulty}</Text>
                    </View>
                  </View>
                  <View style={styles.gameXP}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.gameXPText}>+{game.xp} XP</Text>
                  </View>
                </LinearGradient>
              </ScalePressable>
            ))}
          </View>
        </FadeIn>

        {/* Benefits */}
        <FadeIn delay={300}>
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>💡 Oyunların Faydaları</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
                <Text style={styles.benefitText}>Sigara isteğini yatıştırır</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
                <Text style={styles.benefitText}>Beyin fonksiyonlarını geliştirir</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
                <Text style={styles.benefitText}>Stresi azaltır</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Palette.success[500]} />
                <Text style={styles.benefitText}>XP kazanarak motivasyonu artırır</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        <View style={{ height: ComponentHeight.tabBar + 30 }} />
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
  backButton: {
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
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  xpText: {
    ...Typography.label.medium,
    color: Palette.accent[500],
  },
  heroCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroContent: {
    maxWidth: '70%',
  },
  heroTitle: {
    ...Typography.heading.h3,
    color: '#fff',
    marginBottom: Spacing.sm,
  },
  heroText: {
    ...Typography.body.medium,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heroStatText: {
    ...Typography.caption.large,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  heroDecor: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  sectionTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.md,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  gameCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  gameGradient: {
    padding: Spacing.md,
    minHeight: 180,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  newBadgeText: {
    ...Typography.caption.small,
    color: Palette.purple[600],
    fontWeight: '700',
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  gameName: {
    ...Typography.label.medium,
    color: '#fff',
    marginBottom: 4,
  },
  gameDesc: {
    ...Typography.caption.medium,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
    marginBottom: Spacing.sm,
    minHeight: 32,
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  gameMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameMetaText: {
    ...Typography.caption.small,
    color: 'rgba(255,255,255,0.8)',
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  difficultyText: {
    ...Typography.caption.small,
    fontWeight: '600',
  },
  gameXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameXPText: {
    ...Typography.caption.medium,
    color: '#FFD700',
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  benefitsTitle: {
    ...Typography.label.large,
    color: SemanticColors.text.primary,
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
});

const gameStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
    paddingTop: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  closeButton: {
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
  resetButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['3xl'],
    marginBottom: Spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
  },
  statValue: {
    ...Typography.stat.medium,
    color: SemanticColors.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 3) / 4,
    aspectRatio: 1,
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SemanticColors.border.subtle,
  },
  cardFlipped: {
    backgroundColor: withAlpha(Palette.primary[500], 0.2),
    borderColor: Palette.primary[500],
  },
  cardMatched: {
    backgroundColor: withAlpha(Palette.success[500], 0.2),
    borderColor: Palette.success[500],
  },
  cardEmoji: {
    fontSize: 28,
  },
  tip: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  completeTitle: {
    ...Typography.heading.h2,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.sm,
  },
  completeText: {
    ...Typography.body.large,
    color: SemanticColors.text.secondary,
    marginBottom: Spacing.xl,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(Palette.accent[500], 0.15),
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  xpText: {
    ...Typography.label.large,
    color: Palette.accent[500],
  },
  playAgainButton: {
    backgroundColor: Palette.primary[500],
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  playAgainText: {
    ...Typography.label.large,
    color: '#fff',
  },
});

