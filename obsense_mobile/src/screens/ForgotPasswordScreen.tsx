import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import CustomButton from '../components/CustomButton';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme';
import {
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP,
} from '../utils/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
type Step = 'email' | 'otp' | 'newPassword';

function ForgotPasswordScreen({ navigation }: Props): React.JSX.Element {
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('info');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([{ text: 'OK' }]);

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    buttons?: AlertButton[],
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons ?? [{ text: 'OK' }]);
    setAlertVisible(true);
  };

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      showAlert('warning', 'Perhatian', 'Email tidak boleh kosong');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('error', 'Email Tidak Valid', 'Format email tidak valid');
      return;
    }

    try {
      setLoading(true);
      const result = await requestPasswordResetOTP(email);

      if (result.success) {
        if (result.devOtp) {
          console.log('🔐 OTP:', result.devOtp);
        }

        showAlert(
          'success',
          'OTP Terkirim!',
          `Kode OTP telah dikirim ke ${email}. Periksa inbox Anda. Berlaku 10 menit.`,
          [{ text: 'OK', onPress: () => setStep('otp') }]
        );
      } else {
        showAlert('error', 'Gagal', result.error || 'Email tidak terdaftar');
      }
    } catch (error) {
      showAlert('error', 'Kesalahan', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      showAlert('warning', 'Perhatian', 'Kode OTP harus 6 digit');
      return;
    }

    try {
      setLoading(true);
      const result = await verifyPasswordResetOTP(email, otpCode);

      if (result.success) {
        showAlert(
          'success',
          'Verifikasi Berhasil!',
          'Silakan buat password baru Anda.',
          [{ text: 'OK', onPress: () => setStep('newPassword') }]
        );
      } else {
        showAlert('error', 'Kode OTP Salah', result.error || 'Kode tidak valid');
      }
    } catch (error) {
      showAlert('error', 'Kesalahan', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      showAlert('warning', 'Perhatian', 'Password tidak boleh kosong');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('warning', 'Password Terlalu Pendek', 'Minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Password Tidak Cocok', 'Konfirmasi password tidak sesuai');
      return;
    }

    try {
      setLoading(true);
      const result = await resetPasswordWithOTP(email, otpCode, newPassword);

      if (result.success) {
        showAlert(
          'success',
          'Berhasil!',
          'Password berhasil diubah. Silakan login dengan password baru.',
          [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        showAlert('error', 'Gagal', result.error || 'Gagal mengubah password');
      }
    } catch (error) {
      showAlert('error', 'Kesalahan', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'email') {
      navigation.goBack();
    } else if (step === 'otp') {
      setStep('email');
      setOtpCode('');
    } else {
      setStep('otp');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, (step === 'email' || step === 'otp' || step === 'newPassword') && styles.stepActive]}>
          <Icon name="email" size={20} color={(step === 'email' || step === 'otp' || step === 'newPassword') ? Colors.white : Colors.textMuted} />
        </View>
        <Text style={[styles.stepText, step === 'email' && styles.stepTextActive]}>Email</Text>
      </View>
      <View style={[styles.stepLine, (step === 'otp' || step === 'newPassword') && styles.stepLineActive]} />
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, (step === 'otp' || step === 'newPassword') && styles.stepActive]}>
          <Icon name="vpn-key" size={20} color={(step === 'otp' || step === 'newPassword') ? Colors.white : Colors.textMuted} />
        </View>
        <Text style={[styles.stepText, step === 'otp' && styles.stepTextActive]}>OTP</Text>
      </View>
      <View style={[styles.stepLine, step === 'newPassword' && styles.stepLineActive]} />
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, step === 'newPassword' && styles.stepActive]}>
          <Icon name="lock" size={20} color={step === 'newPassword' ? Colors.white : Colors.textMuted} />
        </View>
        <Text style={[styles.stepText, step === 'newPassword' && styles.stepTextActive]}>Password</Text>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" {...(Platform.OS === 'android' && { backgroundColor: Colors.white })} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack} disabled={loading}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 'email' && 'Lupa Kata Sandi'}
            {step === 'otp' && 'Verifikasi OTP'}
            {step === 'newPassword' && 'Password Baru'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          {step === 'email' && (
            <View style={styles.logoContainer}>
              <Logo size="medium" showText={false} />
            </View>
          )}

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {step === 'email' && 'Lupa Kata Sandi?'}
              {step === 'otp' && 'Masukkan Kode OTP'}
              {step === 'newPassword' && 'Buat Password Baru'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'email' && 'Masukkan email untuk menerima kode verifikasi'}
              {step === 'otp' && `Kode dikirim ke ${email}`}
              {step === 'newPassword' && 'Password minimal 6 karakter'}
            </Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="email" size={20} color={Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="nama@email.com"
                      placeholderTextColor={Colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>

                <CustomButton
                  title={loading ? 'Mengirim...' : 'Kirim Kode OTP'}
                  onPress={handleRequestOTP}
                  variant="primary"
                  disabled={loading}
                  iconName="send"
                />
              </>
            )}

            {step === 'otp' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Kode OTP (6 digit)</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="vpn-key" size={20} color={Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="000000"
                      placeholderTextColor={Colors.textMuted}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                  </View>
                </View>

                <Pressable style={styles.resendButton} onPress={handleRequestOTP} disabled={loading}>
                  <Icon name="refresh" size={18} color={Colors.primary} />
                  <Text style={styles.resendText}>Kirim Ulang OTP</Text>
                </Pressable>

                <CustomButton
                  title={loading ? 'Memverifikasi...' : 'Verifikasi'}
                  onPress={handleVerifyOTP}
                  variant="primary"
                  disabled={loading}
                  iconName="check-circle"
                />
              </>
            )}

            {step === 'newPassword' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password Baru</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="lock" size={20} color={Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Minimal 6 karakter"
                      placeholderTextColor={Colors.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Icon name={showNewPassword ? 'visibility' : 'visibility-off'} size={22} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Konfirmasi Password</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="lock" size={20} color={Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ulangi password"
                      placeholderTextColor={Colors.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={22} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.requirements}>
                  <View style={styles.reqItem}>
                    <Icon name={newPassword.length >= 6 ? 'check-circle' : 'radio-button-unchecked'} size={18} color={newPassword.length >= 6 ? Colors.success : Colors.textMuted} />
                    <Text style={styles.reqText}>Minimal 6 karakter</Text>
                  </View>
                  <View style={styles.reqItem}>
                    <Icon name={newPassword === confirmPassword && confirmPassword ? 'check-circle' : 'radio-button-unchecked'} size={18} color={newPassword === confirmPassword && confirmPassword ? Colors.success : Colors.textMuted} />
                    <Text style={styles.reqText}>Password cocok</Text>
                  </View>
                </View>

                <CustomButton
                  title={loading ? 'Menyimpan...' : 'Ubah Password'}
                  onPress={handleResetPassword}
                  variant="primary"
                  disabled={loading}
                  iconName="check"
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onDismiss={() => setAlertVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  stepTextActive: {
    color: Colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
    marginBottom: 32,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: Colors.white,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  otpInput: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginTop: -8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  requirements: {
    backgroundColor: Colors.backgroundLight,
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reqText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
