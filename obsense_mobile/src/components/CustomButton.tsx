import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  iconName?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border: string }
> = {
  primary: {
    bg: Colors.primary,
    text: Colors.textOnPrimary,
    border: Colors.primary,
  },
  secondary: {
    bg: Colors.primaryLight,
    text: Colors.primary,
    border: Colors.primaryLight,
  },
  outline: {
    bg: 'transparent',
    text: Colors.primary,
    border: Colors.primary,
  },
  ghost: {
    bg: 'transparent',
    text: Colors.textSecondary,
    border: 'transparent',
  },
  danger: {
    bg: Colors.danger,
    text: Colors.textOnPrimary,
    border: Colors.danger,
  },
};

const CustomButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  iconName,
  fullWidth = true,
}: CustomButtonProps): React.JSX.Element => {
  const vs = variantStyles[variant];
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: vs.bg, borderColor: vs.border },
        variant === 'primary' && styles.primaryShadow,
        !fullWidth && styles.inline,
        pressed && isInteractive && styles.pressed,
        !isInteractive && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive }}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <View style={styles.row}>
          {iconName && (
            <Icon
              name={iconName}
              size={18}
              color={vs.text}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, { color: vs.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  primaryShadow: {
    ...Shadow.lg,
  },
  inline: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    // gap handled by row
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
});

export default CustomButton;
