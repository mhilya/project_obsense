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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },

  // ── Hero Card ─────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
    ...Shadow.md,
    elevation: 4,
  },
  heroDate: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: FontSize.sm + 6,
    marginBottom: Spacing.lg,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  heroButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // ── Stats Grid ────────────────────────────────────────────
  statsGrid: {
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },

  // ── Goal Card ─────────────────────────────────────────────
  goalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: FontWeight.medium,
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  goalUnit: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  goalNote: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: Colors.primary,
  },
  ringValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  ringLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
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
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  linkText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },

  // ── Insight ───────────────────────────────────────────────
  insightList: {
    gap: Spacing.base,
  },
  insightItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm + 6,
  },

  // ── Daily Chart ───────────────────────────────────────────
  dailyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: Spacing.base,
  },
  dailyColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
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
});

export default styles;
