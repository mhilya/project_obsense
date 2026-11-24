import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import LineChart from '../components/LineChart';
import { BottomTabParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/MonitoringScreen.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Monitoring'>;

// Mock data
const healthData = [
  { date: '12 Mei', weight: 84.2, bmi: 29.1 },
  { date: '19 Mei', weight: 83.5, bmi: 28.8 },
  { date: '26 Mei', weight: 82.9, bmi: 28.6 },
  { date: '2 Jun', weight: 82.4, bmi: 28.4 },
  { date: '9 Jun', weight: 81.6, bmi: 28.1 },
  { date: '16 Jun', weight: 80.8, bmi: 27.8 },
  { date: 'Hari ini', weight: 80.2, bmi: 27.6 },
];

const dailyActivity = [
  { day: 'Sen', steps: 6200, calories: 390 },
  { day: 'Sel', steps: 8100, calories: 510 },
  { day: 'Rab', steps: 7400, calories: 465 },
  { day: 'Kam', steps: 9600, calories: 590 },
  { day: 'Jum', steps: 5300, calories: 340 },
  { day: 'Sab', steps: 11200, calories: 680 },
  { day: 'Min', steps: 8900, calories: 540 },
];

const PERIODS = ['1 bulan', '3 bulan', '6 bulan', '1 tahun'];

export default function MonitoringScreen({ navigation }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState('3 bulan');

  const latestData = healthData[healthData.length - 1];
  const previousData = healthData[0];
  const weightChange = previousData.weight - latestData.weight;
  const weightChangePercent = ((weightChange / previousData.weight) * 100).toFixed(1);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 25) return 'Ideal';
    if (bmi < 30) return 'Berlebih';
    return 'Obesitas';
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return Colors.warning;
    if (bmi < 25) return Colors.success;
    if (bmi < 30) return Colors.warning;
    return Colors.danger;
  };

  const maxSteps = Math.max(...dailyActivity.map(d => d.steps));
  const avgSteps = Math.floor(
    dailyActivity.reduce((sum, d) => sum + d.steps, 0) / dailyActivity.length
  );
  const totalCalories = dailyActivity.reduce((sum, d) => sum + d.calories, 0);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Logo size="small" showText={true} />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-none" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* Period Tabs */}
          <View style={styles.periodTabs}>
            {PERIODS.map(period => (
              <Pressable
                key={period}
                style={[
                  styles.periodTab,
                  selectedPeriod === period && styles.periodTabActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodTabText,
                    selectedPeriod === period && styles.periodTabTextActive,
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Weight Trend Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Tren berat badan</Text>
                <Text style={styles.cardSubtitle}>
                  Turun {weightChange.toFixed(1)} kg dalam {selectedPeriod}
                </Text>
              </View>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>↓ {weightChangePercent}%</Text>
              </View>
            </View>
            <LineChart data={healthData} />
          </View>

          {/* Current BMI Status */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Kondisi saat ini</Text>
            <Text style={styles.bmiValue}>{latestData.bmi.toFixed(1)}</Text>
            <View
              style={[
                styles.bmiPill,
                { backgroundColor: getBMIColor(latestData.bmi) + '20' },
              ]}
            >
              <Text
                style={[styles.bmiPillText, { color: getBMIColor(latestData.bmi) }]}
              >
                {getBMICategory(latestData.bmi)}
              </Text>
            </View>

            {/* BMI Scale */}
            <View style={styles.bmiScale}>
              <View style={[styles.bmiBar, { backgroundColor: Colors.warning }]} />
              <View style={[styles.bmiBar, { backgroundColor: Colors.success }]} />
              <View
                style={[
                  styles.bmiBar,
                  styles.bmiBarActive,
                  { backgroundColor: Colors.warning },
                ]}
              />
              <View style={[styles.bmiBar, { backgroundColor: Colors.danger }]} />
            </View>
            <View style={styles.bmiScaleLabels}>
              <Text style={styles.bmiScaleLabel}>Kurus</Text>
              <Text style={styles.bmiScaleLabel}>Ideal</Text>
              <Text style={styles.bmiScaleLabel}>Berlebih</Text>
              <Text style={styles.bmiScaleLabel}>Obesitas</Text>
            </View>

            <Text style={styles.bmiNote}>
              Target berikutnya: capai IMT di bawah 25 dengan berat badan 72 kg.
            </Text>
          </View>

          {/* Daily Activity Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Aktivitas setiap hari</Text>
                <Text style={styles.cardSubtitle}>
                  Jumlah langkah selama 7 hari terakhir
                </Text>
              </View>
              <View style={styles.calorieBox}>
                <Icon name="local-fire-department" size={18} color={Colors.danger} />
                <View style={styles.calorieInfo}>
                  <Text style={styles.calorieValue}>
                    {totalCalories.toLocaleString('id-ID')} kkal
                  </Text>
                  <Text style={styles.calorieLabel}>Total terbakar</Text>
                </View>
              </View>
            </View>

            {/* Daily Chart */}
            <View style={styles.dailyChart}>
              {dailyActivity.map((item, index) => (
                <View key={item.day} style={styles.dailyColumn}>
                  <View style={styles.dailyTooltip}>
                    <Text style={styles.tooltipText}>
                      {item.steps.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${(item.steps / maxSteps) * 100}%`,
                          backgroundColor:
                            index === 6 ? Colors.primary : Colors.teal,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.avgSteps}>
              <Text style={styles.avgStepsValue}>
                {avgSteps.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.avgStepsLabel}>rata-rata langkah/hari</Text>
            </View>
          </View>

          {/* History Table */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Riwayat pemeriksaan</Text>
                <Text style={styles.cardSubtitle}>Catatan data kesehatan terbaru</Text>
              </View>
            </View>

            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, styles.colDate]}>Tanggal</Text>
                <Text style={[styles.tableHeader, styles.colWeight]}>Berat</Text>
                <Text style={[styles.tableHeader, styles.colBMI]}>IMT</Text>
                <Text style={[styles.tableHeader, styles.colCategory]}>Kategori</Text>
                <Text style={[styles.tableHeader, styles.colChange]}>Perubahan</Text>
              </View>

              {/* Table Body */}
              {healthData
                .slice()
                .reverse()
                .slice(0, 5)
                .map((row, index) => {
                  const isLatest = index === 0;
                  const change = isLatest
                    ? null
                    : healthData[healthData.length - 1 - index].weight -
                      healthData[healthData.length - 2 - index].weight;

                  return (
                    <View key={row.date} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.colDate]}>{row.date}</Text>
                      <Text style={[styles.tableCell, styles.colWeight]}>
                        {row.weight.toFixed(1)} kg
                      </Text>
                      <Text style={[styles.tableCell, styles.colBMI]}>
                        {row.bmi.toFixed(1)}
                      </Text>
                      <View style={styles.colCategory}>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>Berat berlebih</Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.colChange,
                          change && change < 0 ? styles.positiveChange : null,
                        ]}
                      >
                        {change ? `↓ ${Math.abs(change).toFixed(1)} kg` : '—'}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
