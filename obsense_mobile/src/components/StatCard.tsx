import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

type TrendType = 'good' | 'warning' | 'neutral';

interface StatCardProps {
  iconName: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  unit?: string;
  note?: string;
  trend?: {
    type: TrendType;
    text: string;
  };
}

export default function StatCard({
  iconName,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  note,
  trend,
}: StatCardProps) {
  const getTrendColor = (type: TrendType) => {
    switch (type) {
      case 'good':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      default:
        return Colors.textMuted;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={24} color={iconColor} />
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: getTrendColor(trend.type) + '20' },
            ]}
          >
            <Text
              style={[styles.trendText, { color: getTrendColor(trend.type) }]}
            >
              {trend.text}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadow.md,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  trendText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: FontWeight.medium,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  note: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
