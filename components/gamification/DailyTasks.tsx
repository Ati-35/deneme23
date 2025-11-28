// Daily Tasks Component
// Günlük görev listesi ve tamamlama sistemi

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';
import { ScalePressable } from '../interactions';
import { DailyTask } from '../../store/userStore';

interface DailyTasksProps {
  tasks: DailyTask[];
  onCompleteTask: (taskId: string) => void;
  onTaskPress?: (task: DailyTask) => void;
  compact?: boolean;
}

interface TaskItemProps {
  task: DailyTask;
  onComplete: () => void;
  onPress?: () => void;
  index: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onPress, index }) => {
  const checkAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleComplete = () => {
    if (task.completed) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.spring(checkAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

    onComplete();
  };

  const getCategoryColor = () => {
    switch (task.category) {
      case 'health':
        return Palette.success[500];
      case 'mental':
        return Palette.accent[500];
      case 'social':
        return Palette.error[500];
      case 'education':
        return Palette.primary[500];
      default:
        return Palette.primary[500];
    }
  };

  const categoryColor = getCategoryColor();

  return (
    <Animated.View
      style={[
        styles.taskItem,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <ScalePressable
        onPress={task.completed ? onPress : handleComplete}
        style={styles.taskPressable}
        haptic={false}
      >
        <View style={styles.taskContent}>
          {/* Checkbox */}
          <ScalePressable onPress={handleComplete} haptic={task.completed ? false : 'success'}>
            <View
              style={[
                styles.checkbox,
                task.completed && { backgroundColor: categoryColor, borderColor: categoryColor },
              ]}
            >
              {task.completed && (
                <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </Animated.View>
              )}
            </View>
          </ScalePressable>

          {/* Task Icon */}
          <View style={[styles.taskIcon, { backgroundColor: withAlpha(categoryColor, 0.15) }]}>
            <Ionicons
              name={task.icon as any}
              size={18}
              color={task.completed ? SemanticColors.text.tertiary : categoryColor}
            />
          </View>

          {/* Task Info */}
          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.taskTitleCompleted,
                task.completed && styles.taskTitleStrike,
              ]}
            >
              {task.title}
            </Text>
            <Text style={[styles.taskDescription, task.completed && styles.taskDescriptionCompleted]}>
              {task.description}
            </Text>
          </View>

          {/* XP Reward */}
          <View style={[styles.xpBadge, task.completed && styles.xpBadgeCompleted]}>
            <Text style={[styles.xpText, task.completed && styles.xpTextCompleted]}>
              +{task.xpReward}
            </Text>
            <Text style={[styles.xpLabel, task.completed && styles.xpLabelCompleted]}>XP</Text>
          </View>
        </View>
      </ScalePressable>
    </Animated.View>
  );
};

export const DailyTasks: React.FC<DailyTasksProps> = ({
  tasks,
  onCompleteTask,
  onTaskPress,
  compact = false,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Günlük Görevler</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {completedCount === totalCount && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Palette.success[500]} />
            <Text style={styles.completedText}>Tamamlandı!</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]}>
            <LinearGradient
              colors={Gradients.success as [string, string]}
              style={styles.progressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
      </View>

      {/* Tasks List */}
      <View style={styles.tasksList}>
        {(compact ? tasks.slice(0, 3) : tasks).map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={() => onCompleteTask(task.id)}
            onPress={() => onTaskPress?.(task)}
            index={index}
          />
        ))}
      </View>

      {/* Total XP to earn */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Toplam kazanılabilir:{' '}
          <Text style={styles.footerXP}>
            {tasks.filter((t) => !t.completed).reduce((sum, t) => sum + t.xpReward, 0)} XP
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SemanticColors.surface.default,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading.h5,
    color: SemanticColors.text.primary,
  },
  progressBadge: {
    backgroundColor: withAlpha(Palette.primary[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    ...Typography.caption.small,
    color: Palette.primary[500],
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withAlpha(Palette.success[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  completedText: {
    ...Typography.caption.small,
    color: Palette.success[500],
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: withAlpha(Palette.success[500], 0.15),
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  tasksList: {
    gap: Spacing.sm,
  },
  taskItem: {
    backgroundColor: SemanticColors.background.secondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  taskPressable: {
    padding: Spacing.md,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: SemanticColors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...Typography.label.medium,
    color: SemanticColors.text.primary,
  },
  taskTitleCompleted: {
    color: SemanticColors.text.tertiary,
  },
  taskTitleStrike: {
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: 2,
  },
  taskDescriptionCompleted: {
    color: SemanticColors.text.tertiary,
  },
  xpBadge: {
    backgroundColor: withAlpha(Palette.warning[500], 0.15),
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  xpBadgeCompleted: {
    backgroundColor: withAlpha(Palette.success[500], 0.15),
  },
  xpText: {
    ...Typography.label.small,
    color: Palette.warning[500],
  },
  xpTextCompleted: {
    color: Palette.success[500],
  },
  xpLabel: {
    ...Typography.caption.small,
    color: Palette.warning[500],
  },
  xpLabelCompleted: {
    color: Palette.success[500],
  },
  footer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.subtle,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption.medium,
    color: SemanticColors.text.tertiary,
  },
  footerXP: {
    color: Palette.warning[500],
    fontWeight: '700',
  },
});

export default DailyTasks;

