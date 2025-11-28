// Live Counter Component
// Milisaniye bazlı canlı sayaç - DAZN style

import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';

interface LiveCounterProps {
  quitDate: Date;
  showSeconds?: boolean;
  showMilliseconds?: boolean;
  size?: 'small' | 'medium' | 'large' | 'hero';
  style?: object;
}

interface TimeUnit {
  value: number;
  label: string;
  padLength?: number;
}

const TimeUnitDisplay = memo(({ 
  value, 
  label, 
  size = 'medium',
  showLabel = true,
}: { 
  value: number; 
  label: string; 
  size?: 'small' | 'medium' | 'large' | 'hero';
  showLabel?: boolean;
}) => {
  const getStyles = () => {
    switch (size) {
      case 'hero':
        return {
          container: styles.heroUnitContainer,
          value: styles.heroValue,
          label: styles.heroLabel,
        };
      case 'large':
        return {
          container: styles.largeUnitContainer,
          value: styles.largeValue,
          label: styles.largeLabel,
        };
      case 'small':
        return {
          container: styles.smallUnitContainer,
          value: styles.smallValue,
          label: styles.smallLabel,
        };
      default:
        return {
          container: styles.mediumUnitContainer,
          value: styles.mediumValue,
          label: styles.mediumLabel,
        };
    }
  };

  const unitStyles = getStyles();

  return (
    <View style={unitStyles.container}>
      <Text style={unitStyles.value}>
        {String(value).padStart(2, '0')}
      </Text>
      {showLabel && <Text style={unitStyles.label}>{label}</Text>}
    </View>
  );
});

const Separator = memo(({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' | 'hero' }) => {
  const getSeparatorStyle = () => {
    switch (size) {
      case 'hero':
        return styles.heroSeparator;
      case 'large':
        return styles.largeSeparator;
      case 'small':
        return styles.smallSeparator;
      default:
        return styles.mediumSeparator;
    }
  };

  return <Text style={getSeparatorStyle()}>:</Text>;
});

export const LiveCounter: React.FC<LiveCounterProps> = memo(({
  quitDate,
  showSeconds = true,
  showMilliseconds = false,
  size = 'medium',
  style,
}) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const frameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      
      // Update every second for most cases, every 100ms if showing milliseconds
      const updateInterval = showMilliseconds ? 100 : 1000;
      
      if (now - lastUpdateRef.current >= updateInterval) {
        const diff = now - quitDate.getTime();
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((diff % 1000) / 100);

        setTime({ days, hours, minutes, seconds, milliseconds });
        lastUpdateRef.current = now;
      }

      frameRef.current = requestAnimationFrame(updateTime);
    };

    frameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [quitDate, showMilliseconds]);

  const renderHeroCounter = () => (
    <View style={[styles.heroContainer, style]}>
      {/* Days - Big number */}
      <View style={styles.heroDaysSection}>
        <Text style={styles.heroDaysNumber}>{time.days}</Text>
        <Text style={styles.heroDaysLabel}>GÜN</Text>
      </View>

      {/* Time details */}
      <View style={styles.heroTimeSection}>
        <TimeUnitDisplay value={time.hours} label="SAAT" size="hero" />
        <Separator size="hero" />
        <TimeUnitDisplay value={time.minutes} label="DAKİKA" size="hero" />
        {showSeconds && (
          <>
            <Separator size="hero" />
            <TimeUnitDisplay value={time.seconds} label="SANİYE" size="hero" />
          </>
        )}
      </View>

      {/* Subtitle */}
      <Text style={styles.heroSubtitle}>SİGARASIZ</Text>
    </View>
  );

  const renderStandardCounter = () => (
    <View style={[styles.container, styles[`${size}Container`], style]}>
      {/* Days */}
      {time.days > 0 && (
        <>
          <View style={styles.daysContainer}>
            <Text style={[styles.daysValue, styles[`${size}Days`]]}>{time.days}</Text>
            <Text style={[styles.daysLabel, styles[`${size}DaysLabel`]]}>gün</Text>
          </View>
          <View style={styles.divider} />
        </>
      )}

      {/* Time */}
      <View style={styles.timeContainer}>
        <TimeUnitDisplay value={time.hours} label="saat" size={size} />
        <Separator size={size} />
        <TimeUnitDisplay value={time.minutes} label="dk" size={size} />
        {showSeconds && (
          <>
            <Separator size={size} />
            <TimeUnitDisplay value={time.seconds} label="sn" size={size} />
          </>
        )}
        {showMilliseconds && (
          <>
            <Text style={styles.milliseparator}>.</Text>
            <Text style={styles.milliseconds}>{time.milliseconds}</Text>
          </>
        )}
      </View>
    </View>
  );

  if (size === 'hero') {
    return renderHeroCounter();
  }

  return renderStandardCounter();
});

const styles = StyleSheet.create({
  // Container styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallContainer: {},
  mediumContainer: {},
  largeContainer: {},

  // Days section
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: Spacing.md,
  },
  daysValue: {
    ...Typography.stat.large,
    color: SemanticColors.text.primary,
  },
  daysLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    marginLeft: 4,
  },
  smallDays: {
    fontSize: 24,
  },
  smallDaysLabel: {
    fontSize: 10,
  },
  mediumDays: {},
  largeDays: {
    fontSize: 48,
  },
  largeDaysLabel: {
    fontSize: 16,
  },

  divider: {
    width: 1,
    height: 24,
    backgroundColor: SemanticColors.border.default,
    marginHorizontal: Spacing.md,
  },

  // Time section
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Small unit styles
  smallUnitContainer: {
    alignItems: 'center',
    minWidth: 24,
  },
  smallValue: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
    fontWeight: '700',
  },
  smallLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    marginTop: 2,
  },
  smallSeparator: {
    ...Typography.label.medium,
    color: SemanticColors.text.tertiary,
    marginHorizontal: 2,
  },

  // Medium unit styles
  mediumUnitContainer: {
    alignItems: 'center',
    minWidth: 36,
  },
  mediumValue: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
    fontWeight: '700',
  },
  mediumLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  mediumSeparator: {
    ...Typography.heading.h3,
    color: SemanticColors.text.tertiary,
    marginHorizontal: 4,
  },

  // Large unit styles
  largeUnitContainer: {
    alignItems: 'center',
    minWidth: 48,
  },
  largeValue: {
    ...Typography.heading.h1,
    color: SemanticColors.text.primary,
    fontWeight: '800',
  },
  largeLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.secondary,
    marginTop: 4,
  },
  largeSeparator: {
    ...Typography.heading.h1,
    color: SemanticColors.text.tertiary,
    marginHorizontal: 6,
  },

  // Hero styles
  heroContainer: {
    alignItems: 'center',
  },
  heroDaysSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroDaysNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 120,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  heroDaysLabel: {
    ...Typography.overline,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 8,
    marginTop: -8,
  },
  heroTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroUnitContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginTop: 2,
  },
  heroSeparator: {
    fontSize: 28,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  heroSubtitle: {
    ...Typography.overline,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 6,
  },

  // Milliseconds
  milliseparator: {
    ...Typography.label.medium,
    color: SemanticColors.text.tertiary,
  },
  milliseconds: {
    ...Typography.label.medium,
    color: SemanticColors.text.secondary,
    width: 12,
  },
});

export default LiveCounter;

