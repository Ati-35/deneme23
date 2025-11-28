// Story Viewer Component
// Full-screen story viewer with gestures

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  PanResponder,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SemanticColors, Palette, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { Story, StoryContent } from '../../store/storyStore';
import StoryProgress from './StoryProgress';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story content

interface StoryViewerProps {
  visible: boolean;
  story: Story | null;
  currentContentIndex: number;
  onClose: () => void;
  onNext: () => boolean;
  onPrevious: () => boolean;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  story,
  currentContentIndex,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      startProgress();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      progressAnim.setValue(0);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [visible, currentContentIndex]);

  const startProgress = () => {
    progressAnim.setValue(0);
    setProgress(0);

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 100,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });

    // Update progress state for UI
    const listener = progressAnim.addListener(({ value }) => {
      setProgress(value);
    });

    return () => progressAnim.removeListener(listener);
  };

  const pauseProgress = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    setIsPaused(true);
  };

  const resumeProgress = () => {
    setIsPaused(false);
    const remainingDuration = ((100 - progress) / 100) * STORY_DURATION;

    animationRef.current = Animated.timing(progressAnim, {
      toValue: 100,
      duration: remainingDuration,
      useNativeDriver: false,
    });

    animationRef.current.start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!onNext()) {
      // No more content, close viewer
      handleClose();
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!onPrevious()) {
      // At the beginning, restart current
      progressAnim.setValue(0);
      startProgress();
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleCTAPress = (route?: string) => {
    if (route) {
      handleClose();
      setTimeout(() => {
        router.push(route as any);
      }, 300);
    }
  };

  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!story || !visible) return null;

  const content = story.contents[currentContentIndex];
  if (!content) return null;

  const renderContent = () => {
    return (
      <LinearGradient
        colors={(content.gradientColors as [string, string]) || ['#1E293B', '#0F172A']}
        style={styles.contentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.contentContainer}>
          {/* Icon */}
          {content.icon && (
            <Text style={styles.contentIcon}>{content.icon}</Text>
          )}

          {/* Title */}
          {content.title && (
            <Text style={styles.contentTitle}>{content.title}</Text>
          )}

          {/* Subtitle */}
          {content.subtitle && (
            <Text style={styles.contentSubtitle}>{content.subtitle}</Text>
          )}

          {/* Text */}
          {content.text && (
            <Text style={styles.contentText}>{content.text}</Text>
          )}

          {/* CTA Button */}
          {content.ctaText && (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handleCTAPress(content.ctaRoute)}
            >
              <Text style={styles.ctaText}>{content.ctaText}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Background */}
        <View style={styles.background}>
          {renderContent()}
        </View>

        {/* Progress bars */}
        <SafeAreaView style={styles.progressContainer}>
          <StoryProgress
            totalCount={story.contents.length}
            currentIndex={currentContentIndex}
            progress={progress}
          />
        </SafeAreaView>

        {/* Header */}
        <SafeAreaView style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.categoryIcon, { backgroundColor: withAlpha(story.categoryColor, 0.3) }]}>
              <Ionicons
                name={story.categoryIcon as any}
                size={18}
                color={story.categoryColor}
              />
            </View>
            <Text style={styles.categoryName}>
              {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Touch areas */}
        <View style={styles.touchAreas}>
          <TouchableWithoutFeedback
            onPress={handlePrevious}
            onLongPress={pauseProgress}
            onPressOut={isPaused ? resumeProgress : undefined}
          >
            <View style={styles.touchLeft} />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={handleNext}
            onLongPress={pauseProgress}
            onPressOut={isPaused ? resumeProgress : undefined}
          >
            <View style={styles.touchRight} />
          </TouchableWithoutFeedback>
        </View>

        {/* Pause indicator */}
        {isPaused && (
          <View style={styles.pauseIndicator}>
            <Ionicons name="pause" size={48} color="rgba(255,255,255,0.5)" />
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  contentGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  contentIcon: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  contentTitle: {
    ...Typography.heading.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  contentSubtitle: {
    ...Typography.body.medium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  contentText: {
    ...Typography.body.large,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing['2xl'],
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaText: {
    ...Typography.button.medium,
    color: '#FFFFFF',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    ...Typography.label.medium,
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchAreas: {
    position: 'absolute',
    top: 100,
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  touchLeft: {
    flex: 1,
  },
  touchRight: {
    flex: 2,
  },
  pauseIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default StoryViewer;

