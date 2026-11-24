import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  StatusBar,
  Switch,
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
import { getStoredUser, updateUserProfile, logout, changePassword, UserProfile, getUserProfile, CompleteUserProfile, updateCompleteUserProfile } from '../utils/authStorage';

type Props = BottomTabScreenProps<BottomTabParamList, 'Profile'>;

function ProfileScreen({ navigation }: Props): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // User data - now complete profile
  const [userData, setUserData] = useState<CompleteUserProfile | null>(null);
  
  // Form edit state - basic info
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // Form edit state - anthropometric data
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editFamilyHistory, setEditFamilyHistory] = useState(false);
  const [editSmoke, setEditSmoke] = useState(false);

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
      // Use getUserProfile to get complete profile including anthropometric data
      const user = await getUserProfile();
      if (user) {
        setUserData(user);
        // Set basic info
        setEditNama(user.name);
        setEditEmail(user.email);
        // Set anthropometric data
        setEditPhone(user.phone || '');
        setEditGender(user.gender || '');
        setEditBirthDate(user.birth_date || '');
        setEditHeight(user.height?.toString() || '');
        setEditWeight(user.weight?.toString() || '');
        setEditAddress(user.address || '');
        setEditFamilyHistory(user.family_history_with_overweight || false);
        setEditSmoke(user.smoke || false);
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
      setEditPhone(userData.phone || '');
      setEditGender(userData.gender || '');
      setEditBirthDate(userData.birth_date || '');
      setEditHeight(userData.height?.toString() || '');
      setEditWeight(userData.weight?.toString() || '');
      setEditAddress(userData.address || '');
      setEditFamilyHistory(userData.family_history_with_overweight || false);
      setEditSmoke(userData.smoke || false);
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

    // Validasi anthropometric data jika diisi
    if (editHeight && (parseFloat(editHeight) < 50 || parseFloat(editHeight) > 250)) {
      showAlert('warning', 'Perhatian', 'Tinggi badan harus antara 50-250 cm');
      return;
    }

    if (editWeight && (parseFloat(editWeight) < 10 || parseFloat(editWeight) > 400)) {
      showAlert('warning', 'Perhatian', 'Berat badan harus antara 10-400 kg');
      return;
    }

    // Validasi format tanggal lahir
    if (editBirthDate && !/^\d{4}-\d{2}-\d{2}$/.test(editBirthDate)) {
      showAlert('warning', 'Perhatian', 'Format tanggal lahir harus YYYY-MM-DD (contoh: 2000-05-10)');
      return;
    }

    try {
      setSaving(true);
      
      // Build update object with only changed fields
      const updates: any = {
        name: editNama.trim(),
        email: editEmail.trim(),
      };

      if (editPhone.trim()) updates.phone = editPhone.trim();
      if (editGender) updates.gender = editGender;
      if (editBirthDate) updates.birth_date = editBirthDate;
      if (editHeight) updates.height = parseFloat(editHeight);
      if (editWeight) updates.weight = parseFloat(editWeight);
      if (editAddress.trim()) updates.address = editAddress.trim();
      updates.family_history_with_overweight = editFamilyHistory;
      updates.smoke = editSmoke;

      const result = await updateCompleteUserProfile(updates);
      
      if (result.success && result.user) {
        setUserData(result.user);
        setEditMode(false);
        
        // Show BMI info if calculated
        if (result.user.bmi) {
          showAlert(
            'success', 
            'Berhasil!', 
            `Profil berhasil diperbarui.\nBMI: ${result.user.bmi.toFixed(1)} (${result.user.obesity_class || 'Normal'})`
          );
        } else {
          showAlert('success', 'Berhasil!', 'Profil berhasil diperbarui');
        }
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

              {/* ── Info section - Anthropometric Data ── */}
              {(userData.height || userData.weight || userData.bmi) && (
                <>
                  <Text style={styles.sectionTitle}>Data Antropometri</Text>
                  <View style={styles.infoCard}>
                    {userData.height && (
                      <View style={styles.infoRow}>
                        <Icon name="straighten" size={20} color={Colors.textMuted} />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Tinggi Badan</Text>
                          <Text style={styles.infoValue}>{userData.height} cm</Text>
                        </View>
                      </View>
                    )}
                    {userData.weight && (
                      <View style={styles.infoRow}>
                        <Icon name="fitness-center" size={20} color={Colors.textMuted} />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Berat Badan</Text>
                          <Text style={styles.infoValue}>{userData.weight} kg</Text>
                        </View>
                      </View>
                    )}
                    {userData.bmi && (
                      <View style={styles.infoRow}>
                        <Icon name="assessment" size={20} color={Colors.textMuted} />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>BMI</Text>
                          <Text style={styles.infoValue}>
                            {userData.bmi.toFixed(1)} 
                            {userData.obesity_class && ` (${userData.obesity_class})`}
                          </Text>
                        </View>
                      </View>
                    )}
                    {userData.risk_level && (
                      <View style={styles.infoRow}>
                        <Icon name="warning" size={20} color={Colors.warning} />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Tingkat Risiko</Text>
                          <Text style={styles.infoValue}>{userData.risk_level}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* ── Info section - Personal Data ── */}
              <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
              <View style={styles.infoCard}>
                {userData.phone && (
                  <View style={styles.infoRow}>
                    <Icon name="phone" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Nomor Telepon</Text>
                      <Text style={styles.infoValue}>{userData.phone}</Text>
                    </View>
                  </View>
                )}
                {userData.gender && (
                  <View style={styles.infoRow}>
                    <Icon name="person" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                      <Text style={styles.infoValue}>{userData.gender}</Text>
                    </View>
                  </View>
                )}
                {userData.birth_date && (
                  <View style={styles.infoRow}>
                    <Icon name="cake" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(userData.birth_date)}
                        {userData.age && ` (${userData.age} tahun)`}
                      </Text>
                    </View>
                  </View>
                )}
                {userData.address && (
                  <View style={styles.infoRow}>
                    <Icon name="location-on" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Alamat</Text>
                      <Text style={styles.infoValue}>{userData.address}</Text>
                    </View>
                  </View>
                )}
                {userData.family_history_with_overweight !== undefined && (
                  <View style={styles.infoRow}>
                    <Icon name="family-restroom" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Riwayat Keluarga Overweight</Text>
                      <Text style={styles.infoValue}>
                        {userData.family_history_with_overweight ? 'Ya' : 'Tidak'}
                      </Text>
                    </View>
                  </View>
                )}
                {userData.smoke !== undefined && (
                  <View style={styles.infoRow}>
                    <Icon name="smoking-rooms" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Status Merokok</Text>
                      <Text style={styles.infoValue}>
                        {userData.smoke ? 'Ya' : 'Tidak'}
                      </Text>
                    </View>
                  </View>
                )}
                {!userData.phone && !userData.gender && !userData.birth_date && (
                  <View style={styles.infoRow}>
                    <Icon name="info" size={20} color={Colors.textMuted} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Data Belum Lengkap</Text>
                      <Text style={styles.infoValue}>
                        Silakan lengkapi profil Anda untuk mendapatkan analisis BMI
                      </Text>
                    </View>
                  </View>
                )}
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

                <Text style={styles.label}>Nomor Telepon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 08123456789"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Jenis Kelamin</Text>
                <View style={styles.genderContainer}>
                  <Pressable
                    style={[
                      styles.genderButton,
                      editGender === 'Laki-laki' && styles.genderButtonActive,
                    ]}
                    onPress={() => setEditGender('Laki-laki')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        editGender === 'Laki-laki' && styles.genderButtonTextActive,
                      ]}
                    >
                      Laki-laki
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.genderButton,
                      editGender === 'Perempuan' && styles.genderButtonActive,
                    ]}
                    onPress={() => setEditGender('Perempuan')}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        editGender === 'Perempuan' && styles.genderButtonTextActive,
                      ]}
                    >
                      Perempuan
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Tanggal Lahir (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 2000-05-10"
                  value={editBirthDate}
                  onChangeText={setEditBirthDate}
                />

                <Text style={styles.label}>Tinggi Badan (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 170"
                  value={editHeight}
                  onChangeText={setEditHeight}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Berat Badan (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 70"
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Alamat</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Masukkan alamat lengkap"
                  value={editAddress}
                  onChangeText={setEditAddress}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.switchRow}>
                  <View style={styles.switchLabel}>
                    <Icon name="family-restroom" size={20} color={Colors.textMuted} />
                    <Text style={styles.label}>Riwayat Keluarga Overweight</Text>
                  </View>
                  <Switch
                    value={editFamilyHistory}
                    onValueChange={setEditFamilyHistory}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={editFamilyHistory ? Colors.primary : Colors.textMuted}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchLabel}>
                    <Icon name="smoking-rooms" size={20} color={Colors.textMuted} />
                    <Text style={styles.label}>Status Merokok</Text>
                  </View>
                  <Switch
                    value={editSmoke}
                    onValueChange={setEditSmoke}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={editSmoke ? Colors.primary : Colors.textMuted}
                  />
                </View>

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
