// Flip Card Component
// 3D flip animation for number changes

import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';

interface FlipCardProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  duration?: number;
  style?: object;
}

interface FlipDigitProps {
  digit: string;
  prevDigit: string;
  size: 'small' | 'medium' | 'large';
  duration: number;
}

const FlipDigit: React.FC<FlipDigitProps> = memo(({ digit, prevDigit, size, duration }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setIsFlipping(true);
      flipAnim.setValue(0);

      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: 0.5,
          duration: duration / 2,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(flipAnim, {
          toValue: 0.5,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayDigit(digit);
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setIsFlipping(false);
        });
      });
    }
  }, [digit, prevDigit, duration]);

  const getStyles = () => {
    switch (size) {
      case 'large':
        return {
          container: styles.largeDigitContainer,
          text: styles.largeDigitText,
          half: styles.largeHalf,
        };
      case 'small':
        return {
          container: styles.smallDigitContainer,
          text: styles.smallDigitText,
          half: styles.smallHalf,
        };
      default:
        return {
          container: styles.mediumDigitContainer,
          text: styles.mediumDigitText,
          half: styles.mediumHalf,
        };
    }
  };

  const digitStyles = getStyles();

  const rotateTop = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-90deg', '-90deg'],
  });

  const rotateBottom = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'],
  });

  return (
    <View style={[styles.digitWrapper, digitStyles.container]}>
      {/* Static top half (current value) */}
      <View style={[styles.halfContainer, styles.topHalf, digitStyles.half]}>
        <Text style={[styles.digitText, digitStyles.text, styles.topText]}>
          {displayDigit}
        </Text>
      </View>

      {/* Static bottom half (current value) */}
      <View style={[styles.halfContainer, styles.bottomHalf, digitStyles.half]}>
        <Text style={[styles.digitText, digitStyles.text, styles.bottomText]}>
          {displayDigit}
        </Text>
      </View>

      {/* Animated top flap (old value flipping down) */}
      {isFlipping && (
        <Animated.View
          style={[
            styles.halfContainer,
            styles.topHalf,
            styles.flipHalf,
            digitStyles.half,
            {
              transform: [
                { perspective: 500 },
                { rotateX: rotateTop },
              ],
            },
          ]}
        >
          <Text style={[styles.digitText, digitStyles.text, styles.topText]}>
            {prevDigit}
          </Text>
        </Animated.View>
      )}

      {/* Animated bottom flap (new value flipping up) */}
      {isFlipping && (
        <Animated.View
          style={[
            styles.halfContainer,
            styles.bottomHalf,
            styles.flipHalf,
            digitStyles.half,
            {
              transform: [
                { perspective: 500 },
                { rotateX: rotateBottom },
              ],
            },
          ]}
        >
          <Text style={[styles.digitText, digitStyles.text, styles.bottomText]}>
            {digit}
          </Text>
        </Animated.View>
      )}

      {/* Center line */}
      <View style={styles.centerLine} />
    </View>
  );
});

export const FlipCard: React.FC<FlipCardProps> = memo(({
  value,
  size = 'medium',
  duration = 300,
  style,
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const digits = String(value).padStart(2, '0').split('');
  const prevDigits = String(prevValue).padStart(2, '0').split('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPrevValue(value);
    }, duration);
    
    return () => clearTimeout(timeout);
  }, [value, duration]);

  return (
    <View style={[styles.container, style]}>
      {digits.map((digit, index) => (
        <FlipDigit
          key={index}
          digit={digit}
          prevDigit={prevDigits[index] || digit}
          size={size}
          duration={duration}
        />
      ))}
    </View>
  );
});

// Flip Counter - Full time display with flip effect
interface FlipCounterProps {
  days: number;
  hours: number;
  minutes: number;
  seconds?: number;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  style?: object;
}

