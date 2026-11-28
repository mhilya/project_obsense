import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import Logo from '../components/Logo';
import { getStoredUser, getToken, getUserProfile } from '../utils/authStorage';
import { authenticatedRequest } from '../utils/api';
import { Colors } from '../theme';
import styles from '../styles/HomeScreen.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Home'>;

interface ProfileSummary {
  name?: string;
  height?: number | null;
  weight?: number | null;
}

interface CycleSummary {
  id: number;
  cycle_number?: number;
  days_logged?: number;
  status?: string;
  aggregated_features?: {
    faf_mean?: number;
    fcvc_mode?: number;
    ch2o_mean?: number;
    ncp_mean?: number;
    tue_mean?: number;
  } | null;
}

interface AssessmentSummary {
  id: number;
  assessment_date: string;
  bmi?: number | null;
  obesity_class?: string;
  risk_level?: string;
  recommendations?: string[];
  lifestyle_prediction?: {
    obesity_class?: string;
    risk_level?: string;
  } | null;
}

const formatShortDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.slice(0, 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const formatObesityClass = (cls?: string): string => {
  if (!cls) return '';
  return cls.replace(/_/g, ' ');
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
};

export default function HomeScreen({ navigation }: Props) {
  const [username, setUsername] = useState('Pengguna');
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [cycle, setCycle] = useState<CycleSummary | null>(null);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const storedUser = await getStoredUser();
      if (storedUser?.name) {
        setUsername(storedUser.name);
      }

      const token = await getToken();
      if (!token) return;

      const [profileRes, cycleRes, assessmentsRes] = await Promise.all([
        getUserProfile().catch(() => null),
        authenticatedRequest<any>('/cycles/current', token).catch(() => ({ success: false, data: null })),
        authenticatedRequest<any>('/assessments', token).catch(() => ({ success: false, data: null })),
      ]);

      if (profileRes) {
        setProfile({
          name: profileRes.name,
          height: profileRes.height !== undefined && profileRes.height !== null ? Number(profileRes.height) : null,
          weight: profileRes.weight !== undefined && profileRes.weight !== null ? Number(profileRes.weight) : null,
        });
        if (profileRes.name) setUsername(profileRes.name);
      }

      if (cycleRes.success && cycleRes.data) {
        const c = cycleRes.data?.data ?? cycleRes.data;
        if (c && typeof c === 'object' && c.id !== undefined) {
          setCycle(c);
        } else {
          setCycle(null);
        }
      } else {
        setCycle(null);
      }

      if (assessmentsRes.success && assessmentsRes.data) {
        const rawList = Array.isArray(assessmentsRes.data)
          ? assessmentsRes.data
          : assessmentsRes.data?.data;
        if (Array.isArray(rawList)) {
          setAssessments(rawList);
        }
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Derived real metrics
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;
  const currentWeight = profile?.weight ?? null;
  const currentHeight = profile?.height ?? null;

  const computedBmi = (() => {
    if (latestAssessment?.bmi !== null && latestAssessment?.bmi !== undefined) {
      return Number(latestAssessment.bmi);
    }
    if (currentWeight && currentHeight && currentHeight > 0) {
      const hMeters = currentHeight > 3 ? currentHeight / 100 : currentHeight;
      return Number((currentWeight / (hMeters * hMeters)).toFixed(1));
    }
    return null;
  })();

  const latestRisk =
    latestAssessment?.risk_level ||
    latestAssessment?.lifestyle_prediction?.risk_level ||
    null;

  const latestClass =
    latestAssessment?.obesity_class ||
    latestAssessment?.lifestyle_prediction?.obesity_class ||
    null;

  const bmiTrend: { type: 'good' | 'warning' | 'neutral'; text: string } = (() => {
    if (latestRisk === 'Low') return { type: 'good', text: 'Risiko Rendah' };
    if (latestRisk === 'Moderate') return { type: 'warning', text: 'Risiko Sedang' };
    if (latestRisk === 'High' || latestRisk === 'Critical') {
      return { type: 'warning', text: 'Perlu Perhatian' };
    }
    if (computedBmi !== null) {
      return computedBmi >= 18.5 && computedBmi < 25
        ? { type: 'good', text: 'Normal' }
        : { type: 'warning', text: 'Perlu Cek ML' };
    }
    return { type: 'neutral', text: 'Belum ada data' };
  })();

  const daysLogged = Number(cycle?.days_logged ?? 0);
  const cycleProgress = Math.min(Math.round((daysLogged / 14) * 100), 100);
  const remainingDays = Math.max(14 - daysLogged, 0);

  // BMI trend chart data from real assessments (chronological)
  const bmiChartData = assessments
    .filter((a) => a.bmi !== null && a.bmi !== undefined && !Number.isNaN(Number(a.bmi)))
    .slice(0, 7)
    .reverse()
    .map((a) => ({
      date: formatShortDate(a.assessment_date),
      weight: Number(a.bmi),
    }));

  // Real lifestyle summary bars from active cycle aggregated_features
  const agg = cycle?.aggregated_features;
  const lifestyleBars = [
    {
      label: 'Aktivitas',
      ratio: agg?.faf_mean !== undefined ? Math.min(Math.max(agg.faf_mean / 3, 0), 1) : 0,
      highlight: true,
    },
    {
      label: 'Sayur',
      ratio: agg?.fcvc_mode !== undefined ? Math.min(Math.max(agg.fcvc_mode / 3, 0), 1) : 0,
      highlight: false,
    },
    {
      label: 'Air',
      ratio: agg?.ch2o_mean !== undefined ? Math.min(Math.max(agg.ch2o_mean / 3, 0), 1) : 0,
      highlight: false,
    },
    {
      label: 'Makan',
      ratio: agg?.ncp_mean !== undefined ? Math.min(Math.max(agg.ncp_mean / 4, 0), 1) : 0,
      highlight: false,
    },
    {
      label: 'Layar',
      ratio: agg?.tue_mean !== undefined ? Math.min(Math.max(agg.tue_mean / 2, 0), 1) : 0,
      highlight: false,
    },
  ];

  const recommendations = Array.isArray(latestAssessment?.recommendations)
    ? latestAssessment.recommendations.slice(0, 2)
    : [];

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroDate}>{getCurrentDate()}</Text>
            <Text style={styles.heroTitle}>{getGreeting()}, {username}</Text>
            <Text style={styles.heroSubtitle}>
              Setiap langkah kecil hari ini membawa kamu lebih dekat ke kondisi terbaikmu.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('HealthCheck')}
            >
              <Text style={styles.heroButtonText}>Cek kondisi sekarang</Text>
              <Icon name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              iconName="monitor-weight"
              iconColor={Colors.primary}
              iconBg={Colors.primaryLight}
              label="Berat badan"
              value={currentWeight !== null ? currentWeight.toFixed(1) : '--'}
              unit={currentWeight !== null ? 'kg' : undefined}
              note={
                currentHeight !== null
                  ? `Tinggi badan: ${currentHeight} cm`
                  : 'Lengkapi data fisik di Profil'
              }
              trend={
                currentWeight !== null
                  ? { type: 'good', text: 'Tercatat' }
                  : { type: 'neutral', text: 'Belum diisi' }
              }
            />
            <StatCard
              iconName="favorite"
              iconColor={Colors.warning}
              iconBg={Colors.warningLight}
              label="Indeks Massa Tubuh"
              value={computedBmi !== null ? computedBmi.toFixed(1) : '--'}
              note={
                latestClass
                  ? formatObesityClass(latestClass)
                  : computedBmi !== null
                  ? 'Berdasarkan data profil'
                  : 'Mode Lifestyle-Only / Belum diukur'
              }
              trend={bmiTrend}
            />
          </View>

          {/* Cycle Progress Card */}
          <View style={styles.goalCard}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>
                {cycle?.cycle_number
                  ? `Siklus Pemantauan #${cycle.cycle_number}`
                  : 'Siklus Pemantauan 14 Hari'}
              </Text>
              <View style={styles.goalValueRow}>
                <Text style={styles.goalValue}>{daysLogged}</Text>
                <Text style={styles.goalUnit}>/ 14 hari</Text>
              </View>
              <Text style={styles.goalNote}>
                {!cycle
                  ? 'Mulai catat kebiasaan harian di Health Check'
                  : remainingDays > 0
                  ? `${remainingDays} hari lagi menuju evaluasi siklus penuh`
                  : 'Siklus 14 hari lengkap! Siap untuk evaluasi ML'}
              </Text>
            </View>
            <View style={styles.progressRing}>
              <Text style={styles.ringValue}>{cycleProgress}%</Text>
              <Text style={styles.ringLabel}>tercapai</Text>
            </View>
          </View>

          {/* Chart Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Tren BMI Asesmen</Text>
                <Text style={styles.cardSubtitle}>
                  {bmiChartData.length > 0
                    ? `${bmiChartData.length} catatan asesmen terakhir`
                    : 'Belum ada riwayat asesmen BMI'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Monitoring')}>
                <Text style={styles.linkText}>Lihat detail</Text>
              </TouchableOpacity>
            </View>
            <LineChart data={bmiChartData} compact />
          </View>

          {/* Insight Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insight untukmu</Text>
            <Text style={styles.cardSubtitle}>Rekomendasi berdasarkan hasil asesmen terakhirmu</Text>

            <View style={styles.insightList}>
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <View key={idx} style={styles.insightItem}>
                    <View
                      style={[
                        styles.insightIcon,
                        { backgroundColor: idx === 0 ? Colors.successLight : Colors.infoLight },
                      ]}
                    >
                      <Icon
                        name={idx === 0 ? 'favorite' : 'directions-run'}
                        size={20}
                        color={idx === 0 ? Colors.success : Colors.info}
                      />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightTitle}>
                        Rekomendasi Personal #{idx + 1}
                      </Text>
                      <Text style={styles.insightDesc}>{rec}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: Colors.infoLight }]}>
                    <Icon name="assessment" size={20} color={Colors.info} />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Belum ada rekomendasi AI</Text>
                    <Text style={styles.insightDesc}>
                      Lakukan Cek Kondisi di Health Check untuk mendapatkan analisis risiko dan rekomendasi personal.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Lifestyle Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ringkasan gaya hidup siklus ini</Text>
            <Text style={styles.cardSubtitle}>
              {agg
                ? 'Rata-rata indikator dari catatan harian aktifmu'
                : 'Catat aktivitas harian untuk melihat ringkasan indikator'}
            </Text>

            <View style={styles.dailyChart}>
              {lifestyleBars.map((item) => (
                <View key={item.label} style={styles.dailyColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(Math.round(item.ratio * 100), agg ? 8 : 0)}%`,
                          backgroundColor: item.highlight ? Colors.primary : Colors.teal,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
