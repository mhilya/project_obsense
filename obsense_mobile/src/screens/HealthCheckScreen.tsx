import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StatusBar,
  Pressable,
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
import {
  getToken,
  getUserProfile,
  updateCompleteUserProfile,
} from '../utils/authStorage';

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

  // Pre-fill data fisik dari profil user-service jika sudah pernah diisi
  useEffect(() => {
    getUserProfile().then(profile => {
      if (!profile) return;
      if (profile.name) setNama(profile.name);
      if (profile.age) setUsia(String(profile.age));
      if (profile.gender) {
        setGender(
          profile.gender === 'Female' || profile.gender === 'Perempuan'
            ? 'Perempuan'
            : 'Laki-laki',
        );
      }
      if (profile.height) setTinggiBadan(String(profile.height));
      if (profile.weight) setBeratBadan(String(profile.weight));
      if (profile.family_history_with_overweight !== undefined) {
        setRiwayatKeluarga(profile.family_history_with_overweight ? 'Ya' : 'Tidak');
      }
      if (profile.smoke !== undefined) {
        setMerokok(profile.smoke ? 'Ya' : 'Tidak');
      }
    });
  }, []);

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

        // 1. Simpan/perbarui profil antropometri di user-service (PUT /users/me)
        const profileRes = await updateCompleteUserProfile({
          name: nama.trim(),
          age: Number(usia),
          gender,
          height: Number(tinggiBadan),
          weight: Number(beratBadan),
          family_history_with_overweight: riwayatKeluarga === 'Ya',
          smoke: merokok === 'Ya',
        });

        if (!profileRes.success) {
          Alert.alert('Error', profileRes.error || 'Gagal menyimpan data profil fisik');
          return;
        }

        // 2. Pastikan ada siklus pemantauan 14 hari yang aktif (GET /cycles/current -> POST /cycles)
        const currentCycleRes = await authenticatedRequest<{ success?: boolean; data?: { id: number } | null }>(
          '/cycles/current',
          token,
          { method: 'GET' }
        );

        let activeCycleId = currentCycleRes.data?.data?.id;
        if (!activeCycleId) {
          const createCycleRes = await authenticatedRequest<{ success?: boolean; data?: { id: number } }>(
            '/cycles',
            token,
            { method: 'POST', body: JSON.stringify({}) }
          );
          if (!createCycleRes.success && createCycleRes.statusCode !== 409) {
            Alert.alert('Error', createCycleRes.error || 'Gagal memulai siklus pemantauan');
            return;
          }
          activeCycleId = createCycleRes.data?.data?.id;
        }

        // 3. Simpan log harian FFQ & gaya hidup ke assessment-service (POST /cycles/daily-logs)
        const mapCaec = (freq: string): 'no' | 'Sometimes' | 'Frequently' | 'Always' => {
          if (freq === 'Selalu') return 'Always';
          if (freq === 'Sering') return 'Frequently';
          if (freq === 'Kadang-kadang') return 'Sometimes';
          return 'no';
        };

        const dailyLogPayload = {
          ...(activeCycleId ? { cycle_id: activeCycleId } : {}),
          faf: aktivitasFisik === 'Berat' ? 3 : aktivitasFisik === 'Sedang' ? 2 : 1,
          tue: Number(durasiTidur) < 6 ? 2 : Number(durasiTidur) < 8 ? 1 : 0,
          fcvc: sayurBuah === 'Selalu' ? 3 : sayurBuah === 'Sering' || sayurBuah === 'Kadang-kadang' ? 2 : 1,
          ncp: 3,
          favc: makananCepat === 'Sering' || makananCepat === 'Selalu',
          ch2o: minumManis === 'Jarang' ? 2.5 : minumManis === 'Kadang-kadang' ? 2.0 : 1.5,
          caec: mapCaec(makanMalam),
          scc: false,
          calc: 'no',
          mtrans: 'Public_Transportation',
          notes: `Tidur ${durasiTidur} jam/hari, stres ${stres}`,
        };

        const logResult = await authenticatedRequest(
          '/cycles/daily-logs',
          token,
          {
            method: 'POST',
            body: JSON.stringify(dailyLogPayload),
          }
        );

        if (!logResult.success) {
          Alert.alert('Error', logResult.error || 'Gagal menyimpan log harian');
          return;
        }

        // 4. Arahkan ke AssessmentResultScreen untuk otomatis memicu prediksi ML
        navigation.navigate('AssessmentResult', { triggerPrediction: true });
      } catch (error) {
        console.error('Error saving health check:', error);
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
