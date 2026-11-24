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
import ChangePasswordModal from '../components/ChangePasswordModal';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';
import { BottomTabParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/ProfileScreen';
import { getStoredUser, updateUserProfile, logout, changePassword, UserProfile } from '../utils/authStorage';

type Props = BottomTabScreenProps<BottomTabParamList, 'Profile'>;

function ProfileScreen({ navigation }: Props): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // User data
  const [userData, setUserData] = useState<UserProfile | null>(null);
  
  // Form edit state
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Modal state
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

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
        setEditNama(user.name);
        setEditEmail(user.email);
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
      setEditNama(userData.name);
      setEditEmail(userData.email);
    }
    setEditMode(false);
  };

  const handleSaveEdit = async () => {
    // Validasi input
    if (!editNama.trim()) {
      showAlert('warning', 'Perhatian', 'Nama tidak boleh kosong');
      return;
    }

    if (!editEmail.trim()) {
      showAlert('warning', 'Perhatian', 'Email tidak boleh kosong');
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      showAlert('error', 'Email Tidak Valid', 'Format email tidak valid. Contoh: nama@email.com');
      return;
    }

    try {
      setSaving(true);
      
      const result = await updateUserProfile({
        name: editNama.trim(),
        email: editEmail.trim(),
      });
      
      if (result.success && result.user) {
        setUserData(result.user);
        setEditMode(false);
        showAlert('success', 'Berhasil!', 'Profil berhasil diperbarui');
      } else {
        showAlert('error', 'Gagal Memperbarui', result.error || 'Gagal memperbarui profil. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showAlert('error', 'Kesalahan', 'Terjadi kesalahan saat menyimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    return await changePassword(currentPassword, newPassword);
  };

  const handlePasswordChangeSuccess = () => {
    setChangePasswordModalVisible(false);
    showAlert('success', 'Berhasil!', 'Password berhasil diubah');
  };

  const handleLogout = async () => {
    showAlert(
      'confirm',
      'Keluar',
      'Yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Hapus token dan user data
              await logout();
              // Navigate ke Login
              // @ts-ignore - navigate to Login (root navigator)
              navigation.getParent()?.navigate('Login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
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
                    {userData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>@user{userData.id}</Text>
                </View>
              </View>

              {/* ── Stats row ── */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Icon name="calendar-today" size={20} color={Colors.primary} />
                  <Text style={styles.statLabel}>Bergabung</Text>
                  <Text style={styles.statValue}>
                    {userData.created_at ? getJoinMonth(userData.created_at) : 'Baru saja'}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Icon name="person" size={20} color={Colors.primary} />
                  <Text style={styles.statLabel}>Role</Text>
                  <Text style={styles.statValue}>{userData.role}</Text>
                </View>
              </View>

              {/* NOTE: Field profil lengkap akan tersedia di Fase 3 (user-service) */}

              {/* ── Info section ── */}
              <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
              
              {/* Fase 0-2: Data profil lengkap belum tersedia dari backend */}
              {/* <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color={Colors.textMuted} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>Akan tersedia di Fase 3</Text>
                  </View>
                </View>
              </View> */}

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
                onPress={() => setChangePasswordModalVisible(true)}
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

      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
        onSuccess={handlePasswordChangeSuccess}
        onChangePassword={handleChangePassword}
      />

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
