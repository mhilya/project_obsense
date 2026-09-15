import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xxl,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    fontSize: FontSize.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.background,
  },
  inputMultiline: {
    height: 80,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.base,
  },
  genderBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  genderTextActive: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.base - 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  link: {
    textAlign: 'center',
    color: Colors.primary,
    fontSize: FontSize.sm,
  },
});

export default styles;
