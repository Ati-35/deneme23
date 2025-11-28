// Floating Action Button Component
// FAB + radial menu for quick actions

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius, ComponentHeight } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { ScalePressable } from '../interactions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  route?: string;
  onPress?: () => void;
}

interface FloatingActionButtonProps {
  actions?: QuickAction[];
  onCravingLog?: () => void;
  style?: object;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'craving',
    icon: 'alert-circle-outline',
    label: 'Sigara İsteği',
    color: Palette.error[500],
    route: '/crisis',
  },
  {
    id: 'note',
    icon: 'create-outline',
    label: 'Hızlı Not',
    color: Palette.accent[500],
    route: '/journal',
  },
  {
    id: 'ai',
    icon: 'sparkles-outline',
    label: "AI'ya Sor",
    color: Palette.primary[500],
    route: '/aiCoach',
  },
  {
    id: 'breathing',
    icon: 'fitness-outline',
    label: 'Nefes',
    color: Palette.success[500],
    route: '/breathingExercise',
  },
];

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = DEFAULT_ACTIONS,
  onCravingLog,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  
  const actionAnims = useRef(actions.map(() => new Animated.Value(0))).current;

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    setIsOpen(true);

    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(menuAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      ...actionAnims.map((anim, index) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: index * 50,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      ...actionAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        })
      ),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const handleActionPress = (action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMenu();
    
    setTimeout(() => {
      if (action.onPress) {
        action.onPress();
      } else if (action.route) {
        router.push(action.route as any);
      }
    }, 200);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Calculate action button positions (arc layout)
  const getActionPosition = (index: number, total: number) => {
    const startAngle = 200; // Start angle in degrees
    const endAngle = 290; // End angle in degrees
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + angleStep * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 90;
    
    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <View style={[styles.container, style]}>
        {/* Action buttons */}
        {isOpen &&
          actions.map((action, index) => {
            const position = getActionPosition(index, actions.length);
            
            return (
              <Animated.View
                key={action.id}
                style={[
                  styles.actionContainer,
                  {
                    transform: [
                      {
                        translateX: actionAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, position.x],
                        }),
                      },
                      {
                        translateY: actionAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, position.y],
                        }),
                      },
                      {
                        scale: actionAnims[index],
                      },
                    ],
                    opacity: actionAnims[index],
                  },
                ]}
              >
                <ScalePressable onPress={() => handleActionPress(action)} haptic="light">
                  <View style={styles.actionButton}>
                    <View style={[styles.actionIcon, { backgroundColor: withAlpha(action.color, 0.15) }]}>
                      <Ionicons name={action.icon as any} size={22} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                </ScalePressable>
              </Animated.View>
            );
          })}

        {/* Main FAB */}
        <ScalePressable onPress={toggleMenu} haptic={false}>
          <Animated.View style={[styles.fab, { transform: [{ rotate }] }]}>
            <LinearGradient
              colors={Gradients.primary as [string, string]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
        </ScalePressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: ComponentHeight.tabBar + Spacing.lg,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Palette.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    position: 'absolute',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.surface.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.primary,
    backgroundColor: SemanticColors.surface.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    textAlign: 'center',
  },
});

export default FloatingActionButton;

