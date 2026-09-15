import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomButton from '../components/CustomButton';
import MenuCard from '../components/MenuCard';
import CustomAlert, { AlertType, AlertButton } from '../components/CustomAlert';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/ProfileScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const MOCK_USER = {
  name: 'Budi Santoso',
  username: 'budisantoso',
  email: 'budi@email.com',
  role: 'Administrator',
  joinDate: 'September 2026',
};

function ProfileScreen({ navigation }: Props): React.JSX.Element {
  const [logoutLoading, setLogoutLoading] = useState(false);

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
            setLogoutLoading(true);
            setTimeout(() => {
              setLogoutLoading(false);
              navigation.replace('Login');
            }, 800);
          },
        },
      ],
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar card ── */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {MOCK_USER.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{MOCK_USER.name}</Text>
            <Text style={styles.userEmail}>{MOCK_USER.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{MOCK_USER.role}</Text>
            </View>
          </View>

          {/* ── Stats row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="calendar-today" size={20} color={Colors.primary} />
              <Text style={styles.statLabel}>Bergabung</Text>
              <Text style={styles.statValue}>{MOCK_USER.joinDate}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon name="alternate-email" size={20} color={Colors.primary} />
              <Text style={styles.statLabel}>Username</Text>
              <Text style={styles.statValue}>@{MOCK_USER.username}</Text>
            </View>
          </View>

          {/* ── Account section ── */}
          <Text style={styles.sectionTitle}>Akun</Text>

          <MenuCard
            iconName="edit"
            title="Edit Profil"
            subtitle="Ubah nama, foto, dan bio"
            onPress={() => showAlert('info', 'Edit Profil', 'Fitur ini segera hadir.')}
          />
          <MenuCard
            iconName="lock"
            title="Ubah Password"
            subtitle="Perbarui keamanan akun"
            iconColor={Colors.warning}
            iconBg={Colors.warningLight}
            onPress={() => showAlert('info', 'Ubah Password', 'Fitur ini segera hadir.')}
          />
          <MenuCard
            iconName="notifications"
            title="Notifikasi"
            subtitle="Kelola preferensi notifikasi"
            onPress={() => showAlert('info', 'Notifikasi', 'Fitur ini segera hadir.')}
          />

          {/* ── App section ── */}
          <Text style={styles.sectionTitle}>Aplikasi</Text>

          <MenuCard
            iconName="info"
            title="Tentang Aplikasi"
            subtitle="Versi 1.0.0"
            iconColor={Colors.info}
            iconBg={Colors.infoLight}
            onPress={() =>
              showAlert('info', 'Tentang Aplikasi', 'Versi 1.0.0\nDibuat dengan React Native.')
            }
          />
          <MenuCard
            iconName="help"
            title="Bantuan & FAQ"
            subtitle="Pusat bantuan pengguna"
            iconColor={Colors.success}
            iconBg={Colors.successLight}
            onPress={() => showAlert('info', 'Bantuan & FAQ', 'Fitur ini segera hadir.')}
          />

          {/* ── Logout ── */}
          <View style={styles.logoutWrapper}>
            <CustomButton
              title="Keluar"
              onPress={handleLogout}
              variant="danger"
              iconName="logout"
              loading={logoutLoading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

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
