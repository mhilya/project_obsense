import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: Spacing.base,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl + Spacing.sm,
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
    paddingBottom: 100,
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

  // ── Info Banner ───────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    marginBottom: Spacing.base,
  },

  infoBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: FontSize.sm + 6,
  },

  // ── Scenario Cards ────────────────────────────────────────
  scenarioCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },

  scenarioTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    lineHeight: FontSize.lg + 4,
  },

  scenarioContent: {
    gap: Spacing.sm,
  },

  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },

  bmiLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  bmiValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },

  resultRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  resultItem: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
  },

  resultLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  resultValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },

  riskBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    marginTop: Spacing.sm,
  },

  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: FontSize.sm + 4,
  },

  // ── SHAP Factors ──────────────────────────────────────────
  shapCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  shapTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },

  shapSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },

  shapList: {
    gap: Spacing.base,
  },

  shapItem: {
    padding: Spacing.base,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },

  shapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  shapLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },

  shapFeature: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  shapValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  shapBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },

  shapBar: {
    height: '100%',
    borderRadius: Radius.full,
  },

  shapDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm + 4,
  },

  // ── Recommendations ───────────────────────────────────────
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

  // ── Admin Evaluations ─────────────────────────────────────
  evaluationCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  evaluationTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },

  evaluationItem: {
    padding: Spacing.base,
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },

  evaluationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  evaluationInfo: {
    flex: 1,
  },

  evaluatorName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  evaluatorRole: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  evaluationDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  evaluationNotes: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: FontSize.base + 6,
  },

  // ── Assessment History ────────────────────────────────────
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  historyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },

  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },

  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },

  historyInfo: {
    flex: 1,
  },

  historyDate: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },

  historyDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Empty State ───────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },

  emptyStateTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },

  emptyStateText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.base + 6,
  },

  // ── Error State ───────────────────────────────────────────
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },

  errorStateTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },

  errorStateText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.base + 6,
    marginBottom: Spacing.base,
  },

  // ── Action Buttons ────────────────────────────────────────
  actionButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
});

export default styles;
