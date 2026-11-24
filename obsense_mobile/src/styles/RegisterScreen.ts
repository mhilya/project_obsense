import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.xxxl,
  },

  // ── Header Section ────────────────────────────────────────
  headerSection: {
    paddingTop: Spacing.xxxl + Spacing.base,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    backgroundColor: Colors.white,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadow.lg,
  },
  appTitle: {
    fontSize: FontSize.xxl + 2,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Form Card ─────────────────────────────────────────────
  formCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base + 2,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  genderText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  genderTextActive: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
    ...Shadow.sm,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: Colors.textDisabled,
  },
  link: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },

  // ── Info Card ─────────────────────────────────────────────
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.base,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Spacing.base + 2,
    borderRadius: Radius.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
});

export default styles;
