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
  label?: string;
  value: string | number;
  impact: number;
  description: string;
}

interface ScenarioResult {
  prediction?: number;
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
  id?: number;
  evaluator_name: string;
  evaluation_date: string;
  notes: string;
  clinical_recommendation?: string;
  adjusted_risk_level?: string;
  role: string;
}

interface AssessmentHistory {
  id: number;
  assessment_date: string;
  bmi?: number;
  obesity_class: string;
  risk_level: string;
}

const VALID_RISKS = ['Low', 'Moderate', 'High', 'Critical'] as const;
type RiskLevel = (typeof VALID_RISKS)[number];

const normalizeRiskLevel = (risk?: string): RiskLevel => {
  if (risk && (VALID_RISKS as readonly string[]).includes(risk)) {
    return risk as RiskLevel;
  }
  return 'Low';
};

const getMaxProbability = (scores?: Record<string, number> | null, fallback?: number): number => {
  if (typeof fallback === 'number' && !Number.isNaN(fallback)) {
    return fallback;
  }
  if (scores && typeof scores === 'object') {
    const values = Object.values(scores).filter((v) => typeof v === 'number');
    if (values.length > 0) {
      return Math.max(...values);
    }
  }
  return 0;
};

const normalizeShapFactors = (rawFactors: any): ShapFactor[] => {
  if (!Array.isArray(rawFactors)) return [];
  return rawFactors.map((item: any) => {
    const rawShap =
      typeof item?.shap_value === 'number'
        ? item.shap_value
        : typeof item?.impact === 'number'
        ? item.impact
        : 0;
    const isRiskUp =
      typeof item?.impact === 'string' ? item.impact === 'risk_up' : rawShap >= 0;
    const numericImpact = isRiskUp ? Math.abs(rawShap) : -Math.abs(rawShap);
    const formattedValue =
      item?.value !== undefined && item?.value !== null
        ? item.value
        : `${rawShap >= 0 ? '+' : ''}${rawShap.toFixed(3)}`;
    const directionText = isRiskUp
      ? 'Meningkatkan risiko obesitas'
      : 'Faktor pelindung terhadap risiko obesitas';
    const description =
      item?.description ||
      (item?.category ? `${item.category} • ${directionText}` : directionText);

    return {
      feature: String(item?.feature || ''),
      label: item?.label ? String(item.label) : undefined,
      value: formattedValue,
      impact: numericImpact,
      description,
    };
  });
};

const normalizeAssessmentResponse = (rawPayload: any): Assessment | null => {
  if (!rawPayload || typeof rawPayload !== 'object') return null;

  // Handle both POST /assessments/predict ({ data, prediction }) and GET /assessments/:id ({ data })
  const saved = rawPayload.data && typeof rawPayload.data === 'object' ? rawPayload.data : rawPayload;
  const pred = rawPayload.prediction && typeof rawPayload.prediction === 'object' ? rawPayload.prediction : null;

  if (!saved || typeof saved !== 'object' || saved.id === undefined) {
    return null;
  }

  const rawBmi = saved.bmi ?? pred?.bmi;
  const bmi =
    rawBmi !== null && rawBmi !== undefined && !Number.isNaN(Number(rawBmi))
      ? Number(rawBmi)
      : undefined;

  let scenarioA: ScenarioResult | undefined;
  if (pred?.scenario_a_full) {
    if (pred.scenario_a_full.available) {
      scenarioA = {
        obesity_class: pred.scenario_a_full.obesity_class || 'N/A',
        risk_level: normalizeRiskLevel(pred.scenario_a_full.risk_level),
        probability: getMaxProbability(
          pred.scenario_a_full.probability_scores,
          pred.scenario_a_full.probability
        ),
      };
    }
  } else if (saved.scenario_a_full && saved.scenario_a_full.available !== false) {
    scenarioA = {
      obesity_class: saved.scenario_a_full.obesity_class || 'N/A',
      risk_level: normalizeRiskLevel(saved.scenario_a_full.risk_level),
      probability: getMaxProbability(
        saved.scenario_a_full.probability_scores,
        saved.scenario_a_full.probability
      ),
    };
  } else if (bmi !== undefined && saved.obesity_class) {
    scenarioA = {
      obesity_class: saved.obesity_class,
      risk_level: normalizeRiskLevel(saved.risk_level),
      probability: getMaxProbability(saved.probability_scores),
    };
  }

  const rawScenarioB =
    pred?.scenario_b_lifestyle ??
    saved.lifestyle_prediction ??
    saved.scenario_b_lifestyle ??
    {
      obesity_class: saved.obesity_class || 'N/A',
      risk_level: saved.risk_level,
      probability_scores: saved.probability_scores,
    };

  const scenarioB: ScenarioResult = {
    obesity_class: rawScenarioB?.obesity_class || saved.obesity_class || 'N/A',
    risk_level: normalizeRiskLevel(rawScenarioB?.risk_level || saved.risk_level),
    probability: getMaxProbability(
      rawScenarioB?.probability_scores ?? saved.probability_scores,
      rawScenarioB?.probability
    ),
  };

  const rawShap = pred?.top_shap_factors ?? saved.shap_factors ?? saved.top_shap_factors ?? [];
  const rawRecs = pred?.recommendations ?? saved.recommendations ?? [];

  return {
    id: Number(saved.id),
    user_id: Number(saved.user_id || 0),
    cycle_id: saved.cycle_id !== undefined && saved.cycle_id !== null ? Number(saved.cycle_id) : undefined,
    assessment_date: saved.assessment_date || saved.created_at || new Date().toISOString(),
    bmi,
    scenario_a_full: scenarioA,
    scenario_b_lifestyle: scenarioB,
    top_shap_factors: normalizeShapFactors(rawShap),
    recommendations: Array.isArray(rawRecs) ? rawRecs : [],
    admin_evaluations: Array.isArray(saved.admin_evaluations) ? saved.admin_evaluations : undefined,
  };
};

