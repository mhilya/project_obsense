import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const TYPE_CONFIG: Record<
  AlertType,
  { icon: string; color: string; bg: string }
> = {
  success: { icon: 'check-circle',    color: Colors.success, bg: Colors.successLight },
  error:   { icon: 'cancel',          color: Colors.danger,  bg: Colors.dangerLight  },
  warning: { icon: 'warning',         color: Colors.warning, bg: Colors.warningLight },
  info:    { icon: 'info',            color: Colors.info,    bg: Colors.infoLight    },
  confirm: { icon: 'help',            color: Colors.primary, bg: Colors.primaryLight },
};

const CustomAlert = ({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}: CustomAlertProps): React.JSX.Element => {
  const cfg = TYPE_CONFIG[type];

  const handleButton = (btn: AlertButton) => {
    onDismiss?.();
    btn.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>

              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                <Icon name={cfg.icon} size={32} color={cfg.color} />
              </View>

              {/* Text */}
              <Text style={styles.title}>{title}</Text>
              {message ? (
                <Text style={styles.message}>{message}</Text>
              ) : null}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Buttons */}
              <View style={[styles.btnRow, buttons.length === 1 && styles.btnRowSingle]}>
                {buttons.map((btn, i) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel      = btn.style === 'cancel';
                  const isLast        = i === buttons.length - 1;

                  return (
                    <React.Fragment key={i}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.btn,
                          buttons.length === 1 && styles.btnFull,
                          isDestructive && styles.btnDestructive,
                          isCancel      && styles.btnCancel,
                          !isDestructive && !isCancel && isLast && styles.btnPrimary,
                          pressed && styles.btnPressed,
                        ]}
                        onPress={() => handleButton(btn)}
                        accessibilityRole="button"
                      >
                        <Text
                          style={[
                            styles.btnText,
                            isDestructive && styles.btnTextDestructive,
                            isCancel      && styles.btnTextCancel,
                            !isDestructive && !isCancel && isLast && styles.btnTextPrimary,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </Pressable>

                      {/* vertical divider between buttons */}
                      {i < buttons.length - 1 && (
                        <View style={styles.btnDivider} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,30,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingTop: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },

  // Icon
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },

  // Text
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },

  // Divider
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.xl,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  btnRowSingle: {
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: Colors.surface,
  },
  btnDestructive: {
    backgroundColor: Colors.surface,
  },
  btnCancel: {
    backgroundColor: Colors.background,
  },
  btnPressed: {
    opacity: 0.6,
  },
  btnDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  btnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  btnTextPrimary: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  btnTextDestructive: {
    color: Colors.danger,
    fontWeight: FontWeight.bold,
  },
  btnTextCancel: {
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});

export default CustomAlert;
