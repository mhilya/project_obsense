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
  menuButton: {
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
    paddingBottom: Spacing.xxxl,
  },

  // ── Period Tabs ───────────────────────────────────────────
  periodTabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  periodTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  periodTabTextActive: {
    color: Colors.white,
  },

  // ── Card ──────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  cardLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Trend Badge ───────────────────────────────────────────
  trendBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  trendText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },

  // ── BMI Status ────────────────────────────────────────────
  bmiValue: {
    fontSize: FontSize.xxxl + 10,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  bmiPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
  },
  bmiPillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  bmiScale: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  bmiBar: {
    flex: 1,
    height: 8,
    borderRadius: Radius.sm,
    opacity: 0.3,
  },
  bmiBarActive: {
    opacity: 1,
  },
  bmiScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  bmiScaleLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  bmiNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // ── Daily Activity ────────────────────────────────────────
  calorieBox: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  calorieInfo: {
    alignItems: 'flex-end',
  },
  calorieValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  calorieLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  dailyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
  },
  dailyColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  dailyTooltip: {
    marginBottom: Spacing.xs,
  },
  tooltipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  barTrack: {
    width: '60%',
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.sm,
    minHeight: 8,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: FontWeight.semibold,
  },
  avgSteps: {
    alignItems: 'center',
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  avgStepsValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  avgStepsLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── History Table ─────────────────────────────────────────
  table: {
    gap: Spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  colDate: {
    flex: 2,
  },
  colWeight: {
    flex: 1.5,
  },
  colBMI: {
    flex: 1,
  },
  colCategory: {
    flex: 2,
  },
  colChange: {
    flex: 1.5,
    textAlign: 'right',
  },
  categoryPill: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  categoryPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
  },
  positiveChange: {
    color: Colors.success,
    fontWeight: FontWeight.bold,
  },
});

export default styles;
