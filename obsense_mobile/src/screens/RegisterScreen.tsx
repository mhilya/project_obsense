import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import { Colors } from '../theme';
import styles from '../styles/RegisterScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = () => {
    // TODO: Add validation and registration
    if (agreeTerms) {
      navigation.replace('Main');
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
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
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
            !agreeTerms && styles.registerButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={!agreeTerms}
          activeOpacity={0.9}
        >
          <Text style={styles.registerButtonText}>Daftar sekarang</Text>
          <Icon name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
