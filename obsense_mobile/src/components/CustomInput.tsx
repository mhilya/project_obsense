import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  iconName?: string;
  errorMessage?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize,
  editable = true,
  iconName,
  errorMessage,
  maxLength,
  multiline = false,
  numberOfLines,
}: CustomInputProps): React.JSX.Element => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const derivedAutoCapitalize =
    autoCapitalize ?? (keyboardType === 'email-address' ? 'none' : 'sentences');

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          focused && styles.inputRowFocused,
          !!errorMessage && styles.inputRowError,
          !editable && styles.inputRowDisabled,
        ]}
      >
        {iconName ? (
          <Icon
            name={iconName}
            size={18}
            color={focused ? Colors.primary : Colors.textMuted}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={derivedAutoCapitalize}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? (numberOfLines ?? 3) : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden(h => !h)}
            style={styles.rightIcon}
            hitSlop={8}
          >
            <Icon
              name={hidden ? 'visibility-off' : 'visibility'}
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
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
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    minHeight: 90,
  },
  inputRowFocused: {
    borderColor: Colors.borderFocus,
    elevation: 2,
  },
  inputRowError: {
    borderColor: Colors.danger,
  },
  inputRowDisabled: {
    backgroundColor: Colors.background,
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  rightIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 70,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.danger,
    fontWeight: FontWeight.medium,
  },
});

export default CustomInput;
