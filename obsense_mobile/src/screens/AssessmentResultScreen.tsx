import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import CustomButton from '../components/CustomButton';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/AssessmentResultScreen.styles';
import { authenticatedRequest } from '../utils/api';
import { getToken } from '../utils/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'AssessmentResult'>;

// Type definitions for API responses
interface ShapFactor {
  feature: string;
  value: string | number;
  impact: number;
  description: string;
}

interface ScenarioResult {
  prediction: number;
  probability: number;
  obesity_class: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
}

interface Assessment {
  id: number;
  user_id: number;
  cycle_id?: number;
  assessment_date: string;
  bmi?: number;
  scenario_a_full?: ScenarioResult;
  scenario_b_lifestyle: ScenarioResult;
  top_shap_factors: ShapFactor[];
  recommendations: string[];
  // Phase 5: Admin evaluations populated after doctor/nutritionist review
  admin_evaluations?: AdminEvaluation[];
}

interface AdminEvaluation {
  evaluator_name: string;
  evaluation_date: string;
  notes: string;
  role: string;
}

interface AssessmentHistory {
  id: number;
  assessment_date: string;
  bmi?: number;
  obesity_class: string;
  risk_level: string;
}

export default function AssessmentResultScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [hasHeightWeight, setHasHeightWeight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch assessment data
  const fetchAssessment = useCallback(async (assessmentId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
        navigation.replace('Login');
        return;
      }

      let result;
      if (assessmentId) {
        // Fetch specific assessment
        result = await authenticatedRequest<Assessment>(
          `/assessments/${assessmentId}`,
          token
        );
      } else {
        // Fetch latest assessment (get first from history)
        const historyResult = await authenticatedRequest<AssessmentHistory[]>(
          '/assessments',
          token
        );
        
        if (historyResult.success && historyResult.data && historyResult.data.length > 0) {
          const latestId = historyResult.data[0].id;
          result = await authenticatedRequest<Assessment>(
            `/assessments/${latestId}`,
            token
          );
        } else {
          // No assessments yet - this is not an error, just empty state
          setAssessment(null);
          return;
        }
      }

      if (result.success && result.data) {
        setAssessment(result.data);
        setHasHeightWeight(!!result.data.bmi && !!result.data.scenario_a_full);
        setError(null);
      } else {
        setError(result.error || 'Gagal memuat data asesmen');
      }
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  // Fetch assessment history
  const fetchHistory = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const result = await authenticatedRequest<any[]>('/assessments', token);
      
      if (result.success && result.data) {
        const historyData: AssessmentHistory[] = result.data.map((item: any) => ({
          id: item.id,
          assessment_date: item.assessment_date,
          bmi: item.bmi,
          // Backend may return lifestyle_prediction as nested object or flat fields
          obesity_class: item.lifestyle_prediction?.obesity_class || item.obesity_class || 'N/A',
          risk_level: item.lifestyle_prediction?.risk_level || item.risk_level || 'N/A',
        }));
        setHistory(historyData);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, []);

  // Trigger new assessment
  const handleAnalyzeRisk = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
        navigation.replace('Login');
        return;
      }

      const result = await authenticatedRequest<Assessment>(
        '/assessments/predict',
        token,
        { method: 'POST' }
      );

      if (result.success && result.data) {
        setAssessment(result.data);
        setHasHeightWeight(!!result.data.bmi && !!result.data.scenario_a_full);
        setError(null);
        fetchHistory(); // Refresh history
        Alert.alert('Sukses', 'Analisis risiko obesitas berhasil dilakukan!');
      } else {
        if (result.statusCode === 404) {
          Alert.alert(
            'Profil Belum Lengkap',
            'Silakan lengkapi profil Anda terlebih dahulu di menu Profil.'
          );
        } else if (result.statusCode === 409) {
          Alert.alert(
            'Data Tidak Cukup',
            'Belum ada siklus aktif atau data kebiasaan hidup belum lengkap. Lengkapi di Health Check terlebih dahulu.'
          );
        } else {
          setError(result.error || 'Gagal melakukan analisis');
        }
      }
    } catch (err) {
      console.error('Error analyzing risk:', err);
      setError('Terjadi kesalahan saat melakukan analisis');
    } finally {
      setLoading(false);
    }
  }, [navigation, fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAssessment(route.params?.assessmentId),
      fetchHistory(),
    ]);
    setRefreshing(false);
  }, [fetchAssessment, fetchHistory, route.params?.assessmentId]);

  useEffect(() => {
    // If triggerPrediction flag is set, run prediction immediately
    if (route.params?.triggerPrediction) {
      handleAnalyzeRisk();
    } else {
      fetchAssessment(route.params?.assessmentId);
    }
    fetchHistory();
    // Dependencies are managed via callbacks to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.assessmentId, route.params?.triggerPrediction]);

  const getRiskColor = (riskLevel: string) => {
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

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return 'Rendah';
      case 'Moderate':
        return 'Sedang';
      case 'High':
        return 'Tinggi';
      case 'Critical':
        return 'Kritis';
      default:
        return riskLevel;
    }
  };

  const getFeatureLabel = (feature: string) => {
    // Note: These labels are hardcoded. If ML model features change,
    // consider fetching from backend API or including translations in prediction response
    const labels: { [key: string]: string } = {
      'FCVC': 'Konsumsi Sayur',
      'NCP': 'Jumlah Makan Utama',
      'CH2O': 'Konsumsi Air',
      'FAF': 'Aktivitas Fisik',
      'TUE': 'Waktu Layar (Screen Time)',
      'CAEC': 'Ngemil',
      'CALC': 'Konsumsi Alkohol',
      'MTRANS': 'Transportasi',
      'SCC': 'Monitor Kalori',
      'SMOKE': 'Merokok',
      'family_history_with_overweight': 'Riwayat Keluarga',
    };
    return labels[feature] || feature;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading && !assessment) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data asesmen...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
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
          {/* Title */}
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Hasil Asesmen</Text>
            <Text style={styles.title}>Hasil Asesmen & Prediksi Risiko</Text>
            {assessment && (
              <Text style={styles.subtitle}>
                Terakhir diperbarui: {formatDate(assessment.assessment_date)}
              </Text>
            )}
          </View>

          {/* Info Banner if no height/weight */}
          {!hasHeightWeight && (
            <View style={styles.infoBanner}>
              <Icon name="info" size={24} color={Colors.info} />
              <Text style={styles.infoBannerText}>
                Prediksi dihitung murni dari pola makan & aktivitas fisik. Lengkapi data
                tinggi & berat badan di Profil untuk analisis lebih akurat.
              </Text>
            </View>
          )}

          {assessment ? (
            <>
              {/* Scenario Results */}
              {hasHeightWeight && assessment.scenario_a_full && (
                <View style={styles.scenarioCard}>
                  <View style={styles.scenarioHeader}>
                    <Icon name="monitor-weight" size={32} color={Colors.primary} />
                    <Text style={styles.scenarioTitle}>
                      Status Saat Ini (Skenario A - Klinis/BMI)
                    </Text>
                  </View>
                  <View style={styles.scenarioContent}>
                    <View style={styles.bmiRow}>
                      <Text style={styles.bmiLabel}>BMI:</Text>
                      <Text style={styles.bmiValue}>{assessment.bmi?.toFixed(1)}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Kelas Obesitas</Text>
                        <Text style={styles.resultValue}>
                          {assessment.scenario_a_full.obesity_class}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Tingkat Risiko</Text>
                        <View
                          style={[
                            styles.riskBadge,
                            {
                              backgroundColor:
                                getRiskColor(assessment.scenario_a_full.risk_level) + '20',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.riskBadgeText,
                              {
                                color: getRiskColor(assessment.scenario_a_full.risk_level),
                              },
                            ]}
                          >
                            {getRiskLabel(assessment.scenario_a_full.risk_level)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Scenario B - Lifestyle */}
              <View style={styles.scenarioCard}>
                <View style={styles.scenarioHeader}>
                  <Icon name="directions-run" size={32} color={Colors.secondary} />
                  <Text style={styles.scenarioTitle}>
                    Proyeksi Risiko Gaya Hidup (Skenario B - Lifestyle-Only)
                  </Text>
                </View>
                <View style={styles.scenarioContent}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Prediksi Kelas</Text>
                      <Text style={styles.resultValue}>
                        {assessment.scenario_b_lifestyle.obesity_class}
                      </Text>
                    </View>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Tingkat Risiko</Text>
                      <View
                        style={[
                          styles.riskBadge,
                          {
                            backgroundColor:
                              getRiskColor(assessment.scenario_b_lifestyle.risk_level) + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.riskBadgeText,
                            {
                              color: getRiskColor(assessment.scenario_b_lifestyle.risk_level),
                            },
                          ]}
                        >
                          {getRiskLabel(assessment.scenario_b_lifestyle.risk_level)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {hasHeightWeight &&
                    assessment.scenario_a_full &&
                    assessment.scenario_b_lifestyle.risk_level !==
                      assessment.scenario_a_full.risk_level && (
                      <View style={styles.warningBox}>
                        <Icon name="warning" size={20} color={Colors.warning} />
                        <Text style={styles.warningText}>
                          Pola hidup Anda saat ini berisiko membawa ke tingkat obesitas yang
                          lebih tinggi.
                        </Text>
                      </View>
                    )}
                </View>
              </View>

              {/* SHAP Factors Visualization */}
              <View style={styles.shapCard}>
                <Text style={styles.shapTitle}>Faktor Pendorong (Explainable AI)</Text>
                <Text style={styles.shapSubtitle}>
                  Top {assessment.top_shap_factors.length} faktor yang memengaruhi hasil
                  prediksi Anda
                </Text>
                <View style={styles.shapList}>
                  {assessment.top_shap_factors.map((factor, index) => (
                    <View key={index} style={styles.shapItem}>
                      <View style={styles.shapHeader}>
                        <View style={styles.shapLabelRow}>
                          <Icon
                            name={factor.impact > 0 ? 'arrow-upward' : 'arrow-downward'}
                            size={20}
                            color={factor.impact > 0 ? Colors.danger : Colors.success}
                          />
                          <Text style={styles.shapFeature}>
                            {getFeatureLabel(factor.feature)}
                          </Text>
                        </View>
                        <Text style={styles.shapValue}>{factor.value}</Text>
                      </View>
                      <View style={styles.shapBarContainer}>
                        <View
                          style={[
                            styles.shapBar,
                            {
                              width: `${Math.min(Math.abs(factor.impact) * 100, 100)}%`,
                              backgroundColor:
                                factor.impact > 0 ? Colors.danger : Colors.success,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.shapDescription}>{factor.description}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recommendations */}
              {assessment.recommendations.length > 0 && (
                <View style={styles.recommendCard}>
                  <Text style={styles.recommendTitle}>Rekomendasi Personal</Text>
                  {assessment.recommendations.map((rec, idx) => (
                    <View key={idx} style={styles.recommendItem}>
                      <View style={styles.recommendIcon}>
                        <Icon name="check-circle" size={20} color={Colors.primary} />
                      </View>
                      <Text style={styles.recommendText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Admin Evaluations (Phase 5) */}
              {assessment.admin_evaluations && assessment.admin_evaluations.length > 0 && (
                <View style={styles.evaluationCard}>
                  <Text style={styles.evaluationTitle}>Evaluasi Tenaga Kesehatan</Text>
                  {assessment.admin_evaluations.map((evaluation, idx) => (
                    <View key={idx} style={styles.evaluationItem}>
                      <View style={styles.evaluationHeader}>
                        <Icon name="verified-user" size={24} color={Colors.info} />
                        <View style={styles.evaluationInfo}>
                          <Text style={styles.evaluatorName}>
                            {evaluation.evaluator_name}
                          </Text>
                          <Text style={styles.evaluatorRole}>{evaluation.role}</Text>
                        </View>
                        <Text style={styles.evaluationDate}>
                          {formatDate(evaluation.evaluation_date)}
                        </Text>
                      </View>
                      <Text style={styles.evaluationNotes}>{evaluation.notes}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : error ? (
            <View style={styles.errorState}>
              <Icon name="error-outline" size={64} color={Colors.danger} />
              <Text style={styles.errorStateTitle}>Gagal Memuat Data</Text>
              <Text style={styles.errorStateText}>{error}</Text>
              <CustomButton
                title="Coba Lagi"
                onPress={() => {
                  if (route.params?.triggerPrediction) {
                    handleAnalyzeRisk();
                  } else {
                    fetchAssessment(route.params?.assessmentId);
                  }
                }}
                variant="primary"
                iconName="refresh"
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="assessment" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Belum Ada Asesmen</Text>
              <Text style={styles.emptyStateText}>
                Lakukan analisis risiko obesitas untuk melihat hasil prediksi dan
                rekomendasi personal.
              </Text>
            </View>
          )}

          {/* Assessment History */}
          {history.length > 0 && (
            <View style={styles.historyCard}>
              <Text style={styles.historyTitle}>Riwayat Asesmen</Text>
              {history.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyItem}
                  onPress={() => {
                    navigation.push('AssessmentResult', { assessmentId: item.id });
                  }}
                >
                  <View style={styles.historyLeft}>
                    <Icon name="calendar-today" size={20} color={Colors.textSecondary} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDate}>{formatDate(item.assessment_date)}</Text>
                      <Text style={styles.historyDetail}>
                        {item.bmi ? `BMI: ${item.bmi.toFixed(1)} | ` : ''}
                        {item.obesity_class}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(item.risk_level) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskBadgeText,
                        { color: getRiskColor(item.risk_level) },
                      ]}
                    >
                      {getRiskLabel(item.risk_level)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <CustomButton
              title="Analisis Risiko Obesitas Saya"
              onPress={handleAnalyzeRisk}
              variant="primary"
              iconName="assessment"
              loading={loading}
              disabled={loading}
            />
            <CustomButton
              title="Lihat Monitoring"
              onPress={() => {
                // Navigate to Main tab navigator and switch to Monitoring tab
                navigation.navigate('Main', { screen: 'Monitoring' } as any);
              }}
              variant="secondary"
              iconName="show-chart"
            />
            <CustomButton
              title="Kembali ke Dashboard"
              onPress={() => navigation.navigate('Main')}
              variant="outline"
              iconName="home"
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}
