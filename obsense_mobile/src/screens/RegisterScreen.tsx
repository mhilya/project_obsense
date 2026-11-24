import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import CustomAlert, { AlertType } from '../components/CustomAlert';
import { Colors } from '../theme';
import styles from '../styles/RegisterScreen.styles';
import { registerUser } from '../utils/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('error');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (type: AlertType, title: string, message: string, onClose?: () => void) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleRegister = async () => {
    // Validasi input
    if (!nama.trim() || !email.trim() || !password.trim()) {
      showAlert('warning', 'Perhatian', 'Semua field harus diisi');
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('error', 'Email Tidak Valid', 'Format email tidak valid. Contoh: nama@email.com');
      return;
    }

    // Validasi password minimal 8 karakter
    if (password.length < 8) {
      showAlert('warning', 'Password Terlalu Pendek', 'Password harus minimal 8 karakter');
      return;
    }

    if (!agreeTerms) {
      showAlert('warning', 'Syarat dan Ketentuan', 'Anda harus menyetujui syarat dan ketentuan untuk melanjutkan');
      return;
    }

    try {
      setLoading(true);
      
      // Fase 0-2: Hanya kirim name, email, password
      // Field lain akan ke user-service di Fase 3
      const result = await registerUser({
        name: nama.trim(),
        email: email.trim(),
        password: password,
      });
      
      if (result.success) {
        // Registrasi berhasil - backend tidak return token di register
        showAlert(
          'success',
          'Registrasi Berhasil!',
          'Akun berhasil dibuat. Silakan login untuk melanjutkan.'
        );
        // Navigate setelah user tutup alert
        setTimeout(() => {
          setAlertVisible(false);
          navigation.navigate('Login');
        }, 2000);
      } else {
        // Registrasi gagal
        showAlert(
          'error',
          'Registrasi Gagal',
          result.error || 'Email sudah terdaftar atau terjadi kesalahan.'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert(
        'error',
        'Kesalahan Koneksi',
        'Terjadi kesalahan saat mendaftar. Pastikan backend sudah berjalan.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Logo */}
        <View style={styles.brandContainer}>
          <Logo size="large" showText={true} />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.eyebrow}>MULAI PERJALANAN SEHATMU</Text>
          <Text style={styles.title}>Buat akun OBSENSE</Text>
          <Text style={styles.subtitle}>
            Isi data singkat berikut untuk membuat akun baru.
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama lengkap</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Nama lengkap"
              placeholderTextColor={Colors.textMuted}
              value={nama}
              onChangeText={setNama}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kata sandi</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Minimal 8 karakter"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={loading}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms Checkbox */}
        <Pressable
          style={styles.termsContainer}
          onPress={() => setAgreeTerms(!agreeTerms)}
          disabled={loading}
        >
          <View
            style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
          >
            {agreeTerms && <Icon name="check" size={16} color={Colors.white} />}
          </View>
          <Text style={styles.termsText}>
            Saya menyetujui{' '}
            <Text style={styles.termsLink}>Syarat Penggunaan</Text> dan{' '}
            <Text style={styles.termsLink}>Kebijakan Privasi</Text> OBSENSE.
          </Text>
        </Pressable>

        {/* Register Button */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            (!agreeTerms || loading) && styles.registerButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={!agreeTerms || loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.registerButtonText}>Daftar sekarang</Text>
              <Icon name="arrow-forward" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttons={[{ text: 'OK', onPress: () => setAlertVisible(false) }]}
      />
    </>
  );
}
