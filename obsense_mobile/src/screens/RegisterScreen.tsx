import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { registerUser } from '../utils/authStorage';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';
import styles from '../styles/RegisterScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [alamat, setAlamat] = useState('');
  const [password, setPassword] = useState('');

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

  const handleRegister = () => {
    if (
      !username.trim() ||
      !nama.trim() ||
      !email.trim() ||
      !tanggalLahir ||
      !gender.trim() ||
      !alamat.trim() ||
      !password.trim()
    ) {
      showAlert('warning', 'Perhatian', 'Semua field harus diisi.');
      return;
    }
    if (password.length < 6) {
      showAlert('warning', 'Perhatian', 'Password minimal 6 karakter.');
      return;
    }
    const berhasil = registerUser({ nama, email, password });
    if (!berhasil) {
      showAlert('error', 'Gagal', 'Email sudah terdaftar. Gunakan email lain.');
      return;
    }
    showAlert('success', 'Berhasil!', 'Akun berhasil dibuat. Silakan login.', [
      { text: 'Login Sekarang', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Daftar Akun</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama lengkap"
          value={nama}
          onChangeText={setNama}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomDatePicker
          label="Tanggal Lahir"
          placeholder="Pilih tanggal lahir"
          value={tanggalLahir}
          onChange={setTanggalLahir}
          maxDate={new Date()}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.genderBtn, gender === opt && styles.genderBtnActive]}
              onPress={() => setGender(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderText, gender === opt && styles.genderTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Alamat</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Masukkan alamat lengkap"
          value={alamat}
          onChangeText={setAlamat}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimal 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Daftar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Sudah punya akun? Login</Text>
        </TouchableOpacity>
      </ScrollView>

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
