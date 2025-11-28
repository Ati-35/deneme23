// Animated Number Component
// Smooth counting animation for numbers

import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TextStyle,
} from 'react-native';
import { SemanticColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  style?: TextStyle;
  textStyle?: TextStyle;
  formatter?: (value: number) => string;
  delay?: number;
  easing?: typeof Easing.linear;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = memo(({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  style,
  textStyle,
  formatter,
  delay = 0,
  easing = Easing.out(Easing.cubic),
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState('0');
  const previousValueRef = useRef(0);

  const formatNumber = (num: number): string => {
    if (formatter) {
      return formatter(num);
    }

    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  useEffect(() => {
    const startValue = previousValueRef.current;
    animatedValue.setValue(startValue);

    const animation = Animated.timing(animatedValue, {
      toValue: value,
      duration,
      delay,
      easing,
      useNativeDriver: false,
    });

    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(formatNumber(v));
    });

    animation.start(() => {
      previousValueRef.current = value;
    });

    return () => {
      animation.stop();
      animatedValue.removeListener(listener);
    };
  }, [value, duration, delay, decimals, separator, formatter, easing]);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>
        {prefix}{displayValue}{suffix}
      </Text>
    </View>
  );
});

// Currency Animated - For money values
interface CurrencyAnimatedProps {
  value: number;
  currency?: string;
  duration?: number;
  style?: TextStyle;
  textStyle?: TextStyle;
}

export const CurrencyAnimated: React.FC<CurrencyAnimatedProps> = ({
  value,
  currency = '₺',
  duration = 1500,
  style,
  textStyle,
}) => {
  return (
    <AnimatedNumber
      value={value}
      prefix={currency}
      decimals={0}
      separator="."
      duration={duration}
      style={style}
      textStyle={textStyle}
    />
  );
};

// Percentage Animated
interface PercentageAnimatedProps {
  value: number;
  duration?: number;
  decimals?: number;
  style?: TextStyle;
  textStyle?: TextStyle;
}

export const PercentageAnimated: React.FC<PercentageAnimatedProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  style,
  textStyle,
}) => {
  return (
    <AnimatedNumber
      value={value}
      suffix="%"
      decimals={decimals}
      duration={duration}
      style={style}
      textStyle={textStyle}
    />
  );
};

// Counter with label
interface CounterWithLabelProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: object;
}

export const CounterWithLabel: React.FC<CounterWithLabelProps> = ({
  value,
  label,
  prefix = '',
  suffix = '',
  duration = 1500,
  size = 'medium',
  color,
  style,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return {
          value: Typography.stat.large,
          label: Typography.caption.large,
        };
      case 'small':
        return {
          value: Typography.stat.small,
          label: Typography.caption.small,
        };
      default:
        return {
          value: Typography.stat.medium,
          label: Typography.caption.medium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.counterWithLabel, style]}>
      <AnimatedNumber
        value={value}
        prefix={prefix}
        suffix={suffix}
        duration={duration}
        textStyle={[sizeStyles.value, color ? { color } : {}]}
      />
      <Text style={[styles.label, sizeStyles.label]}>{label}</Text>
    </View>
  );
};

// Stat Row - Multiple animated numbers in a row
interface StatItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
}

interface StatRowProps {
  stats: StatItem[];
  duration?: number;
  size?: 'small' | 'medium' | 'large';
  style?: object;
}

export const StatRow: React.FC<StatRowProps> = ({
  stats,
  duration = 1500,
  size = 'medium',
  style,
}) => {
  return (
    <View style={[styles.statRow, style]}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <CounterWithLabel
            value={stat.value}
            label={stat.label}
            prefix={stat.prefix}
            suffix={stat.suffix}
            color={stat.color}
            duration={duration}
            size={size}
            style={styles.statItem}
          />
          {index < stats.length - 1 && <View style={styles.statDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

// Countdown Timer
interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  style?: TextStyle;
  textStyle?: TextStyle;
  format?: 'full' | 'short' | 'minimal';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  style,
  textStyle,
  format = 'full',
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const formatTime = () => {
    const { hours, minutes, seconds } = timeLeft;
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    switch (format) {
      case 'minimal':
        return hours > 0 ? `${h}:${m}` : `${m}:${s}`;
      case 'short':
        return `${h}:${m}:${s}`;
      default:
        return hours > 0
          ? `${hours}s ${minutes}dk ${seconds}sn`
          : `${minutes}dk ${seconds}sn`;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.countdownText, textStyle]}>{formatTime()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  text: {
    ...Typography.stat.medium,
    color: SemanticColors.text.primary,
  },
  counterWithLabel: {
    alignItems: 'center',
  },
  label: {
    color: SemanticColors.text.secondary,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: SemanticColors.border.subtle,
  },
  countdownText: {
    ...Typography.heading.h3,
    color: SemanticColors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});

export default AnimatedNumber;

