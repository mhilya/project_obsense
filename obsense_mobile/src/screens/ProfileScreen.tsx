import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  StatusBar,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';

import CustomButton from '../components/CustomButton';
import MenuCard from '../components/MenuCard';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';
import { BottomTabParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/ProfileScreen';
import { getStoredUser, updateUserProfile, UserProfile } from '../utils/authStorage';

type Props = BottomTabScreenProps<BottomTabParamList, 'Profile'>;

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];

function ProfileScreen({ navigation }: Props): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // User data
  const [userData, setUserData] = useState<UserProfile | null>(null);
  
  // Form edit state
  const [editUsername, setEditUsername] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState<Date | null>(null);
  const [editGender, setEditGender] = useState('');
  const [editAlamat, setEditAlamat] = useState('');

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('info');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([{ text: 'OK' }]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getStoredUser();
      if (user) {
        setUserData(user);
        // Set form edit values
        setEditUsername(user.username);
        setEditNama(user.nama);
        setEditEmail(user.email);
        setEditTanggalLahir(new Date(user.tanggalLahir));
        setEditGender(user.gender);
        setEditAlamat(user.alamat);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEnterEditMode = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    if (userData) {
      setEditUsername(userData.username);
      setEditNama(userData.nama);
      setEditEmail(userData.email);
      setEditTanggalLahir(new Date(userData.tanggalLahir));
      setEditGender(userData.gender);
      setEditAlamat(userData.alamat);
    }
    setEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (
      !editUsername.trim() ||
      !editNama.trim() ||
      !editEmail.trim() ||
      !editTanggalLahir ||
      !editGender.trim() ||
      !editAlamat.trim()
    ) {
      showAlert('warning', 'Perhatian', 'Semua field harus diisi.');
      return;
    }

    try {
      setSaving(true);
      const updatedData = {
        username: editUsername.trim(),
        nama: editNama.trim(),
        email: editEmail.trim(),
        tanggalLahir: editTanggalLahir.toISOString(),
        gender: editGender,
        alamat: editAlamat.trim(),
      };

      const success = await updateUserProfile(updatedData);
      if (success) {
        await loadUserData();
        setEditMode(false);
        showAlert('success', 'Berhasil', 'Profil berhasil diperbarui.');
      } else {
        showAlert('error', 'Gagal', 'Gagal memperbarui profil. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showAlert('error', 'Error', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'confirm',
      'Keluar',
      'Yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => {
            // @ts-ignore - navigate to Login (root navigator)
            navigation.getParent()?.navigate('Login');
          },
        },
      ],
    );
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getJoinMonth = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.userName, { marginTop: 16, color: Colors.textPrimary }]}>Memuat data...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 16 }]}>
        <Icon name="error-outline" size={64} color={Colors.textMuted} />
        <Text style={[styles.userName, { marginTop: 16, color: Colors.textPrimary }]}>Data tidak ditemukan</Text>
        <CustomButton
          title="Kembali"
          onPress={() => navigation.goBack()}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Logo size="small" showText={true} />
          </View>
          <Pressable style={styles.notificationButton}>
            <Icon name="notifications-none" size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {!editMode ? (
            <>
              {/* ── VIEW MODE ── */}
              {/* ── Avatar card ── */}
              <View style={styles.avatarCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {userData.nama.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{userData.nama}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>@{userData.username}</Text>
                </View>
              </View>

              {/* ── Stats row ── */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Icon name="calendar-today" size={20} color={Colors.primary} />
                  <Text style={styles.statLabel}>Bergabung</Text>
                  <Text style={styles.statValue}>{getJoinMonth(userData.createdAt)}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Icon name="cake" size={20} color={Colors.primary} />
                  <Text style={styles.statLabel}>Tanggal Lahir</Text>
                  <Text style={styles.statValue}>{formatDate(userData.tanggalLahir)}</Text>
                </View>
              </View>

              {/* ── Info section ── */}
              <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color={Colors.textMuted} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{userData.gender}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Icon name="location-on" size={20} color={Colors.textMuted} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Alamat</Text>
                    <Text style={styles.infoValue}>{userData.alamat}</Text>
                  </View>
                </View>
              </View>

              {/* ── Account section ── */}
              <Text style={styles.sectionTitle}>Akun</Text>

              <MenuCard
                iconName="edit"
                title="Edit Profil"
                subtitle="Ubah informasi pribadi"
                onPress={handleEnterEditMode}
              />
              <MenuCard
                iconName="lock"
                title="Ubah Password"
                subtitle="Perbarui keamanan akun"
                iconColor={Colors.warning}
                iconBg={Colors.warningLight}
                onPress={() => showAlert('info', 'Ubah Password', 'Fitur ini segera hadir.')}
              />

              {/* ── Logout ── */}
              <View style={styles.logoutWrapper}>
                <CustomButton
                  title="Keluar"
                  onPress={handleLogout}
                  variant="danger"
                  iconName="logout"
                />
              </View>
            </>
          ) : (
            <>
              {/* ── EDIT MODE ── */}
              <Text style={styles.editTitle}>Edit Profil</Text>

              <View style={styles.editForm}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan username"
                  value={editUsername}
                  onChangeText={setEditUsername}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Nama Lengkap</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  value={editNama}
                  onChangeText={setEditNama}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan email"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomDatePicker
                  label="Tanggal Lahir"
                  placeholder="Pilih tanggal lahir"
                  value={editTanggalLahir}
                  onChange={setEditTanggalLahir}
                  maxDate={new Date()}
                />

                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                  {GENDER_OPTIONS.map(opt => (
                    <Pressable
                      key={opt}
                      style={[styles.genderBtn, editGender === opt && styles.genderBtnActive]}
                      onPress={() => setEditGender(opt)}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.genderText, editGender === opt && styles.genderTextActive]}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Alamat</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Masukkan alamat lengkap"
                  value={editAlamat}
                  onChangeText={setEditAlamat}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.editButton, styles.editButtonCancel]}
                    onPress={handleCancelEdit}
                    disabled={saving}
                  >
                    <Text style={styles.editButtonTextCancel}>Batal</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.editButton, styles.editButtonSave, saving && styles.editButtonDisabled]}
                    onPress={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.editButtonTextSave}>Simpan</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>
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

export default ProfileScreen;
