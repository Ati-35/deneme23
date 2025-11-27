// Modern Chart Components
// Using react-native-chart-kit with custom styling

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { SemanticColors, Palette, Gradients, withAlpha } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/DesignTokens';
import { Typography } from '../../constants/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Chart configuration
const defaultChartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: SemanticColors.background.card,
  backgroundGradientTo: SemanticColors.background.card,
  decimalPlaces: 0,
  color: (opacity = 1) => withAlpha(Palette.primary[500], opacity),
  labelColor: () => SemanticColors.text.secondary,
  style: {
    borderRadius: BorderRadius.lg,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: Palette.primary[500],
  },
  propsForBackgroundLines: {
    strokeDasharray: '5,5',
    stroke: withAlpha(SemanticColors.border.default, 0.5),
  },
};

// Line Chart Component
interface LineChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
  legend?: string[];
}

interface ModernLineChartProps {
  data: LineChartData;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  withDots?: boolean;
  withShadow?: boolean;
  bezier?: boolean;
  style?: ViewStyle;
}

export function ModernLineChart({
  data,
  title,
  subtitle,
  width = SCREEN_WIDTH - 40,
  height = 220,
  withDots = true,
  withShadow = true,
  bezier = true,
  style,
}: ModernLineChartProps) {
  return (
    <View style={[styles.chartContainer, style]}>
      {(title || subtitle) && (
        <View style={styles.chartHeader}>
          {title && <Text style={styles.chartTitle}>{title}</Text>}
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      )}
      <LineChart
        data={data}
        width={width}
        height={height}
        chartConfig={defaultChartConfig}
        bezier={bezier}
        withDots={withDots}
        withShadow={withShadow}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        style={styles.chart}
        fromZero={true}
      />
    </View>
  );
}

// Bar Chart Component
interface BarChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface ModernBarChartProps {
  data: BarChartData;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  showValuesOnTopOfBars?: boolean;
  style?: ViewStyle;
}

export function ModernBarChart({
  data,
  title,
  subtitle,
  width = SCREEN_WIDTH - 40,
  height = 220,
  showValuesOnTopOfBars = true,
  style,
}: ModernBarChartProps) {
  return (
    <View style={[styles.chartContainer, style]}>
      {(title || subtitle) && (
        <View style={styles.chartHeader}>
          {title && <Text style={styles.chartTitle}>{title}</Text>}
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      )}
      <BarChart
        data={data}
        width={width}
        height={height}
        chartConfig={{
          ...defaultChartConfig,
          barPercentage: 0.6,
        }}
        style={styles.chart}
        showValuesOnTopOfBars={showValuesOnTopOfBars}
        fromZero={true}
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  );
}

// Progress Ring Chart
interface ProgressChartData {
  labels?: string[];
  data: number[]; // 0-1 values
  colors?: string[];
}

interface ModernProgressChartProps {
  data: ProgressChartData;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  radius?: number;
  hideLegend?: boolean;
  style?: ViewStyle;
}

export function ModernProgressChart({
  data,
  title,
  subtitle,
  width = SCREEN_WIDTH - 40,
  height = 220,
  strokeWidth = 16,
  radius = 32,
  hideLegend = false,
  style,
}: ModernProgressChartProps) {
  const chartData = {
    labels: data.labels || [],
    data: data.data,
    colors: data.colors || [
      withAlpha(Palette.primary[500], 1),
      withAlpha(Palette.accent[500], 1),
      withAlpha(Palette.info[500], 1),
      withAlpha(Palette.success[500], 1),
    ],
  };

  return (
    <View style={[styles.chartContainer, style]}>
      {(title || subtitle) && (
        <View style={styles.chartHeader}>
          {title && <Text style={styles.chartTitle}>{title}</Text>}
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      )}
      <ProgressChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={defaultChartConfig}
        strokeWidth={strokeWidth}
        radius={radius}
        hideLegend={hideLegend}
        style={styles.chart}
      />
    </View>
  );
}

// Simple Custom Bar Chart (for weekly stats)
interface SimpleBarData {
  day: string;
  value: number;
}

interface SimpleBarChartProps {
  data: SimpleBarData[];
  title?: string;
  subtitle?: string;
  maxValue?: number;
  height?: number;
  barColor?: string;
  gradientColors?: readonly string[];
  style?: ViewStyle;
}

