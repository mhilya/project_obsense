import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/CustomDatePicker';

interface CustomDatePickerProps {
  label?: string;
  placeholder?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  maxDate?: Date;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const WEEK_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const formatDate = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

type ViewMode = 'calendar' | 'year';

const CustomDatePicker = ({
  label,
  placeholder = 'Pilih tanggal...',
  value,
  onChange,
  maxDate,
}: CustomDatePickerProps): React.JSX.Element => {
  const today = new Date();
  const [visible, setVisible] = useState(false);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());
  const [mode, setMode] = useState<ViewMode>('calendar');

  const maxYear = (maxDate ?? today).getFullYear();
  const minYear = maxYear - 100;

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  );

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    const max = maxDate ?? today;
    if (viewYear > max.getFullYear()) return;
    if (viewYear === max.getFullYear() && viewMonth >= max.getMonth()) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const isNextMonthDisabled = (): boolean => {
    const max = maxDate ?? today;
    if (viewYear > max.getFullYear()) return true;
    return viewYear === max.getFullYear() && viewMonth >= max.getMonth();
  };

  const isDisabled = (day: number): boolean => {
    const max = maxDate ?? today;
    return new Date(viewYear, viewMonth, day) > max;
  };

  const isSelected = (day: number): boolean => {
    if (!value) return false;
    return (
      value.getDate() === day &&
      value.getMonth() === viewMonth &&
      value.getFullYear() === viewYear
    );
  };

  const isToday = (day: number): boolean =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const handleSelectDay = (day: number) => {
    if (isDisabled(day)) return;
    onChange(new Date(viewYear, viewMonth, day));
    setVisible(false);
  };

  const handleSelectYear = (year: number) => {
    setViewYear(year);
    // clamp month if needed
    const max = maxDate ?? today;
    if (year === max.getFullYear() && viewMonth > max.getMonth()) {
      setViewMonth(max.getMonth());
    }
    setMode('calendar');
  };

  const handleOpen = () => {
    setViewYear(value?.getFullYear() ?? today.getFullYear());
    setViewMonth(value?.getMonth() ?? today.getMonth());
    setMode('calendar');
    setVisible(true);
  };

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = Array.from({ length: firstDay + totalDays }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  // pad to complete last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) cells.push(null);
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.trigger} onPress={handleOpen}>
        <View style={styles.triggerLeft}>
          <Icon name="event" size={20} color={value ? '#6C63FF' : '#AAAAAA'} />
          <Text style={value ? styles.triggerText : styles.placeholder}>
            {value ? formatDate(value) : placeholder}
          </Text>
        </View>
        <Icon name="keyboard-arrow-down" size={22} color="#AAAAAA" />
      </Pressable>

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

                {/* ── SHEET HEADER ── */}
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetLabel}>
                      {label ?? 'Tanggal'}
                    </Text>
                    <Text style={styles.sheetSelectedDate}>
                      {value ? formatDate(value) : '—'}
                    </Text>
                  </View>
                  <Pressable style={styles.closeBtnWrap} onPress={() => setVisible(false)}>
                    <Icon name="close" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>

                {mode === 'year' ? (
                  /* ── YEAR PICKER ── */
                  <View style={styles.yearPickerWrapper}>
                    <Text style={styles.yearPickerTitle}>Pilih Tahun</Text>
                    <ScrollView
                      style={styles.yearList}
                      showsVerticalScrollIndicator={false}
                    >
                      {years.map(yr => (
                        <Pressable
                          key={yr}
                          style={[
                            styles.yearItem,
                            yr === viewYear && styles.yearItemSelected,
                          ]}
                          onPress={() => handleSelectYear(yr)}
                        >
                          <Text
                            style={[
                              styles.yearItemText,
                              yr === viewYear && styles.yearItemTextSelected,
                            ]}
                          >
                            {yr}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  /* ── CALENDAR VIEW ── */
                  <View style={styles.calendarWrapper}>

                    {/* Month / Year navigation */}
                    <View style={styles.navRow}>
                      <Pressable style={styles.navBtn} onPress={handlePrevMonth}>
                        <Icon name="chevron-left" size={24} color="#6C63FF" />
                      </Pressable>

                      <Pressable
                        style={styles.monthYearBtn}
                        onPress={() => setMode('year')}
                      >
                        <Text style={styles.monthYearText}>
                          {MONTHS_SHORT[viewMonth]} {viewYear}
                        </Text>
                        <Icon name="arrow-drop-down" size={20} color="#6C63FF" />
                      </Pressable>

                      <Pressable
                        style={[styles.navBtn, isNextMonthDisabled() && styles.navBtnDisabled]}
                        onPress={handleNextMonth}
                        disabled={isNextMonthDisabled()}
                      >
                        <Icon
                          name="chevron-right"
                          size={24}
                          color={isNextMonthDisabled() ? '#CCCCCC' : '#6C63FF'}
                        />
                      </Pressable>
                    </View>

                    {/* Week day headers */}
                    <View style={styles.weekRow}>
                      {WEEK_DAYS.map((day, i) => (
                        <Text
                          key={day}
                          style={[styles.weekDay, i === 0 && styles.weekDaySunday]}
                        >
                          {day}
                        </Text>
                      ))}
                    </View>

                    {/* Days grid */}
                    <View style={styles.daysGrid}>
                      {cells.map((day, idx) => {
                        const selected = day !== null && isSelected(day);
                        const todayCell = day !== null && isToday(day);
                        const disabled = day === null || isDisabled(day);
                        const sunday = day !== null && (idx % 7 === 0);
                        return (
                          <Pressable
                            key={idx}
                            style={[
                              styles.dayCell,
                              selected && styles.dayCellSelected,
                              todayCell && !selected && styles.dayCellToday,
                            ]}
                            onPress={() => day !== null && handleSelectDay(day)}
                            disabled={disabled}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                sunday && !selected && styles.dayTextSunday,
                                selected && styles.dayTextSelected,
                                disabled && day !== null && styles.dayTextDisabled,
                              ]}
                            >
                              {day ?? ''}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                  </View>
                )}

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default CustomDatePicker;
