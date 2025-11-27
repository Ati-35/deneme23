// Animasyon Hook'ları
// Smooth transitions, spring animations, gesture handlers

import { useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  Easing,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

// Fade In Animasyonu
export const useFadeIn = (
  duration: number = 300,
  delay: number = 0
): {
  opacity: Animated.Value;
  animate: () => void;
  reset: () => void;
} => {
  const opacity = useRef(new Animated.Value(0)).current;

  const animate = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [opacity, duration, delay]);

  const reset = useCallback(() => {
    opacity.setValue(0);
  }, [opacity]);

  useEffect(() => {
    animate();
  }, [animate]);

  return { opacity, animate, reset };
};

// Slide In Animasyonu
export const useSlideIn = (
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  distance: number = 50,
  duration: number = 300,
  delay: number = 0
): {
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
  animate: () => void;
  reset: () => void;
} => {
  const translateX = useRef(new Animated.Value(
    direction === 'left' ? -distance : direction === 'right' ? distance : 0
  )).current;
  const translateY = useRef(new Animated.Value(
    direction === 'up' ? distance : direction === 'down' ? -distance : 0
  )).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animate = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.6,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, translateY, opacity, duration, delay]);

  const reset = useCallback(() => {
    translateX.setValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
    translateY.setValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
    opacity.setValue(0);
  }, [translateX, translateY, opacity, direction, distance]);

  useEffect(() => {
    animate();
  }, [animate]);

  return { translateX, translateY, opacity, animate, reset };
};

// Scale Animasyonu
export const useScale = (
  initialScale: number = 0.8,
  targetScale: number = 1,
  duration: number = 300
): {
  scale: Animated.Value;
  scaleIn: () => void;
  scaleOut: () => void;
  pulse: () => void;
} => {
  const scale = useRef(new Animated.Value(initialScale)).current;

  const scaleIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: targetScale,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [scale, targetScale]);

  const scaleOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: initialScale,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [scale, initialScale]);

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: targetScale * 1.1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: targetScale,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, targetScale, duration]);

  return { scale, scaleIn, scaleOut, pulse };
};

// Shake Animasyonu
export const useShake = (
  intensity: number = 10,
  duration: number = 400
): {
  shakeValue: Animated.Value;
  shake: () => void;
} => {
  const shakeValue = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    const steps = 6;
    const stepDuration = duration / steps;
    
    Animated.sequence([
      Animated.timing(shakeValue, { toValue: intensity, duration: stepDuration, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -intensity, duration: stepDuration, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: intensity * 0.6, duration: stepDuration, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -intensity * 0.6, duration: stepDuration, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: intensity * 0.3, duration: stepDuration, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 0, duration: stepDuration, useNativeDriver: true }),
    ]).start();
  }, [shakeValue, intensity, duration]);

  return { shakeValue, shake };
};

// Rotation Animasyonu
export const useRotation = (
  duration: number = 1000,
  loop: boolean = true
): {
  rotation: Animated.Value;
  start: () => void;
  stop: () => void;
  interpolate: () => Animated.AnimatedInterpolation<string>;
} => {
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    animationRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    animationRef.current.start();
  }, [rotation, duration]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      rotation.setValue(0);
    }
  }, [rotation]);

  const interpolate = useCallback(() => {
    return rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  }, [rotation]);

  useEffect(() => {
    if (loop) {
      start();
    }
    return () => stop();
  }, [loop, start, stop]);

  return { rotation, start, stop, interpolate };
};

// Progress Animasyonu
export const useProgress = (
  initialValue: number = 0,
  duration: number = 500
): {
  progress: Animated.Value;
  animateTo: (value: number) => void;
  reset: () => void;
} => {
  const progress = useRef(new Animated.Value(initialValue)).current;

  const animateTo = useCallback((value: number) => {
    Animated.timing(progress, {
      toValue: value,
      duration,
      useNativeDriver: false, // Width/height animasyonları için false
      easing: Easing.out(Easing.ease),
    }).start();
  }, [progress, duration]);

  const reset = useCallback(() => {
    progress.setValue(initialValue);
  }, [progress, initialValue]);

  return { progress, animateTo, reset };
};

// Stagger Animasyonu
export const useStagger = (
  itemCount: number,
  staggerDelay: number = 50,
  initialDelay: number = 0
): {
  values: Animated.Value[];
  animate: () => void;
  reset: () => void;
} => {
  const values = useRef(
    Array(itemCount).fill(0).map(() => new Animated.Value(0))
  ).current;

  const animate = useCallback(() => {
    const animations = values.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 300,
        delay: initialDelay + index * staggerDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    );

    Animated.parallel(animations).start();
  }, [values, initialDelay, staggerDelay]);

  const reset = useCallback(() => {
    values.forEach(value => value.setValue(0));
  }, [values]);

  useEffect(() => {
    animate();
  }, [animate]);

  return { values, animate, reset };
};

// Bounce Animasyonu
export const useBounce = (): {
  bounceValue: Animated.Value;
  bounce: () => void;
} => {
  const bounceValue = useRef(new Animated.Value(1)).current;

  const bounce = useCallback(() => {
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceValue]);

  return { bounceValue, bounce };
};

// Parallax Scroll
export const useParallaxScroll = (
  scrollY: Animated.Value,
  inputRange: number[] = [0, 200],
  outputRange: number[] = [0, -100]
): Animated.AnimatedInterpolation<number> => {
  return scrollY.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

// Header Collapse
export const useHeaderCollapse = (
  scrollY: Animated.Value,
  headerHeight: number = 100,
  minHeight: number = 60
): {
  height: Animated.AnimatedInterpolation<number>;
  opacity: Animated.AnimatedInterpolation<number>;
  titleScale: Animated.AnimatedInterpolation<number>;
} => {
  const height = scrollY.interpolate({
    inputRange: [0, headerHeight - minHeight],
    outputRange: [headerHeight, minHeight],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, (headerHeight - minHeight) / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, headerHeight - minHeight],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return { height, opacity, titleScale };
};

// Button Press Animasyonu
export const useButtonPress = (): {
  pressValue: Animated.Value;
  onPressIn: () => void;
  onPressOut: () => void;
  style: ViewStyle;
} => {
  const pressValue = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(pressValue, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [pressValue]);

  const onPressOut = useCallback(() => {
    Animated.spring(pressValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [pressValue]);

  return {
    pressValue,
    onPressIn,
    onPressOut,
    style: {
      transform: [{ scale: pressValue as any }],
    },
  };
};

// Counter Animasyonu
export const useCountUp = (
  targetValue: number,
  duration: number = 2000,
  startValue: number = 0
): {
  value: Animated.Value;
  displayValue: Animated.AnimatedInterpolation<string>;
  start: () => void;
} => {
  const value = useRef(new Animated.Value(startValue)).current;

  const displayValue = value.interpolate({
    inputRange: [startValue, targetValue],
    outputRange: [startValue.toString(), targetValue.toString()],
  });

  const start = useCallback(() => {
    Animated.timing(value, {
      toValue: targetValue,
      duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [value, targetValue, duration]);

  useEffect(() => {
    start();
  }, [start]);

  return { value, displayValue, start };
};




