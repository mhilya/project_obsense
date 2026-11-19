import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import Logo from '../components/Logo';
import { getStoredUser } from '../utils/authStorage';
import { Colors } from '../theme';
import styles from '../styles/HomeScreen.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Home'>;

// Mock health data
const healthData = [
  { date: '12 Mei', weight: 84.2 },
  { date: '19 Mei', weight: 83.5 },
  { date: '26 Mei', weight: 82.9 },
  { date: '2 Jun', weight: 82.4 },
  { date: '9 Jun', weight: 81.6 },
  { date: '16 Jun', weight: 80.8 },
  { date: 'Hari ini', weight: 80.2 },
];

const dailyActivity = [
  { day: 'Sen', steps: 6200 },
  { day: 'Sel', steps: 8100 },
  { day: 'Rab', steps: 7400 },
  { day: 'Kam', steps: 9600 },
  { day: 'Jum', steps: 5300 },
  { day: 'Sab', steps: 11200 },
  { day: 'Min', steps: 8900 },
];

export default function HomeScreen({ navigation }: Props) {
  const [username, setUsername] = useState('Ilham');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        setUsername(user.nama || user.username);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const currentWeight = healthData[healthData.length - 1].weight;
  const previousWeight = healthData[0].weight;
  const weightChange = previousWeight - currentWeight;
  const currentBMI = 27.6;
  const targetWeight = 78.0;
  const targetProgress = 72;

  const maxSteps = Math.max(...dailyActivity.map(d => d.steps));

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Logo size="small" showText={true} />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-none" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroDate}>{getCurrentDate()}</Text>
            <Text style={styles.heroTitle}>Selamat pagi, {username}</Text>
            <Text style={styles.heroSubtitle}>
              Setiap langkah kecil hari ini membawa kamu lebih dekat ke kondisi terbaikmu.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('HealthCheck')}
            >
              <Text style={styles.heroButtonText}>Cek kondisi sekarang</Text>
              <Icon name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              iconName="monitor-weight"
              iconColor={Colors.primary}
              iconBg={Colors.primaryLight}
              label="Berat badan"
              value={currentWeight.toFixed(1)}
              unit="kg"
              note="Dari pemeriksaan terakhir"
              trend={{ type: 'good', text: `↓ ${weightChange.toFixed(1)} kg` }}
            />
            <StatCard
              iconName="favorite"
              iconColor={Colors.warning}
              iconBg={Colors.warningLight}
              label="Indeks Massa Tubuh"
              value={currentBMI.toFixed(1)}
              note="Kategori berat badan berlebih"
              trend={{ type: 'warning', text: 'Perlu perhatian' }}
            />
          </View>

          {/* Goal Card */}
          <View style={styles.goalCard}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>Target bulan ini</Text>
              <View style={styles.goalValueRow}>
                <Text style={styles.goalValue}>{targetWeight.toFixed(1)}</Text>
                <Text style={styles.goalUnit}>kg</Text>
              </View>
              <Text style={styles.goalNote}>
                {(currentWeight - targetWeight).toFixed(1)} kg lagi untuk dicapai
              </Text>
            </View>
            <View style={styles.progressRing}>
              <Text style={styles.ringValue}>{targetProgress}%</Text>
              <Text style={styles.ringLabel}>tercapai</Text>
            </View>
          </View>

          {/* Chart Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Perkembangan berat badan</Text>
                <Text style={styles.cardSubtitle}>Progres 6 minggu terakhir</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Monitoring')}>
                <Text style={styles.linkText}>Lihat detail</Text>
              </TouchableOpacity>
            </View>
            <LineChart data={healthData} compact />
          </View>

          {/* Insight Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insight untukmu</Text>
            <Text style={styles.cardSubtitle}>Rekomendasi berdasarkan kondisimu</Text>
            
            <View style={styles.insightList}>
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: Colors.successLight }]}>
                  <Icon name="favorite" size={20} color={Colors.success} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Progresmu sangat baik</Text>
                  <Text style={styles.insightDesc}>
                    Berat badan turun konsisten selama 4 minggu terakhir.
                  </Text>
                </View>
              </View>

              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: Colors.infoLight }]}>
                  <Icon name="directions-run" size={20} color={Colors.info} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Tingkatkan aktivitas</Text>
                  <Text style={styles.insightDesc}>
                    Tambahkan 15 menit jalan kaki untuk membantu mencapai target.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Daily Activity */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aktivitas harian minggu ini</Text>
            <Text style={styles.cardSubtitle}>Langkah tercatat dari perangkatmu</Text>
            
            <View style={styles.dailyChart}>
              {dailyActivity.map((item, index) => (
                <View key={item.day} style={styles.dailyColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${(item.steps / maxSteps) * 100}%`,
                          backgroundColor: index === 6 ? Colors.primary : Colors.teal,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
