import { StyleSheet } from 'react-native';

const ACCENT = '#000000';
const ACCENT_LIGHT = '#EEF0FF';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#666680';
const TEXT_MUTED = '#BBBBCC';
const BG_WHITE = '#FFFFFF';
const BORDER = '#EBEBF0';

const styles = StyleSheet.create({
  // ── Trigger ──────────────────────────────────────────────
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  triggerText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: '400',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },

  // ── Modal overlay ─────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 30, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BG_WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 36,
  },

  // ── Sheet header (purple banner) ──────────────────────────
  sheetHeader: {
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  sheetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sheetSelectedDate: {
    fontSize: 22,
    fontWeight: '700',
    color: BG_WHITE,
    letterSpacing: 0.3,
  },
  closeBtnWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Calendar wrapper ──────────────────────────────────────
  calendarWrapper: {
    paddingTop: 8,
    paddingBottom: 4,
  },

  // ── Month / year nav row ──────────────────────────────────
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: {
    backgroundColor: '#F5F5F5',
  },
  monthYearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ACCENT_LIGHT,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 0.2,
  },

  // ── Week day header row ───────────────────────────────────
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    paddingVertical: 6,
    letterSpacing: 0.3,
  },
  weekDaySunday: {
    color: '#FF6B6B',
  },

  // ── Days grid ─────────────────────────────────────────────
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  dayCellSelected: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dayCellToday: {
    backgroundColor: ACCENT_LIGHT,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  dayTextSunday: {
    color: '#FF6B6B',
  },
  dayTextSelected: {
    color: BG_WHITE,
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: TEXT_MUTED,
    fontWeight: '400',
  },

  // ── Year picker ───────────────────────────────────────────
  yearPickerWrapper: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  yearPickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  yearList: {
    maxHeight: 300,
  },
  yearItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  yearItemSelected: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  yearItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  yearItemTextSelected: {
    color: BG_WHITE,
    fontWeight: '700',
  },
});

export default styles;
