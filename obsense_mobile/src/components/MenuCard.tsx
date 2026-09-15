import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../theme';

interface MenuCardProps {
  title: string;
  subtitle?: string;
  iconName: string;
  iconColor?: string;
  iconBg?: string;
  onPress?: () => void;
  badge?: string;
}

const MenuCard = ({
  title,
  subtitle,
  iconName,
  iconColor = Colors.primary,
  iconBg = Colors.primaryLight,
  onPress,
  badge,
}: MenuCardProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Icon name={iconName} size={22} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : (
        <Icon name="chevron-right" size={22} color={Colors.textMuted} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
});

export default MenuCard;
