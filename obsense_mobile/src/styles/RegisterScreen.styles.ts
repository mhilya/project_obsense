import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl + Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // ── Brand ─────────────────────────────────────────────────
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },

  // ── Welcome Section ───────────────────────────────────────
  welcomeSection: {
    marginBottom: Spacing.xl + Spacing.lg,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxxl - 2,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base + 8,
  },

  // ── Input Groups ──────────────────────────────────────────
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  eyeButton: {
    paddingHorizontal: Spacing.xs,
  },
  eyeButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },

  // ── Terms Checkbox ────────────────────────────────────────
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm + 6,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },

  // ── Register Button ───────────────────────────────────────
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base + 2,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  registerButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // ── Login Link ────────────────────────────────────────────
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});

export default styles;
