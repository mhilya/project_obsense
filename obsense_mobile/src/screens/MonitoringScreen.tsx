import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import LineChart from '../components/LineChart';
import CustomButton from '../components/CustomButton';
import { BottomTabParamList, RootStackParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/MonitoringScreen.styles';
import { authenticatedRequest } from '../utils/api';
import { getToken, getUserProfile } from '../utils/authStorage';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Monitoring'>,
  NativeStackScreenProps<RootStackParamList>
>;

const PERIODS = ['1 bulan', '3 bulan', '6 bulan', '1 tahun'];

// Type definitions for Assessment API response
interface ShapFactor {
  feature: string;
  value: string | number;
  impact: number;
  description: string;
}

interface Assessment {
  id: number;
  cycle_id?: number;
  user_id: number;
  bmi?: number;
  obesity_class?: string;
  probability_scores?: any;
  risk_level?: string;
  recommendations?: string[];
  lifestyle_prediction?: any;
  shap_factors?: ShapFactor[];
  model_version?: string;
  assessment_date: string;
  created_at: string;
  updated_at: string;
}

interface AssessmentsResponse {
  data: Assessment[];
}

interface AssessmentHistory {
  date: string;
  bmi?: number;
}

interface ChartData {
  date: string;
  weight: number; // Required by LineChart
  bmi?: number;
}

export default function MonitoringScreen({ navigation }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState('3 bulan');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const getObesityClassLabel = (obesityClass?: string): string => {
    if (!obesityClass) return 'N/A';
    const labels: { [key: string]: string } = {
      'Insufficient_Weight': 'Berat badan kurang',
      'Normal_Weight': 'Normal',
      'Overweight_Level_I': 'Kelebihan berat badan tingkat I',
      'Overweight_Level_II': 'Kelebihan berat badan tingkat II',
      'Obesity_Type_I': 'Obesitas tipe I',
      'Obesity_Type_II': 'Obesitas tipe II',
      'Obesity_Type_III': 'Obesitas tipe III',
    };
    return labels[obesityClass] || obesityClass;
  };

  const getRiskLabel = (riskLevel?: string): string => {
    if (!riskLevel) return 'N/A';
    const labels: { [key: string]: string } = {
      'Low': 'Rendah',
      'Moderate': 'Sedang',
      'High': 'Tinggi',
      'Critical': 'Kritis',
    };
    return labels[riskLevel] || riskLevel;
  };

  const getRiskColor = (riskLevel?: string): string => {
    switch (riskLevel) {
      case 'Low':
        return Colors.success;
      case 'Moderate':
        return Colors.warning;
      case 'High':
      case 'Critical':
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getObesityClassColor = (obesityClass?: string): string => {
    if (!obesityClass) return Colors.textSecondary;
    if (obesityClass === 'Insufficient_Weight' || obesityClass === 'Normal_Weight') {
      return Colors.success;
    }
    if (obesityClass.startsWith('Overweight')) {
      return Colors.warning;
    }
    if (obesityClass.startsWith('Obesity')) {
      return Colors.danger;
    }
    return Colors.textSecondary;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPeriodDays = (period: string): number => {
    switch (period) {
      case '1 bulan':
        return 30;
      case '3 bulan':
        return 90;
      case '6 bulan':
        return 180;
      case '1 tahun':
        return 365;
      default:
        return 90;
    }
  };

  const filterAssessmentsByPeriod = (
    assessments: Assessment[],
    period: string
  ): Assessment[] => {
    const days = getPeriodDays(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return assessments.filter(assessment => {
      const assessmentDate = new Date(assessment.assessment_date);
      return assessmentDate >= cutoffDate;
    });
  };

  const calculateWeight = (bmi: number, height: number): number => {
    // weight (kg) = bmi * (height in meters)^2
    return bmi * Math.pow(height / 100, 2);
  };

  // Fetch data from backend
  const fetchAssessments = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
        navigation.navigate('Login');
        return;
      }

      // Fetch user profile to get height
      const userProfile = await getUserProfile();
      if (userProfile?.height) {
        setUserHeight(userProfile.height);
      }

      // Fetch assessments
      const result = await authenticatedRequest<AssessmentsResponse>(
        '/assessments',
        token
      );

      if (!result.success) {
        // Handle 401 Unauthorized - expired or invalid token
        if (result.statusCode === 401) {
          Alert.alert('Sesi Berakhir', 'Silakan login kembali.', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]);
          return;
        }
        // Other errors
        setError('Gagal memuat data. Silakan coba lagi.');
        setAssessments([]);
        return;
      }

      if (result.data?.data) {
        // Sort by date descending (latest first)
        const sortedAssessments = result.data.data.sort((a: Assessment, b: Assessment) => {
          return new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime();
        });
        
        setAssessments(sortedAssessments);
      } else {
        setAssessments([]);
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssessments();
  }, [fetchAssessments]);

  const handleRetry = () => {
    setLoading(true);
    fetchAssessments();
  };

  // Filter assessments by selected period
  const filteredAssessments = filterAssessmentsByPeriod(assessments, selectedPeriod);

  // Prepare chart data
  const chartData: ChartData[] = filteredAssessments
    .filter(a => a.bmi !== null && a.bmi !== undefined)
    .reverse() // Show chronologically for chart
    .map(a => {
      const weight = userHeight ? calculateWeight(a.bmi!, userHeight) : a.bmi!;
      return {
        date: formatDate(a.assessment_date),
        bmi: a.bmi,
        weight: weight, // Use calculated weight or BMI as fallback
      };
    });

  // Latest assessment data
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;
  const latestBMI = latestAssessment?.bmi;
  const latestObesityClass = latestAssessment?.obesity_class;
  const latestRiskLevel = latestAssessment?.risk_level;

  // Calculate BMI change
  const bmiChange = chartData.length > 1 
    ? (chartData[0].bmi || 0) - (chartData[chartData.length - 1].bmi || 0)
    : 0;
  const bmiChangePercent = chartData.length > 1 && chartData[0].bmi
    ? Math.abs((bmiChange / chartData[0].bmi) * 100).toFixed(1)
    : '0.0';

  // Weight change (if height available)
  const weightChange = chartData.length > 1 
    ? chartData[0].weight - chartData[chartData.length - 1].weight
    : 0;

  // Get top SHAP factors from latest assessment
  const topShapFactors = latestAssessment?.shap_factors?.slice(0, 5) || [];

  const getFeatureLabel = (feature: string): string => {
    const labels: { [key: string]: string } = {
      'FCVC': 'Konsumsi Sayur',
      'NCP': 'Jumlah Makan Utama',
      'CH2O': 'Konsumsi Air',
      'FAF': 'Aktivitas Fisik',
      'TUE': 'Waktu Layar',
      'CAEC': 'Ngemil',
      'CALC': 'Konsumsi Alkohol',
      'MTRANS': 'Transportasi',
      'SCC': 'Monitor Kalori',
      'SMOKE': 'Merokok',
      'family_history_with_overweight': 'Riwayat Keluarga',
    };
    return labels[feature] || feature;
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.cardSubtitle, { marginTop: 16 }]}>Memuat data monitoring...</Text>
      </View>
    );
  }

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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

          {/* Error State */}
          {error && (
            <View style={[styles.card, { alignItems: 'center', padding: 24 }]}>
              <Icon name="error-outline" size={48} color={Colors.danger} />
              <Text style={[styles.cardTitle, { marginTop: 16, textAlign: 'center' }]}>
                {error}
              </Text>
              <CustomButton
                title="Coba Lagi"
                onPress={handleRetry}
                variant="primary"
                iconName="refresh"
              />
            </View>
          )}

          {/* Empty State - No Assessments */}
          {!error && assessments.length === 0 && (
            <View style={[styles.card, { alignItems: 'center', padding: 24 }]}>
              <Icon name="assessment" size={64} color={Colors.textMuted} />
              <Text style={[styles.cardTitle, { marginTop: 16, textAlign: 'center' }]}>
                Belum ada data asesmen
              </Text>
              <Text style={[styles.cardSubtitle, { textAlign: 'center', marginTop: 8 }]}>
                Lakukan Health Check untuk memulai monitoring kesehatan Anda.
              </Text>
              <CustomButton
                title="Mulai Health Check"
                onPress={() => navigation.navigate('HealthCheck')}
                variant="primary"
                iconName="favorite"
              />
            </View>
          )}

          {/* Empty State - No Data for Selected Period */}
          {!error && assessments.length > 0 && filteredAssessments.length === 0 && (
            <View style={[styles.card, { alignItems: 'center', padding: 24 }]}>
              <Icon name="calendar-today" size={48} color={Colors.textMuted} />
              <Text style={[styles.cardTitle, { marginTop: 16, textAlign: 'center' }]}>
                Tidak ada data untuk periode ini
              </Text>
              <Text style={[styles.cardSubtitle, { textAlign: 'center', marginTop: 8 }]}>
                Pilih periode yang lebih panjang atau lakukan asesmen baru.
              </Text>
            </View>
          )}

          {/* BMI Trend Chart */}
          {!error && chartData.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Tren BMI</Text>
                  <Text style={styles.cardSubtitle}>
                    {bmiChange !== 0 
                      ? `${bmiChange > 0 ? 'Turun' : 'Naik'} ${Math.abs(bmiChange).toFixed(1)} poin dalam ${selectedPeriod}`
                      : `Data ${selectedPeriod} terakhir`
                    }
                    {weightChange !== 0 && userHeight && (
                      ` (~${Math.abs(weightChange).toFixed(1)} kg)`
                    )}
                  </Text>
                </View>
                {bmiChange !== 0 && (
                  <View style={styles.trendBadge}>
                    <Text style={styles.trendText}>
                      {bmiChange > 0 ? '↓' : '↑'} {bmiChangePercent}%
                    </Text>
                  </View>
                )}
              </View>
              <LineChart data={chartData} />
            </View>
          )}

          {/* Info banner if no BMI data but have assessments */}
          {!error && assessments.length > 0 && chartData.length === 0 && (
            <View style={[styles.card, { backgroundColor: Colors.info + '10' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="info" size={24} color={Colors.info} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: Colors.info }]}>
                    Data BMI belum tersedia
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: Colors.textSecondary }]}>
                    Lengkapi tinggi dan berat badan di Profil untuk melihat grafik BMI.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Current BMI Status */}
          {!error && latestAssessment && latestBMI && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Kondisi saat ini</Text>
              <Text style={styles.bmiValue}>{latestBMI.toFixed(1)}</Text>
              <View
                style={[
                  styles.bmiPill,
                  { backgroundColor: getObesityClassColor(latestObesityClass) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.bmiPillText,
                    { color: getObesityClassColor(latestObesityClass) },
                  ]}
                >
                  {getObesityClassLabel(latestObesityClass)}
                </Text>
              </View>

              {/* Risk Level */}
              {latestRiskLevel && (
                <View style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={[styles.cardSubtitle, { marginBottom: 8 }]}>
                    Tingkat Risiko
                  </Text>
                  <View
                    style={[
                      styles.bmiPill,
                      { backgroundColor: getRiskColor(latestRiskLevel) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bmiPillText,
                        { color: getRiskColor(latestRiskLevel) },
                      ]}
                    >
                      {getRiskLabel(latestRiskLevel)}
                    </Text>
                  </View>
                </View>
              )}

              {/* BMI Scale */}
              <View style={styles.bmiScale}>
                <View
                  style={[
                    styles.bmiBar,
                    {
                      backgroundColor: Colors.warning,
                      opacity:
                        latestObesityClass === 'Insufficient_Weight' ? 1 : 0.3,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bmiBar,
                    {
                      backgroundColor: Colors.success,
                      opacity: latestObesityClass === 'Normal_Weight' ? 1 : 0.3,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bmiBar,
                    {
                      backgroundColor: Colors.warning,
                      opacity: latestObesityClass?.startsWith('Overweight') ? 1 : 0.3,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bmiBar,
                    {
                      backgroundColor: Colors.danger,
                      opacity: latestObesityClass?.startsWith('Obesity') ? 1 : 0.3,
                    },
                  ]}
                />
              </View>
              <View style={styles.bmiScaleLabels}>
                <Text style={styles.bmiScaleLabel}>Kurang</Text>
                <Text style={styles.bmiScaleLabel}>Normal</Text>
                <Text style={styles.bmiScaleLabel}>Berlebih</Text>
                <Text style={styles.bmiScaleLabel}>Obesitas</Text>
              </View>

              {/* Target message based on current status */}
              <Text style={styles.bmiNote}>
                {latestObesityClass === 'Normal_Weight'
                  ? 'Pertahankan pola hidup sehat Anda saat ini.'
                  : latestObesityClass === 'Insufficient_Weight'
                  ? 'Tingkatkan asupan nutrisi untuk mencapai berat badan ideal.'
                  : 'Target berikutnya: capai BMI normal (18.5-24.9) dengan pola hidup sehat.'}
              </Text>
            </View>
          )}

          {/* SHAP Factors Visualization (replacing daily activity) */}
          {!error && topShapFactors.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Faktor Risiko & Protektif</Text>
                  <Text style={styles.cardSubtitle}>
                    Faktor yang memengaruhi risiko obesitas Anda
                  </Text>
                </View>
              </View>

              {/* SHAP Factors List */}
              <View style={{ marginTop: 16 }}>
                {topShapFactors.map((factor, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      backgroundColor: Colors.background,
                      borderRadius: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: factor.impact > 0 ? Colors.danger : Colors.success,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Icon
                          name={factor.impact > 0 ? 'arrow-upward' : 'arrow-downward'}
                          size={20}
                          color={factor.impact > 0 ? Colors.danger : Colors.success}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: Colors.textPrimary,
                            marginLeft: 8,
                          }}
                        >
                          {getFeatureLabel(factor.feature)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: Colors.textSecondary,
                          fontWeight: '500',
                        }}
                      >
                        {factor.value}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: Colors.border,
                        borderRadius: 3,
                        marginTop: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${Math.min(Math.abs(factor.impact) * 100, 100)}%`,
                          backgroundColor: factor.impact > 0 ? Colors.danger : Colors.success,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: Colors.textSecondary,
                        marginTop: 6,
                      }}
                    >
                      {factor.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* History Table */}
          {!error && filteredAssessments.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Riwayat asesmen</Text>
                  <Text style={styles.cardSubtitle}>
                    {filteredAssessments.length} asesmen dalam {selectedPeriod} terakhir
                  </Text>
                </View>
              </View>

              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableHeader, styles.colDate]}>Tanggal</Text>
                  <Text style={[styles.tableHeader, styles.colBMI]}>BMI</Text>
                  <Text style={[styles.tableHeader, styles.colCategory]}>Kategori</Text>
                  <Text style={[styles.tableHeader, styles.colChange]}>Risiko</Text>
                </View>

                {/* Table Body */}
                {filteredAssessments.slice(0, 10).map((assessment, index) => (
                  <TouchableOpacity
                    key={assessment.id}
                    style={styles.tableRow}
                    onPress={() => {
                      navigation.navigate('AssessmentResult', {
                        assessmentId: assessment.id,
                      });
                    }}
                  >
                    <Text style={[styles.tableCell, styles.colDate]}>
                      {formatDate(assessment.assessment_date)}
                    </Text>
                    <Text style={[styles.tableCell, styles.colBMI]}>
                      {assessment.bmi ? assessment.bmi.toFixed(1) : 'N/A'}
                    </Text>
                    <View style={styles.colCategory}>
                      <View style={styles.categoryPill}>
                        <Text
                          style={[
                            styles.categoryPillText,
                            { color: getObesityClassColor(assessment.obesity_class) },
                          ]}
                        >
                          {getObesityClassLabel(assessment.obesity_class)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.colChange}>
                      <View
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: getRiskColor(assessment.risk_level) + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            { color: getRiskColor(assessment.risk_level) },
                          ]}
                        >
                          {getRiskLabel(assessment.risk_level)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
