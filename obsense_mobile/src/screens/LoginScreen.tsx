import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { loginUser } from '../utils/authStorage';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';
import styles from '../styles/LoginScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
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

  const handleLogin = () => {
    // TODO: aktifkan kembali validasi login saat auth sudah siap
    // if (!email.trim() || !password.trim()) {
    //   showAlert('warning', 'Perhatian', 'Email dan password harus diisi.');
    //   return;
    // }
    // const user = loginUser(email.trim(), password);
    // if (!user) {
    //   showAlert('error', 'Login Gagal', 'Email atau password yang kamu masukkan salah.');
    //   return;
    // }
    navigation.replace('Home');
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Belum punya akun? Daftar</Text>
        </TouchableOpacity>
      </View>

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
