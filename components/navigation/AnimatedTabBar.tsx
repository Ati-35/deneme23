// Animated Tab Bar Component
// Custom tab bar with animations and haptic feedback

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, Gradients, withAlpha, Shadows } from '../../constants/Colors';
import { BorderRadius, Spacing, ComponentHeight, Duration } from '../../constants/DesignTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: number;
  highlight?: boolean;
}

// Default tab configuration
export const defaultTabs: TabItem[] = [
  { name: 'index', icon: 'home-outline', iconFocused: 'home', label: 'Anasayfa' },
  { name: 'stats', icon: 'stats-chart-outline', iconFocused: 'stats-chart', label: 'İstatistikler' },
  { name: 'health', icon: 'heart-outline', iconFocused: 'heart', label: 'Sağlık' },
  { name: 'crisis', icon: 'warning-outline', iconFocused: 'warning', label: 'Kriz', highlight: true },
  { name: 'profile', icon: 'person-outline', iconFocused: 'person', label: 'Profil' },
];

interface AnimatedTabBarProps extends BottomTabBarProps {
  tabs?: TabItem[];
  showLabels?: boolean;
  floatingStyle?: boolean;
}

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  tabs = defaultTabs,
  showLabels = true,
  floatingStyle = true,
}: AnimatedTabBarProps) {
  const tabWidth = (SCREEN_WIDTH - (floatingStyle ? 40 : 0)) / tabs.length;
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      tension: 200,
      friction: 20,
    }).start();
  }, [state.index, tabWidth, indicatorPosition]);

  const handleTabPress = (route: any, index: number, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(route.name);
    }
  };

  const handleTabLongPress = (route: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  return (
    <View style={[
      styles.container,
      floatingStyle && styles.containerFloating,
    ]}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth - 16,
            transform: [{ translateX: Animated.add(indicatorPosition, 8) }],
          },
        ]}
      >
        <LinearGradient
          colors={Gradients.primary as [string, string]}
          style={styles.indicatorGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Tab items */}
      {state.routes.map((route, index) => {
        const tab = tabs.find(t => t.name === route.name) || tabs[index];
        if (!tab) return null;

        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        return (
          <AnimatedTabItem
            key={route.key}
            tab={tab}
            isFocused={isFocused}
            showLabel={showLabels}
            width={tabWidth}
            onPress={() => handleTabPress(route, index, isFocused)}
            onLongPress={() => handleTabLongPress(route)}
          />
        );
      })}
    </View>
  );
}

// Animated Tab Item
interface AnimatedTabItemProps {
  tab: TabItem;
  isFocused: boolean;
  showLabel: boolean;
  width: number;
  onPress: () => void;
  onLongPress: () => void;
}

function AnimatedTabItem({
  tab,
  isFocused,
  showLabel,
  width,
  onPress,
  onLongPress,
}: AnimatedTabItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.15 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(translateYAnim, {
        toValue: isFocused ? -4 : 0,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();
  }, [isFocused, scaleAnim, translateYAnim]);

  const iconColor = isFocused
    ? SemanticColors.text.onPrimary
    : SemanticColors.text.tertiary;

  return (
    <TouchableOpacity
      style={[styles.tabItem, { width }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabItemContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {/* Highlight ring for special tabs (like crisis) */}
        {tab.highlight && !isFocused && (
          <View style={styles.highlightRing}>
            <View style={styles.highlightRingInner} />
          </View>
        )}

        <Ionicons
          name={isFocused ? tab.iconFocused : tab.icon}
          size={24}
          color={tab.highlight && !isFocused ? Palette.error[500] : iconColor}
        />

        {/* Badge */}
        {tab.badge !== undefined && tab.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </Animated.View>

      {showLabel && (
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: isFocused
                ? SemanticColors.text.primary
                : SemanticColors.text.tertiary,
              fontWeight: isFocused ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
}

// Simple custom tab bar (non-animated fallback)
interface SimpleTabBarProps {
  tabs: { name: string; icon: string; label: string }[];
  activeTab: string;
  onTabPress: (name: string) => void;
}

export function SimpleTabBar({ tabs, activeTab, onTabPress }: SimpleTabBarProps) {
  return (
    <View style={styles.simpleContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.simpleTabItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTabPress(tab.name);
          }}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.name ? Palette.primary[500] : SemanticColors.text.tertiary}
          />
          <Text
            style={[
              styles.simpleTabLabel,
              activeTab === tab.name && styles.simpleTabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.sm,
    height: ComponentHeight.tabBar,
  },
  containerFloating: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    borderRadius: BorderRadius.xl,
    borderTopWidth: 0,
    ...Shadows.lg,
    backgroundColor: withAlpha(SemanticColors.background.secondary, 0.95),
    height: 70,
    paddingBottom: Spacing.sm,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: 40,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: BorderRadius.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: Palette.error[500],
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  highlightRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: withAlpha(Palette.error[500], 0.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: withAlpha(Palette.error[500], 0.1),
  },
  
  // Simple tab bar
  simpleContainer: {
    flexDirection: 'row',
    backgroundColor: SemanticColors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
    paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.sm,
  },
  simpleTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  simpleTabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: SemanticColors.text.tertiary,
  },
  simpleTabLabelActive: {
    color: Palette.primary[500],
    fontWeight: '600',
  },
});

export default AnimatedTabBar;




