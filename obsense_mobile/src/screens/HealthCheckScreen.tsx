import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StatusBar,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import CustomButton from '../components/CustomButton';
import { BottomTabParamList } from '../types/navigation';
import { Colors, Spacing } from '../theme';
import styles from '../styles/HealthCheckScreen.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'HealthCheck'>;

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];
const ACTIVITY_LEVELS = ['Ringan', 'Sedang', 'Berat'];
const FREQUENCY_OPTIONS = ['Jarang', 'Kadang-kadang', 'Sering', 'Selalu'];

export default function HealthCheckScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [calculating, setCalculating] = useState(false);
  
  // Form 1: Genetik & Fisik
  const [nama, setNama] = useState('');
  const [usia, setUsia] = useState('');
  const [gender, setGender] = useState('Laki-laki');
  const [tinggiBadan, setTinggiBadan] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [riwayatKeluarga, setRiwayatKeluarga] = useState('Tidak');

  // Form 2: Pola Konsumsi
  const [sayurBuah, setSayurBuah] = useState('Jarang');
  const [makananCepat, setMakananCepat] = useState('Jarang');
  const [minumManis, setMinumManis] = useState('Jarang');
  const [makanMalam, setMakanMalam] = useState('Jarang');

  // Form 3: Gaya Hidup
  const [aktivitasFisik, setAktivitasFisik] = useState('Ringan');
  const [durasiTidur, setDurasiTidur] = useState('');
  const [merokok, setMerokok] = useState('Tidak');
  const [stres, setStres] = useState('Ringan');
  
  const bmi = useMemo(() => {
    const tinggi = Number(tinggiBadan) / 100;
    const berat = Number(beratBadan);
    if (tinggi > 0 && berat > 0) {
      return berat / (tinggi * tinggi);
    }
    return 0;
  }, [tinggiBadan, beratBadan]);

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { text: 'Berat badan kurang', type: 'warning', color: Colors.warning };
    if (bmiValue < 25) return { text: 'Berat badan ideal', type: 'good', color: Colors.success };
    if (bmiValue < 30) return { text: 'Berat badan berlebih', type: 'warning', color: Colors.warning };
    return { text: 'Obesitas', type: 'danger', color: Colors.danger };
  };

  const getRiskLevel = () => {
    let riskScore = 0;
    if (bmi >= 30) riskScore += 3;
    else if (bmi >= 25) riskScore += 2;
    else if (bmi < 18.5) riskScore += 1;
    
    if (Number(usia) > 40) riskScore += 1;
    if (riwayatKeluarga === 'Ya') riskScore += 2;
    if (makananCepat === 'Sering' || makananCepat === 'Selalu') riskScore += 1;
    if (aktivitasFisik === 'Ringan') riskScore += 1;
    if (merokok === 'Ya') riskScore += 2;

    if (riskScore >= 6) return { level: 'Tinggi', color: Colors.danger, desc: 'Risiko tinggi penyakit metabolik. Segera konsultasi dengan tenaga kesehatan.' };
    if (riskScore >= 3) return { level: 'Sedang', color: Colors.warning, desc: 'Risiko sedang. Perlu perhatian pada pola makan dan aktivitas fisik.' };
    return { level: 'Rendah', color: Colors.success, desc: 'Risiko rendah. Pertahankan gaya hidup sehat Anda.' };
  };

  const getRecommendations = () => {
    const recommendations = [];
    const category = getBMICategory(bmi);
    
    if (category.type === 'danger' || category.type === 'warning') {
      recommendations.push({ icon: 'restaurant', text: 'Kurangi porsi makan dan perbanyak sayur' });
      recommendations.push({ icon: 'directions-run', text: 'Olahraga minimal 30 menit, 5x seminggu' });
    }
    if (makananCepat === 'Sering' || makananCepat === 'Selalu') {
      recommendations.push({ icon: 'no-meals', text: 'Batasi makanan cepat saji maksimal 1x seminggu' });
    }
    if (aktivitasFisik === 'Ringan') {
      recommendations.push({ icon: 'fitness-center', text: 'Tingkatkan aktivitas fisik bertahap' });
    }
    if (Number(durasiTidur) < 7) {
      recommendations.push({ icon: 'bedtime', text: 'Tidur cukup 7-8 jam per hari' });
    }
    if (merokok === 'Ya') {
      recommendations.push({ icon: 'smoke-free', text: 'Segera hentikan kebiasaan merokok' });
    }
    if (stres === 'Berat') {
      recommendations.push({ icon: 'self-improvement', text: 'Kelola stres dengan meditasi atau yoga' });
    }

    return recommendations;
  };

  const handleNext = () => {
    if (step === 3) {
      setCalculating(true);
      setTimeout(() => {
        setCalculating(false);
        setStep(4);
      }, 2000);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.navigate('Home');
    } else {
      setStep(step - 1);
    }
  };

  const isStep1Valid = nama.trim() && usia && tinggiBadan && beratBadan;
  const isStep2Valid = true;
  const isStep3Valid = durasiTidur;

  const category = getBMICategory(bmi);
  const risk = getRiskLevel();
  const recommendations = getRecommendations();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Logo size="small" showText={true} />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-none" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Asesmen Risiko Kesehatan</Text>
            <Text style={styles.title}>
              {step === 1 ? 'Data Genetik & Fisik' : step === 2 ? 'Pola Konsumsi' : step === 3 ? 'Gaya Hidup' : 'Hasil Analisis'}
            </Text>
            {step < 4 && (
              <Text style={styles.subtitle}>Langkah {step} dari 3</Text>
            )}
          </View>

          {/* Progress Indicator */}
          {step < 4 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Form 1: Genetik & Fisik</Text>
              
              <Text style={styles.label}>Nama Lengkap *</Text>
              <TextInput style={styles.input} placeholder="Masukkan nama" value={nama} onChangeText={setNama} />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Usia *</Text>
                  <TextInput style={styles.input} placeholder="Tahun" value={usia} onChangeText={setUsia} keyboardType="number-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Jenis Kelamin *</Text>
                  <View style={styles.genderRow}>
                    {GENDER_OPTIONS.map(opt => (
                      <Pressable key={opt} style={[styles.genderButton, gender === opt && styles.genderButtonActive]} onPress={() => setGender(opt)}>
                        <Text style={[styles.genderText, gender === opt && styles.genderTextActive]}>{opt === 'Laki-laki' ? 'L' : 'P'}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Tinggi Badan (cm) *</Text>
                  <TextInput style={styles.input} placeholder="170" value={tinggiBadan} onChangeText={setTinggiBadan} keyboardType="number-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Berat Badan (kg) *</Text>
                  <TextInput style={styles.input} placeholder="70" value={beratBadan} onChangeText={setBeratBadan} keyboardType="decimal-pad" />
                </View>
              </View>

              <Text style={styles.label}>Riwayat Keluarga Obesitas/Diabetes *</Text>
              <View style={styles.optionRow}>
                {['Tidak', 'Ya'].map(opt => (
                  <Pressable key={opt} style={[styles.optionButton, riwayatKeluarga === opt && styles.optionButtonActive]} onPress={() => setRiwayatKeluarga(opt)}>
                    <Text style={[styles.optionText, riwayatKeluarga === opt && styles.optionTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ marginTop: Spacing.base }}>
                <CustomButton title="Lanjut ke Pola Konsumsi" onPress={handleNext} variant="primary" disabled={!isStep1Valid} iconName="arrow-forward" />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Form 2: Pola Konsumsi</Text>
              
              <Text style={styles.label}>Konsumsi Sayur & Buah</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCY_OPTIONS.map(opt => (
                  <Pressable key={opt} style={[styles.freqButton, sayurBuah === opt && styles.freqButtonActive]} onPress={() => setSayurBuah(opt)}>
                    <Text style={[styles.freqText, sayurBuah === opt && styles.freqTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Makanan Cepat Saji</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCY_OPTIONS.map(opt => (
                  <Pressable key={opt} style={[styles.freqButton, makananCepat === opt && styles.freqButtonActive]} onPress={() => setMakananCepat(opt)}>
                    <Text style={[styles.freqText, makananCepat === opt && styles.freqTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Minuman Manis</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCY_OPTIONS.map(opt => (
                  <Pressable key={opt} style={[styles.freqButton, minumManis === opt && styles.freqButtonActive]} onPress={() => setMinumManis(opt)}>
                    <Text style={[styles.freqText, minumManis === opt && styles.freqTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Makan Malam Setelah Jam 20.00</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCY_OPTIONS.map(opt => (
                  <Pressable key={opt} style={[styles.freqButton, makanMalam === opt && styles.freqButtonActive]} onPress={() => setMakanMalam(opt)}>
                    <Text style={[styles.freqText, makanMalam === opt && styles.freqTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ marginTop: Spacing.base }}>
                <CustomButton title="Lanjut ke Gaya Hidup" onPress={handleNext} variant="primary" disabled={!isStep2Valid} iconName="arrow-forward" />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Form 3: Gaya Hidup</Text>
              
              <Text style={styles.label}>Tingkat Aktivitas Fisik</Text>
              <View style={styles.activityRow}>
                {ACTIVITY_LEVELS.map(opt => (
                  <Pressable key={opt} style={[styles.activityButton, aktivitasFisik === opt && styles.activityButtonActive]} onPress={() => setAktivitasFisik(opt)}>
                    <Text style={[styles.activityText, aktivitasFisik === opt && styles.activityTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Durasi Tidur (jam/hari) *</Text>
              <TextInput style={styles.input} placeholder="7" value={durasiTidur} onChangeText={setDurasiTidur} keyboardType="number-pad" />

              <Text style={styles.label}>Kebiasaan Merokok</Text>
              <View style={styles.optionRow}>
                {['Tidak', 'Ya'].map(opt => (
                  <Pressable key={opt} style={[styles.optionButton, merokok === opt && styles.optionButtonActive]} onPress={() => setMerokok(opt)}>
                    <Text style={[styles.optionText, merokok === opt && styles.optionTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Tingkat Stres</Text>
              <View style={styles.activityRow}>
                {['Ringan', 'Sedang', 'Berat'].map(opt => (
                  <Pressable key={opt} style={[styles.activityButton, stres === opt && styles.activityButtonActive]} onPress={() => setStres(opt)}>
                    <Text style={[styles.activityText, stres === opt && styles.activityTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ marginTop: Spacing.base }}>
                <CustomButton 
                  title={calculating ? 'Menganalisis...' : 'Analisis Sekarang'} 
                  onPress={handleNext} 
                  variant="primary" 
                  disabled={!isStep3Valid || calculating} 
                  iconName="assessment" 
                />
              </View>
            </View>
          )}

          {step === 4 && (
            <>
              <View style={[styles.resultCard, { borderColor: category.color }]}>
                <Icon name="monitor-weight" size={48} color={category.color} />
                <Text style={styles.resultLabel}>Indeks Massa Tubuh (BMI)</Text>
                <Text style={styles.resultValue}>{bmi.toFixed(1)}</Text>
                <View style={[styles.resultBadge, { backgroundColor: category.color + '20' }]}>
                  <Text style={[styles.resultBadgeText, { color: category.color }]}>{category.text}</Text>
                </View>
              </View>

              <View style={[styles.resultCard, { borderColor: risk.color }]}>
                <Icon name="warning" size={48} color={risk.color} />
                <Text style={styles.resultLabel}>Tingkat Risiko</Text>
                <Text style={styles.resultValue}>{risk.level}</Text>
                <Text style={styles.resultDesc}>{risk.desc}</Text>
              </View>

              <View style={styles.recommendCard}>
                <Text style={styles.recommendTitle}>Rekomendasi Intervensi</Text>
                {recommendations.map((rec, idx) => (
                  <View key={idx} style={styles.recommendItem}>
                    <View style={styles.recommendIcon}>
                      <Icon name={rec.icon} size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.recommendText}>{rec.text}</Text>
                  </View>
                ))}
              </View>

              <View style={{ gap: Spacing.sm }}>
                <CustomButton title="Lihat Monitoring" onPress={() => navigation.navigate('Monitoring')} variant="primary" iconName="arrow-forward" />
                <CustomButton title="Kembali ke Dashboard" onPress={() => navigation.navigate('Home')} variant="secondary" />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}