const formatObesityClass = (cls?: string): string => {
  if (!cls) return 'N/A';
  return cls.replace(/_/g, ' ');
};

export default function AssessmentResultScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [evaluations, setEvaluations] = useState<AdminEvaluation[]>([]);
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
        result = await authenticatedRequest<any>(
          `/assessments/${assessmentId}`,
          token
        );
      } else {
        // Fetch latest assessment (get first from history)
        const historyResult = await authenticatedRequest<any>(
          '/assessments',
          token
        );

        const rawList = Array.isArray(historyResult.data)
          ? historyResult.data
          : historyResult.data?.data;

        if (historyResult.success && Array.isArray(rawList) && rawList.length > 0) {
          const latestId = rawList[0].id;
          result = await authenticatedRequest<any>(
            `/assessments/${latestId}`,
            token
          );
        } else if (!historyResult.success) {
          setError(historyResult.error || 'Gagal memuat data asesmen');
          return;
        } else {
          // No assessments yet - this is not an error, just empty state
          setAssessment(null);
          setHasHeightWeight(false);
          return;
        }
      }

      if (result.success && result.data) {
        const normalized = normalizeAssessmentResponse(result.data);
        if (normalized) {
          setAssessment(normalized);
          setHasHeightWeight(normalized.bmi !== undefined && !!normalized.scenario_a_full);
          setError(null);
        } else {
          setError('Format data asesmen tidak valid');
        }
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

      const result = await authenticatedRequest<any>('/assessments', token);
      const rawList = Array.isArray(result.data)
        ? result.data
        : result.data?.data;

      if (result.success && Array.isArray(rawList)) {
        const historyData: AssessmentHistory[] = rawList.map((item: any) => ({
          id: Number(item.id),
          assessment_date: item.assessment_date || item.created_at,
          bmi:
            item.bmi !== null && item.bmi !== undefined && !Number.isNaN(Number(item.bmi))
              ? Number(item.bmi)
              : undefined,
          obesity_class:
            item.obesity_class || item.lifestyle_prediction?.obesity_class || 'N/A',
          risk_level:
            item.risk_level || item.lifestyle_prediction?.risk_level || 'Low',
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

      const result = await authenticatedRequest<any>(
        '/assessments/predict',
        token,
        { method: 'POST' }
      );

      if (result.success && result.data) {
        const normalized = normalizeAssessmentResponse(result.data);
        if (normalized) {
          setAssessment(normalized);
          setHasHeightWeight(normalized.bmi !== undefined && !!normalized.scenario_a_full);
          setError(null);
          fetchHistory(); // Refresh history
          Alert.alert('Sukses', 'Analisis risiko obesitas berhasil dilakukan!');
        } else {
          setError('Format respons prediksi tidak valid');
        }
      } else {
        if (result.statusCode === 404) {
          Alert.alert(
            'Data Belum Lengkap',
            result.error || 'Siklus pemantauan atau profil belum ditemukan. Lengkapi Health Check terlebih dahulu.'
          );
        } else if (result.statusCode === 409) {
          Alert.alert(
            'Data Tidak Cukup',
            result.error || 'Belum ada siklus aktif atau data kebiasaan hidup belum lengkap. Lengkapi di Health Check terlebih dahulu.'
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

  // Fetch admin evaluations from admin-service
  const fetchEvaluations = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const result = await authenticatedRequest<any>('/evaluations', token);
      const rawList = Array.isArray(result.data)
        ? result.data
        : result.data?.data;

      if (result.success && Array.isArray(rawList)) {
        const mapped: AdminEvaluation[] = rawList.map((item: any) => ({
          id: item.id,
          evaluator_name: item.admin_name || item.evaluator_name || 'Tenaga Kesehatan',
          evaluation_date: item.created_at || item.evaluation_date || new Date().toISOString(),
          notes: item.evaluation_notes || item.notes || '',
          clinical_recommendation: item.clinical_recommendation || undefined,
          adjusted_risk_level: item.adjusted_risk_level || undefined,
          role: item.role || 'Admin Klinis',
        }));
        setEvaluations(mapped);
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAssessment(route.params?.assessmentId),
      fetchHistory(),
      fetchEvaluations(),
    ]);
    setRefreshing(false);
  }, [fetchAssessment, fetchHistory, fetchEvaluations, route.params?.assessmentId]);

  useEffect(() => {
    // If triggerPrediction flag is set, run prediction immediately
    if (route.params?.triggerPrediction) {
      handleAnalyzeRisk();
    } else {
      fetchAssessment(route.params?.assessmentId);
    }
    fetchHistory();
    fetchEvaluations();
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

  const getFeatureLabel = (feature: string, backendLabel?: string) => {
    if (backendLabel) return backendLabel;
    const labels: { [key: string]: string } = {
      'Age': 'Usia',
      'Gender': 'Jenis Kelamin',
      'FAVC': 'Makanan Tinggi Kalori',
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
          {assessment && !hasHeightWeight && (
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
                          {formatObesityClass(assessment.scenario_a_full.obesity_class)}
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
                        {formatObesityClass(assessment.scenario_b_lifestyle.obesity_class)}
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
              {assessment.top_shap_factors.length > 0 && (() => {
                const maxAbsImpact = Math.max(
                  ...assessment.top_shap_factors.map((f) => Math.abs(f.impact)),
                  0.001
                );
                return (
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
                                {getFeatureLabel(factor.feature, factor.label)}
                              </Text>
                            </View>
                            <Text style={styles.shapValue}>{factor.value}</Text>
                          </View>
                          <View style={styles.shapBarContainer}>
                            <View
                              style={[
                                styles.shapBar,
                                {
                                  width: `${Math.max(
                                    Math.min((Math.abs(factor.impact) / maxAbsImpact) * 100, 100),
                                    10
                                  )}%`,
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
                );
              })()}

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

          {/* Admin Evaluations (from admin-service) */}
          {(() => {
            const evalList =
              evaluations.length > 0
                ? evaluations
                : assessment?.admin_evaluations || [];
            if (evalList.length === 0) return null;
            return (
              <View style={styles.evaluationCard}>
                <Text style={styles.evaluationTitle}>Evaluasi Tenaga Kesehatan</Text>
                {evalList.map((evaluation, idx) => (
                  <View key={evaluation.id ?? idx} style={styles.evaluationItem}>
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
                    {evaluation.adjusted_risk_level && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[styles.resultLabel, { marginRight: 8 }]}>
                          Penyesuaian Risiko Klinis:
                        </Text>
                        <View
                          style={[
                            styles.riskBadge,
                            {
                              backgroundColor:
                                getRiskColor(evaluation.adjusted_risk_level) + '20',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.riskBadgeText,
                              { color: getRiskColor(evaluation.adjusted_risk_level) },
                            ]}
                          >
                            {getRiskLabel(evaluation.adjusted_risk_level)}
                          </Text>
                        </View>
                      </View>
                    )}
                    <Text style={styles.evaluationNotes}>{evaluation.notes}</Text>
                    {evaluation.clinical_recommendation ? (
                      <Text style={[styles.evaluationNotes, { marginTop: 6, fontWeight: '600' }]}>
                        Rekomendasi Klinis: {evaluation.clinical_recommendation}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })()}

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
                        {item.bmi !== undefined ? `BMI: ${item.bmi.toFixed(1)} | ` : ''}
                        {formatObesityClass(item.obesity_class)}
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
