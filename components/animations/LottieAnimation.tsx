// Lottie Animation Component
// Wrapper for Lottie animations with common configurations

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

export interface LottieAnimationRef {
  play: () => void;
  pause: () => void;
  reset: () => void;
}

interface LottieAnimationProps {
  source: string | { uri: string } | object;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  onAnimationFinish?: () => void;
  style?: ViewStyle;
  size?: number;
}

export const LottieAnimation = forwardRef<LottieAnimationRef, LottieAnimationProps>(
  (
    {
      source,
      autoPlay = true,
      loop = true,
      speed = 1,
      onAnimationFinish,
      style,
      size = 150,
    },
    ref
  ) => {
    const animationRef = useRef<LottieView>(null);

    useImperativeHandle(ref, () => ({
      play: () => animationRef.current?.play(),
      pause: () => animationRef.current?.pause(),
      reset: () => animationRef.current?.reset(),
    }));

    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <LottieView
          ref={animationRef}
          source={source as any}
          autoPlay={autoPlay}
          loop={loop}
          speed={speed}
          style={styles.animation}
          onAnimationFinish={onAnimationFinish}
        />
      </View>
    );
  }
);

LottieAnimation.displayName = 'LottieAnimation';

// Pre-configured animations using Lottie URLs from lottiefiles.com
// You can replace these with your own animations

export const SuccessAnimation = ({ size = 120, onFinish }: { size?: number; onFinish?: () => void }) => (
  <LottieAnimation
    source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_jbrw3hcz.json' }}
    size={size}
    loop={false}
    onAnimationFinish={onFinish}
  />
);

export const LoadingAnimation = ({ size = 80 }: { size?: number }) => (
  <LottieAnimation
    source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_x62chJ.json' }}
    size={size}
    loop={true}
  />
);

export const EmptyStateAnimation = ({ size = 200 }: { size?: number }) => (
  <LottieAnimation
    source={{ uri: 'https://assets4.lottiefiles.com/packages/lf20_ydo1amjm.json' }}
    size={size}
    loop={true}
  />
);

export const BreathingAnimation = ({ size = 200, speed = 0.5 }: { size?: number; speed?: number }) => (
  <LottieAnimation
    source={{ uri: 'https://assets3.lottiefiles.com/packages/lf20_qmfs6c3i.json' }}
    size={size}
    loop={true}
    speed={speed}
  />
);

export const CelebrationAnimation = ({ size = 150, onFinish }: { size?: number; onFinish?: () => void }) => (
  <LottieAnimation
    source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_lg6lh7fp.json' }}
    size={size}
    loop={false}
    onAnimationFinish={onFinish}
  />
);

export const HeartAnimation = ({ size = 100 }: { size?: number }) => (
  <LottieAnimation
    source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_qnL4Sa.json' }}
    size={size}
    loop={true}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default LottieAnimation;




