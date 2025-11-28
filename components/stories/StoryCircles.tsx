// Story Circles Component
// Instagram-style horizontal story circles

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { ScalePressable } from '../interactions';
import { StoryCategory } from '../../store/storyStore';

interface StoryCirclesProps {
  categories: StoryCategory[];
  viewedCategories: string[];
  unviewedCounts: Record<string, number>;
  onCategoryPress: (categoryId: string) => void;
  style?: object;
}

interface StoryCircleProps {
  category: StoryCategory;
  isViewed: boolean;
  unviewedCount: number;
  onPress: () => void;
  index: number;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  category,
  isViewed,
  unviewedCount,
  onPress,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Pulse animation for unviewed
    if (unviewedCount > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [index, unviewedCount]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.circleWrapper,
        {
          transform: [
            { scale: scaleAnim },
            { scale: unviewedCount > 0 ? pulseAnim : 1 },
          ],
        },
      ]}
    >
      <ScalePressable onPress={handlePress} haptic={false}>
        <View style={styles.circleContainer}>
          {/* Gradient border */}
          <LinearGradient
            colors={
              isViewed
                ? [SemanticColors.border.default, SemanticColors.border.default]
                : (category.borderGradient as [string, string])
            }
            style={styles.gradientBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Inner circle */}
            <View style={[styles.innerCircle, { backgroundColor: withAlpha(category.color, 0.15) }]}>
              <Ionicons
                name={category.icon as any}
                size={24}
                color={isViewed ? SemanticColors.text.tertiary : category.color}
              />
            </View>
          </LinearGradient>

          {/* Unviewed badge */}
          {unviewedCount > 0 && (
            <View style={[styles.badge, { backgroundColor: category.color }]}>
              <Text style={styles.badgeText}>{unviewedCount}</Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            isViewed && styles.labelViewed,
          ]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </ScalePressable>
    </Animated.View>
  );
};

export const StoryCircles: React.FC<StoryCirclesProps> = ({
  categories,
  viewedCategories,
  unviewedCounts,
  onCategoryPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category, index) => (
          <StoryCircle
            key={category.id}
            category={category}
            isViewed={viewedCategories.includes(category.id)}
            unviewedCount={unviewedCounts[category.id] || 0}
            onPress={() => onCategoryPress(category.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  circleWrapper: {
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
  },
  gradientBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
  },
  innerCircle: {
    flex: 1,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.background.secondary,
    borderWidth: 2,
    borderColor: SemanticColors.background.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: SemanticColors.background.primary,
  },
  badgeText: {
    ...Typography.caption.small,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  label: {
    ...Typography.caption.small,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.xs,
    maxWidth: 68,
    textAlign: 'center',
  },
  labelViewed: {
    color: SemanticColors.text.tertiary,
  },
});

export default StoryCircles;

