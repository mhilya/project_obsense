import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

interface DataPoint {
  date: string;
  weight: number;
}

interface LineChartProps {
  data: DataPoint[];
  compact?: boolean;
}

const CHART_WIDTH = Dimensions.get('window').width - 32;
const CHART_HEIGHT = 200;
const PADDING = 20;

export default function LineChart({ data, compact = false }: LineChartProps) {
  const visibleData = compact ? data.slice(-4) : data;
  
  if (visibleData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Belum ada data untuk ditampilkan</Text>
      </View>
    );
  }

  // Calculate min and max values for scaling
  const weights = visibleData.map(d => d.weight);
  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const range = maxWeight - minWeight;

  // Generate points for the line
  const points = visibleData.map((item, index) => {
    const x =
      visibleData.length === 1
        ? CHART_WIDTH / 2
        : PADDING + (index / (visibleData.length - 1)) * (CHART_WIDTH - PADDING * 2);
    const y =
      CHART_HEIGHT - PADDING - ((item.weight - minWeight) / range) * (CHART_HEIGHT - PADDING * 2);
    return { x, y };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `${PADDING},${CHART_HEIGHT - PADDING} ${polylinePoints} ${CHART_WIDTH - PADDING},${CHART_HEIGHT - PADDING}`;

  // Generate grid lines (4 horizontal lines)
  const gridLines = [0.25, 0.5, 0.75, 1].map(ratio => {
    const y = PADDING + (CHART_HEIGHT - PADDING * 2) * ratio;
    return y;
  });

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.3" />
            <Stop offset="1" stopColor={Colors.teal} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {gridLines.map((y, index) => (
          <Polyline
            key={index}
            points={`${PADDING},${y} ${CHART_WIDTH - PADDING},${y}`}
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Gradient fill area */}
        <Polygon
          points={polygonPoints}
          fill="url(#chartGradient)"
        />

        {/* Line */}
        <Polyline
          points={polylinePoints}
          stroke={Colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={Colors.white}
            stroke={Colors.primary}
            strokeWidth="3"
          />
        ))}
      </Svg>

      {/* Labels */}
      <View style={styles.labels}>
        {visibleData.map((item, index) => (
          <Text key={index} style={styles.label}>
            {item.date}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.base,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
    marginTop: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
