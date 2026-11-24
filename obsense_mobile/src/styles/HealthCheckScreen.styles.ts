import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl + Spacing.sm, // Menambahkan padding top agar tombol lebih rendah
    paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll View ───────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: 100, // Extra padding untuk bottom tab
  },

  // ── Intro Section ─────────────────────────────────────────
  intro: {
    marginBottom: Spacing.base,
  },
  eyebrow: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: FontSize.xxl + 4,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: FontSize.base + 6,
  },

  // ── Steps ─────────────────────────────────────────────────
  steps: {
    marginBottom: Spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    opacity: 0.5,
  },
  stepActive: {
    opacity: 1,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberInactive: {
    backgroundColor: Colors.backgroundDark,
  },
  stepNumberText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  stepNumberTextInactive: {
    color: Colors.textMuted,
  },
  stepTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Form Card ─────────────────────────────────────────────
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formHeader: {
    marginBottom: Spacing.lg,
  },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  formSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Form Grid ─────────────────────────────────────────────
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  fullField: {
    width: '100%',
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },

  // ── Gender Selection ──────────────────────────────────────
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.primary,
  },

  // ── Input with Unit ───────────────────────────────────────
  inputUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingRight: Spacing.sm,
  },
  inputWithUnit: {
    flex: 1,
    padding: Spacing.sm + 2,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  unitText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },

  // ── Activity Selection ────────────────────────────────────
  activityList: {
    gap: Spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  activityButton: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  activityText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  activityTextActive: {
    color: Colors.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },

  // ── Result Card ───────────────────────────────────────────
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardGood: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  resultCardWarning: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningLight,
  },
  resultCardDanger: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  resultIcon: {
    marginBottom: Spacing.base,
  },
  resultLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  resultDesc: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.base + 6,
  },

  // ── Summary Card ──────────────────────────────────────────
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  // ── Progress Bar ──────────────────────────────────────────
  progressBar: {
    height: 4,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },

  // ── Form Layout ───────────────────────────────────────────
  row: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.sm,
  },

  // ── Option Buttons ────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.primary,
  },

  // ── Frequency Buttons ─────────────────────────────────────
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  freqButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  freqText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  freqTextActive: {
    color: Colors.primary,
  },

  // ── Result Badge ──────────────────────────────────────────
  resultBadge: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  resultBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  // ── Recommendation Card ───────────────────────────────────
  recommendCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  recommendIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: FontSize.base + 6,
  },
});

export default styles;
