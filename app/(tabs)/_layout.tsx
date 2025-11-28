import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Colors, { SemanticColors, Palette, withAlpha, Shadows, Gradients } from '../../constants/Colors';
import { BorderRadius, Spacing, ComponentHeight } from '../../constants/DesignTokens';
import { useRef, useEffect } from 'react';

type IconName = keyof typeof Ionicons.glyphMap;

// Enhanced Tab icon with premium animation
function TabIcon({ 
  name, 
  color, 
  focused,
  isHighlight = false,
  highlightGradient,
}: { 
  name: IconName; 
  color: string; 
  focused: boolean;
  isHighlight?: boolean;
  highlightGradient?: readonly string[];
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: useNative,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(translateYAnim, {
        toValue: focused ? -6 : 0,
        useNativeDriver: useNative,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: focused ? 1 : 0,
        duration: 250,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Special rotation for highlight button when focused
    if (isHighlight && focused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: useNative,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: useNative,
          }),
        ])
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [focused]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.iconContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
            { rotate: isHighlight ? rotation : '0deg' },
          ],
        },
      ]}
    >
      {/* Background glow effect */}
      {focused && !isHighlight && (
        <Animated.View style={[styles.iconGlow, { opacity: glowAnim }]}>
          <LinearGradient
            colors={Gradients.primary as [string, string]}
            style={styles.iconGlowGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}
      
      {/* Special highlight for SOS/Crisis tab */}
      {isHighlight && (
        <View style={styles.highlightContainer}>
          <LinearGradient
            colors={focused 
              ? Gradients.error as [string, string]
              : [withAlpha(Palette.error[500], 0.3), withAlpha(Palette.error[400], 0.3)]
            }
            style={styles.highlightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {!focused && (
            <Animated.View 
              style={[
                styles.highlightPulse,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ]} 
            />
          )}
        </View>
      )}
      
      <Ionicons 
        name={name} 
        size={isHighlight ? 26 : 24} 
        color={
          isHighlight 
            ? '#FFFFFF'
            : focused 
              ? '#FFFFFF' 
              : color
        } 
      />

      {/* Active indicator dot */}
      {focused && !isHighlight && (
        <Animated.View 
          style={[
            styles.activeIndicator,
            { opacity: glowAnim }
          ]} 
        />
      )}
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: SemanticColors.text.tertiary,
        tabBarStyle: {
          backgroundColor: withAlpha(SemanticColors.background.secondary, 0.95),
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
          paddingHorizontal: Spacing.md,
          // Modern floating effect with blur
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          // Rounded top corners
          borderTopLeftRadius: BorderRadius['3xl'],
          borderTopRightRadius: BorderRadius['3xl'],
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: -0.2,
          fontFamily: Platform.select({ 
            ios: 'System', 
            android: 'Roboto', 
            web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
          }),
        },
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      {/* Ana Sekme 1 - Anasayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name={focused ? 'home' : 'home-outline'} 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      
      {/* Ana Sekme 2 - İstatistikler */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'İstatistik',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name={focused ? 'stats-chart' : 'stats-chart-outline'} 
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      
      {/* Ana Sekme 3 - SOS/Kriz (Ortada Vurgulu) */}
      <Tabs.Screen
        name="crisis"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name={focused ? 'pulse' : 'pulse-outline'} 
              color={color}
              focused={focused}
              isHighlight={true}
              highlightGradient={Gradients.error}
            />
          ),
        }}
      />
      
      {/* Ana Sekme 4 - Keşfet */}
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name={focused ? 'compass' : 'compass-outline'} 
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      
      {/* Ana Sekme 5 - Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name={focused ? 'person' : 'person-outline'} 
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      
      {/* Gizli Sekmeler - Tab bar'da görünmez, navigation ile erişilebilir */}
      <Tabs.Screen
        name="education"
        options={{
          href: null,
          title: 'Eğitimler',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          href: null,
          title: 'Topluluk',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: null,
          title: 'Hedefler',
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          href: null,
          title: 'Günlük',
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          href: null,
          title: 'Sağlık',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 40,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 56,
    height: 40,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  iconGlowGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
  },
  highlightContainer: {
    position: 'absolute',
    width: 56,
    height: 40,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  highlightGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
  },
  highlightPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Palette.error[400],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
