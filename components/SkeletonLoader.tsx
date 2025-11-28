// Skeleton Loader Bileşenleri
// Loading state animasyonları

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Temel Skeleton bileşeni
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// Avatar Skeleton
export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

// Metin Skeleton
export function SkeletonText({ 
  lines = 1, 
  lineHeight = 16,
  lastLineWidth = '60%',
}: { 
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
}) {
  return (
    <View style={styles.textContainer}>
      {Array(lines)
        .fill(0)
        .map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? lastLineWidth : '100%'}
            height={lineHeight}
            style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
          />
        ))}
    </View>
  );
}

// Kart Skeleton
export function SkeletonCard({ 
  showImage = true,
  showAvatar = false,
  lines = 2,
}: { 
  showImage?: boolean;
  showAvatar?: boolean;
  lines?: number;
}) {
  return (
    <View style={styles.card}>
      {showImage && <Skeleton width="100%" height={150} borderRadius={12} />}
      <View style={styles.cardContent}>
        {showAvatar && (
          <View style={styles.avatarRow}>
            <SkeletonAvatar size={40} />
            <View style={styles.avatarText}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
        )}
        <SkeletonText lines={lines} />
      </View>
    </View>
  );
}

// Liste Öğesi Skeleton
export function SkeletonListItem({ showAvatar = true }: { showAvatar?: boolean }) {
  return (
    <View style={styles.listItem}>
      {showAvatar && <SkeletonAvatar size={44} />}
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={40} height={40} borderRadius={12} />
    </View>
  );
}

// İstatistik Kart Skeleton
export function SkeletonStatsCard() {
  return (
    <View style={styles.statsCard}>
      <Skeleton width={48} height={48} borderRadius={16} />
      <View style={styles.statsContent}>
        <Skeleton width={80} height={24} />
        <Skeleton width={60} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

// Grafik Skeleton
export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <View style={[styles.chartContainer, { height }]}>
      <View style={styles.chartBars}>
        {[0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9].map((h, i) => (
          <View key={i} style={styles.chartBarContainer}>
            <Skeleton 
              width={24} 
              height={height * h * 0.6} 
              borderRadius={6}
            />
          </View>
        ))}
      </View>
      <View style={styles.chartLabels}>
        {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
          <Skeleton key={i} width={20} height={10} />
        ))}
      </View>
    </View>
  );
}

// Profil Skeleton
export function SkeletonProfile() {
  return (
    <View style={styles.profile}>
      <View style={styles.profileHeader}>
        <SkeletonAvatar size={80} />
        <View style={styles.profileInfo}>
          <Skeleton width={150} height={20} />
          <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.profileStats}>
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.profileStat}>
            <Skeleton width={48} height={28} />
            <Skeleton width={60} height={12} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Feed Skeleton
export function SkeletonFeed({ itemCount = 3 }: { itemCount?: number }) {
  return (
    <View>
      {Array(itemCount)
        .fill(0)
        .map((_, index) => (
          <SkeletonCard 
            key={index} 
            showImage={index === 0}
            showAvatar
            lines={2}
          />
        ))}
    </View>
  );
}

// Tab Skeleton
export function SkeletonTabs({ tabCount = 4 }: { tabCount?: number }) {
  return (
    <View style={styles.tabs}>
      {Array(tabCount)
        .fill(0)
        .map((_, index) => (
          <Skeleton 
            key={index} 
            width={70} 
            height={32} 
            borderRadius={16}
          />
        ))}
    </View>
  );
}

// Ana Sayfa Skeleton
export function SkeletonHomePage() {
  return (
    <View style={styles.page}>
      {/* Header Stats */}
      <View style={styles.homeHeader}>
        <Skeleton width={120} height={80} borderRadius={16} />
        <View style={styles.homeHeaderStats}>
          <Skeleton width="100%" height={24} />
          <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={16} style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[1, 2, 3, 4].map((_, i) => (
          <Skeleton key={i} width={70} height={70} borderRadius={16} />
        ))}
      </View>

      {/* Progress Card */}
      <Skeleton width="100%" height={120} borderRadius={20} />

      {/* List Items */}
      <View style={styles.section}>
        <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
        <SkeletonListItem />
        <SkeletonListItem />
        <SkeletonListItem />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  textContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    flex: 1,
    marginLeft: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
  },
  statsContent: {
    marginLeft: 12,
  },
  chartContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 8,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  profile: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  profileStat: {
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  page: {
    padding: 20,
  },
  homeHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  homeHeaderStats: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
  },
});







