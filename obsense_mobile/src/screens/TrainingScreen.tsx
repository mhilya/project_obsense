import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Logo from '../components/Logo';
import { BottomTabParamList } from '../types/navigation';
import { Colors } from '../theme';
import styles from '../styles/TrainingScreen.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Training'>;

const CATEGORIES = ['Semua', 'Otot', 'Penurunan berat', 'Pola makan', 'Gaya hidup'];

const WEEKDAYS = [
  { day: 'Sen', status: 'done', label: 'Latihan' },
  { day: 'Sel', status: 'done', label: 'Istirahat' },
  { day: 'Rab', status: 'done', label: 'Latihan' },
  { day: 'Kam', status: 'today', label: 'Latihan' },
  { day: 'Jum', status: 'upcoming', label: 'Istirahat' },
  { day: 'Sab', status: 'upcoming', label: 'Latihan' },
  { day: 'Min', status: 'upcoming', label: 'Latihan' },
];

const programs = [
  { id: '1', type: 'Penurunan berat', title: 'Fat Burn Starter', level: 'Pemula', duration: 25, sessions: 12, image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800', color: Colors.primary },
  { id: '2', type: 'Otot', title: 'Full Body Strength', level: 'Menengah', duration: 35, sessions: 16, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', color: Colors.teal },
  { id: '3', type: 'Pola makan', title: '14 Hari Makan Seimbang', level: 'Semua level', duration: 10, sessions: 14, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', color: Colors.warning },
  { id: '4', type: 'Gaya hidup', title: 'Healthy Habit Reset', level: 'Pemula', duration: 15, sessions: 21, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', color: Colors.purple },
];

export default function TrainingScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [startedPrograms, setStartedPrograms] = useState(['Fat Burn Starter']);

  const filteredPrograms =
    selectedCategory === 'Semua'
      ? programs
      : programs.filter(p => p.type === selectedCategory);

  const toggleProgram = (title: string) => {
    setStartedPrograms(cur =>
      cur.includes(title) ? cur.filter(t => t !== title) : [...cur, title]
    );
  };

  const activeProgram = programs.find(p => startedPrograms.includes(p.title));
  const streakDays = 6;
  const currentSession = 4;
  const totalSessions = activeProgram?.sessions || 12;
  const progressPercent = (currentSession / totalSessions) * 100;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Logo size="small" showText={true} />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-none" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>Program personal</Text>
            <Text style={styles.title}>Latihan & gaya hidup sehat</Text>
            <Text style={styles.subtitle}>Pilih program sesuai tujuanmu. Mulai perlahan, jaga konsistensi, dan pantau progres setiap hari.</Text>
          </View>

          {activeProgram && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.programIcon}>
                  <Icon name="fitness-center" size={28} color={Colors.primary} />
                </View>
                <View style={styles.programInfo}>
                  <Text style={styles.programLabel}>Program aktif</Text>
                  <Text style={styles.programName}>{activeProgram.title}</Text>
                  <Text style={styles.programSession}>Sesi {currentSession} dari {totalSessions}</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progressPercent)}% selesai</Text>
              </View>
              <View style={styles.streakBox}>
                <Icon name="local-fire-department" size={24} color={Colors.danger} />
                <View>
                  <Text style={styles.streakValue}>{streakDays} hari</Text>
                  <Text style={styles.streakLabel}>Rentetan latihan</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
                <Icon name="play-arrow" size={20} color={Colors.white} />
                <Text style={styles.continueButtonText}>Lanjutkan latihan</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
            {CATEGORIES.map(cat => (
              <Pressable key={cat} style={[styles.filterButton, selectedCategory === cat && styles.filterButtonActive]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.programsGrid}>
            {filteredPrograms.map(program => {
              const isStarted = startedPrograms.includes(program.title);
              return (
                <View key={program.id} style={styles.programCard}>
                  <View style={styles.programImageContainer}>
                    <Image source={{ uri: program.image }} style={styles.programImage} />
                    <View style={[styles.programTypeBadge, { backgroundColor: program.color }]}>
                      <Text style={styles.programTypeBadgeText}>{program.type}</Text>
                    </View>
                    <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
                      <Icon name="play-arrow" size={28} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.programBody}>
                    <Text style={styles.programLevel}>{program.level}</Text>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    <View style={styles.programStats}>
                      <View style={styles.programStat}>
                        <Icon name="access-time" size={14} color={Colors.textMuted} />
                        <Text style={styles.programStatText}>{program.duration} menit</Text>
                      </View>
                      <View style={styles.programStat}>
                        <Icon name="calendar-today" size={14} color={Colors.textMuted} />
                        <Text style={styles.programStatText}>{program.sessions} sesi</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={[styles.programButton, isStarted && styles.programButtonActive]} onPress={() => toggleProgram(program.title)} activeOpacity={0.8}>
                      <Text style={[styles.programButtonText, isStarted && styles.programButtonTextActive]}>{isStarted ? 'Program dimulai' : 'Mulai program'}</Text>
                      <Icon name={isStarted ? 'check' : 'arrow-forward'} size={16} color={isStarted ? Colors.success : Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.weeklyCard}>
            <Text style={styles.weeklyTitle}>Rencana minggu ini</Text>
            <Text style={styles.weeklySubtitle}>Jadwal yang direkomendasikan untuk tujuanmu</Text>
            <View style={styles.weekRow}>
              {WEEKDAYS.map(item => (
                <View key={item.day} style={[styles.weekDayBox, item.status === 'done' && styles.weekDayDone, item.status === 'today' && styles.weekDayToday]}>
                  <Text style={[styles.weekDayName, item.status !== 'upcoming' && styles.weekDayNameActive]}>{item.day}</Text>
                  <View style={styles.weekDayIcon}>
                    {item.status === 'done' ? (
                      <Icon name="check" size={16} color={Colors.success} />
                    ) : item.status === 'today' ? (
                      <Icon name="fitness-center" size={16} color={Colors.primary} />
                    ) : (
                      <Text style={styles.weekDayDash}>-</Text>
                    )}
                  </View>
                  <Text style={styles.weekDayLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
