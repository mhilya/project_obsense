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
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import CustomButton from '../components/CustomButton';
import { BottomTabParamList, RootStackParamList } from '../types/navigation';
import { Colors, Spacing } from '../theme';
import styles from '../styles/HealthCheckScreen.styles';
import { authenticatedRequest } from '../utils/api';
import { getToken } from '../utils/authStorage';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'HealthCheck'>,
  NativeStackScreenProps<RootStackParamList>
>;

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

  const handleNext = async () => {
    if (step === 3) {
      setCalculating(true);
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
          navigation.navigate('Login');
          return;
        }

        // Prepare form data for cycle creation/update
        const cycleData = {
          // Form 1: Genetik & Fisik
          family_history_with_overweight: riwayatKeluarga === 'Ya',
          
          // Form 2: Pola Konsumsi
          FCVC: sayurBuah === 'Selalu' ? 3 : sayurBuah === 'Sering' ? 2 : sayurBuah === 'Kadang-kadang' ? 1 : 0,
          NCP: 3, // Default main meals
          CAEC: makananCepat === 'Selalu' ? 3 : makananCepat === 'Sering' ? 2 : makananCepat === 'Kadang-kadang' ? 1 : 0,
          CH2O: minumManis === 'Jarang' ? 2 : 1, // Inverse for water consumption
          
          // Form 3: Gaya Hidup
          FAF: aktivitasFisik === 'Berat' ? 3 : aktivitasFisik === 'Sedang' ? 2 : 1,
          TUE: Number(durasiTidur) < 7 ? 2 : 1, // Screen time (inverse of sleep)
          SMOKE: merokok === 'Ya',
          SCC: false, // Default: not monitoring calories
          CALC: 'no', // Default: no alcohol
          MTRANS: 'Public_Transportation', // Default transportation
        };

        // Save cycle data (you may need to implement this endpoint or update existing one)
        const cycleResult = await authenticatedRequest(
          '/cycles',
          token,
          {
            method: 'POST',
            body: JSON.stringify(cycleData),
          }
        );

        if (!cycleResult.success) {
          Alert.alert('Error', cycleResult.error || 'Gagal menyimpan data siklus');
          setCalculating(false);
          return;
        }

        // Navigate to AssessmentResultScreen
        // The screen will trigger the prediction automatically
        navigation.navigate('AssessmentResult', undefined);
      } catch (error) {
        console.error('Error saving cycle data:', error);
        Alert.alert('Error', 'Terjadi kesalahan saat menyimpan data');
      } finally {
        setCalculating(false);
      }
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
              {step === 1 ? 'Data Genetik & Fisik' : step === 2 ? 'Pola Konsumsi' : 'Gaya Hidup'}
            </Text>
            <Text style={styles.subtitle}>Langkah {step} dari 3</Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>

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
                  title={calculating ? 'Menyimpan & Menganalisis...' : 'Selesai & Lihat Hasil'} 
                  onPress={handleNext} 
                  variant="primary" 
                  disabled={!isStep3Valid || calculating} 
                  iconName="assessment" 
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