export const FlipCounter: React.FC<FlipCounterProps> = ({
  days,
  hours,
  minutes,
  seconds,
  size = 'medium',
  showLabels = true,
  style,
}) => {
  const getLabelStyle = () => {
    switch (size) {
      case 'large':
        return styles.largeLabel;
      case 'small':
        return styles.smallLabel;
      default:
        return styles.mediumLabel;
    }
  };

  const getSeparatorStyle = () => {
    switch (size) {
      case 'large':
        return styles.largeSeparator;
      case 'small':
        return styles.smallSeparator;
      default:
        return styles.mediumSeparator;
    }
  };

  const labelStyle = getLabelStyle();
  const separatorStyle = getSeparatorStyle();

  return (
    <View style={[styles.counterContainer, style]}>
      {/* Days */}
      {days > 0 && (
        <View style={styles.unitContainer}>
          <FlipCard value={days} size={size} />
          {showLabels && <Text style={labelStyle}>GÜN</Text>}
        </View>
      )}

      {days > 0 && <Text style={separatorStyle}>:</Text>}

      {/* Hours */}
      <View style={styles.unitContainer}>
        <FlipCard value={hours} size={size} />
        {showLabels && <Text style={labelStyle}>SAAT</Text>}
      </View>

      <Text style={separatorStyle}>:</Text>

      {/* Minutes */}
      <View style={styles.unitContainer}>
        <FlipCard value={minutes} size={size} />
        {showLabels && <Text style={labelStyle}>DAK</Text>}
      </View>

      {/* Seconds */}
      {seconds !== undefined && (
        <>
          <Text style={separatorStyle}>:</Text>
          <View style={styles.unitContainer}>
            <FlipCard value={seconds} size={size} />
            {showLabels && <Text style={labelStyle}>SAN</Text>}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
  },
  digitWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  halfContainer: {
    overflow: 'hidden',
    backgroundColor: SemanticColors.surface.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHalf: {
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  bottomHalf: {
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    marginTop: 1,
  },
  flipHalf: {
    position: 'absolute',
    left: 0,
    right: 0,
    backfaceVisibility: 'hidden',
  },
  digitText: {
    color: SemanticColors.text.primary,
    fontWeight: '700',
  },
  topText: {
    position: 'absolute',
    bottom: 0,
  },
  bottomText: {
    position: 'absolute',
    top: 0,
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withAlpha(SemanticColors.border.default, 0.5),
    top: '50%',
    zIndex: 10,
  },

  // Small sizes
  smallDigitContainer: {
    width: 24,
    height: 36,
  },
  smallHalf: {
    height: 17,
  },
  smallDigitText: {
    fontSize: 24,
    lineHeight: 36,
  },
  smallLabel: {
    ...Typography.caption.small,
    color: SemanticColors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  smallSeparator: {
    fontSize: 20,
    color: SemanticColors.text.tertiary,
    marginHorizontal: 4,
    marginTop: 6,
  },

  // Medium sizes
  mediumDigitContainer: {
    width: 36,
    height: 52,
  },
  mediumHalf: {
    height: 25,
  },
  mediumDigitText: {
    fontSize: 36,
    lineHeight: 52,
  },
  mediumLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 1,
  },
  mediumSeparator: {
    fontSize: 28,
    color: SemanticColors.text.tertiary,
    marginHorizontal: 6,
    marginTop: 10,
  },

  // Large sizes
  largeDigitContainer: {
    width: 52,
    height: 72,
  },
  largeHalf: {
    height: 35,
  },
  largeDigitText: {
    fontSize: 52,
    lineHeight: 72,
  },
  largeLabel: {
    ...Typography.caption.large,
    color: SemanticColors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 2,
  },
  largeSeparator: {
    fontSize: 40,
    color: SemanticColors.text.tertiary,
    marginHorizontal: 8,
    marginTop: 14,
  },

  // Counter container
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  unitContainer: {
    alignItems: 'center',
  },
});

export default FlipCard;

