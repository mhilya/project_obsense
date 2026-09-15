import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
}

const CustomDropdown = ({
  label,
  placeholder = 'Pilih...',
  options,
  value,
  onChange,
  errorMessage,
}: CustomDropdownProps): React.JSX.Element => {
  const [visible, setVisible] = useState(false);

  const selected = options.find(opt => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        style={[
          styles.trigger,
          visible && styles.triggerFocused,
          !!errorMessage && styles.triggerError,
        ]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
      >
        <View style={styles.triggerLeft}>
          <Icon
            name="list"
            size={18}
            color={selected ? Colors.primary : Colors.textMuted}
            style={styles.triggerIcon}
          />
          <Text style={selected ? styles.triggerText : styles.placeholder}>
            {selected ? selected.label : placeholder}
          </Text>
        </View>
        <Icon
          name={visible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={22}
          color={Colors.textMuted}
        />
      </Pressable>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Sheet header */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{label ?? 'Pilih Opsi'}</Text>
                  <Pressable
                    style={styles.closeBtn}
                    onPress={() => setVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Tutup"
                  >
                    <Icon name="close" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {options.map(opt => {
                    const isSelected = value === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        style={({ pressed }) => [
                          styles.option,
                          isSelected && styles.optionSelected,
                          pressed && styles.optionPressed,
                        ]}
                        onPress={() => handleSelect(opt.value)}
                        accessibilityRole="menuitem"
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {isSelected && (
                          <Icon
                            name="check"
                            size={18}
                            color={Colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs + 2,
    letterSpacing: 0.2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  triggerFocused: {
    borderColor: Colors.borderFocus,
  },
  triggerError: {
    borderColor: Colors.danger,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerIcon: {
    marginRight: Spacing.sm,
  },
  triggerText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  placeholder: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.danger,
    fontWeight: FontWeight.medium,
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingBottom: Spacing.xxxl,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionPressed: {
    backgroundColor: Colors.background,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.regular,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});

export default CustomDropdown;
