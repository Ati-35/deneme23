// Story Progress Component
// Progress bars for story viewer

import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';

interface StoryProgressProps {
  totalCount: number;
  currentIndex: number;
  progress: number;
}

interface ProgressBarProps {
  index: number;
  currentIndex: number;
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = memo(({ index, currentIndex, progress }) => {
  const getWidth = () => {
    if (index < currentIndex) {
      return '100%';
    }
    if (index === currentIndex) {
      return `${progress}%`;
    }
    return '0%';
  };

  return (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: getWidth() }]} />
    </View>
  );
});

export const StoryProgress: React.FC<StoryProgressProps> = ({
  totalCount,
  currentIndex,
  progress,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalCount }).map((_, index) => (
        <ProgressBar
          key={index}
          index={index}
          currentIndex={currentIndex}
          progress={progress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xs,
  },
});

export default StoryProgress;