export function SimpleBarChart({
  data,
  title,
  subtitle,
  maxValue,
  height = 180,
  barColor,
  gradientColors = Gradients.primary,
  style,
}: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const barWidth = (SCREEN_WIDTH - 80) / data.length - 8;

  return (
    <View style={[styles.simpleChartContainer, style]}>
      {(title || subtitle) && (
        <View style={styles.chartHeader}>
          {title && <Text style={styles.chartTitle}>{title}</Text>}
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={[styles.simpleChartContent, { height }]}>
        <View style={styles.simpleBarsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.simpleBarWrapper}>
              <View style={[styles.simpleBarBackground, { height: height - 30 }]}>
                <View
                  style={[
                    styles.simpleBarFill,
                    { height: `${(item.value / max) * 100}%` },
                  ]}
                >
                  <LinearGradient
                    colors={gradientColors as [string, string, ...string[]]}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  />
                </View>
              </View>
              <Text style={styles.simpleBarLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Health Metrics Mini Chart
interface MetricData {
  current: number;
  previous: number;
  label: string;
  unit: string;
  color: string;
}

interface MetricChartProps {
  data: MetricData;
  style?: ViewStyle;
}

export function MetricChart({ data, style }: MetricChartProps) {
  const change = data.current - data.previous;
  const changePercent = ((change / data.previous) * 100).toFixed(1);
  const isPositive = change >= 0;

  return (
    <View style={[styles.metricChartContainer, style]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{data.label}</Text>
        <View
          style={[
            styles.metricBadge,
            { backgroundColor: withAlpha(isPositive ? Palette.success[500] : Palette.error[500], 0.15) },
          ]}
        >
          <Text
            style={[
              styles.metricChange,
              { color: isPositive ? Palette.success[500] : Palette.error[500] },
            ]}
          >
            {isPositive ? '+' : ''}{changePercent}%
          </Text>
        </View>
      </View>
      <View style={styles.metricValueContainer}>
        <Text style={[styles.metricValue, { color: data.color }]}>
          {data.current}
        </Text>
        <Text style={styles.metricUnit}>{data.unit}</Text>
      </View>
      {/* Mini bar indicator */}
      <View style={styles.metricBar}>
        <View
          style={[
            styles.metricBarFill,
            {
              width: `${Math.min(data.current, 100)}%`,
              backgroundColor: data.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Weekly Activity Heatmap (simplified)
interface HeatmapData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
  title?: string;
  style?: ViewStyle;
}

export function ActivityHeatmap({ data, title, style }: ActivityHeatmapProps) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  const getColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity === 0) return withAlpha(Palette.neutral[500], 0.1);
    if (intensity < 0.25) return withAlpha(Palette.primary[500], 0.3);
    if (intensity < 0.5) return withAlpha(Palette.primary[500], 0.5);
    if (intensity < 0.75) return withAlpha(Palette.primary[500], 0.7);
    return Palette.primary[500];
  };

  return (
    <View style={[styles.heatmapContainer, style]}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.heatmapGrid}>
        {data.slice(-7).map((item, index) => (
          <View key={index} style={styles.heatmapItem}>
            <View
              style={[
                styles.heatmapCell,
                { backgroundColor: getColor(item.count) },
              ]}
            />
            <Text style={styles.heatmapLabel}>
              {new Date(item.date).toLocaleDateString('tr-TR', { weekday: 'short' }).charAt(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: SemanticColors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    overflow: 'hidden',
  },
  chartHeader: {
    marginBottom: Spacing.md,
  },
  chartTitle: {
    ...Typography.heading.h4,
    color: SemanticColors.text.primary,
    marginBottom: Spacing.xs,
  },
  chartSubtitle: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
  },
  chart: {
    marginLeft: -16,
    borderRadius: BorderRadius.lg,
  },
  
  // Simple Bar Chart
  simpleChartContainer: {
    backgroundColor: SemanticColors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  simpleChartContent: {
    justifyContent: 'flex-end',
  },
  simpleBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
  },
  simpleBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  simpleBarBackground: {
    width: 28,
    backgroundColor: withAlpha(Palette.neutral[500], 0.1),
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  simpleBarFill: {
    width: '100%',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  simpleBarLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.sm,
  },
  
  // Metric Chart
  metricChartContainer: {
    backgroundColor: SemanticColors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    ...Typography.label.small,
    color: SemanticColors.text.secondary,
  },
  metricBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  metricChange: {
    ...Typography.caption.medium,
    fontWeight: '600',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  metricValue: {
    ...Typography.stat.medium,
  },
  metricUnit: {
    ...Typography.body.small,
    color: SemanticColors.text.secondary,
    marginLeft: Spacing.xs,
  },
  metricBar: {
    height: 4,
    backgroundColor: withAlpha(Palette.neutral[500], 0.1),
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Activity Heatmap
  heatmapContainer: {
    backgroundColor: SemanticColors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  heatmapGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  heatmapItem: {
    alignItems: 'center',
  },
  heatmapCell: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  heatmapLabel: {
    ...Typography.caption.medium,
    color: SemanticColors.text.secondary,
    marginTop: Spacing.xs,
  },
});

export default {
  ModernLineChart,
  ModernBarChart,
  ModernProgressChart,
  SimpleBarChart,
  MetricChart,
  ActivityHeatmap,
};




