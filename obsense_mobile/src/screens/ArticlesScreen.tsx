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
import styles from '../styles/ArticlesScreen.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Articles'>;

const CATEGORIES = ['Semua', 'Nutrisi', 'Olahraga', 'Gaya hidup', 'Kesehatan', 'Mental'];

const articlePhotos = {
  nutrition: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  workout: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
  lifestyle: 'https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?w=800',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
  mental: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
};

const articles = [
  { id: '1', category: 'Nutrisi', title: 'Piring makan sehat untuk menurunkan berat badan', excerpt: 'Kenali komposisi karbohidrat, protein, sayur, dan lemak sehat yang tepat dalam satu piring.', readTime: '6 menit', image: articlePhotos.nutrition },
  { id: '2', category: 'Olahraga', title: 'Mengapa latihan kekuatan penting saat diet?', excerpt: 'Massa otot membantu metabolisme tubuh bekerja lebih efektif, bahkan ketika sedang beristirahat.', readTime: '5 menit', image: articlePhotos.workout },
  { id: '3', category: 'Gaya hidup', title: 'Jalan kaki 30 menit dan dampaknya untuk tubuh', excerpt: 'Kebiasaan sederhana yang dapat meningkatkan kebugaran jantung, suasana hati, dan kualitas tidur.', readTime: '4 menit', image: articlePhotos.lifestyle },
  { id: '4', category: 'Kesehatan', title: 'Memahami IMT, lingkar pinggang, dan risiko metabolik', excerpt: 'IMT bukan satu-satunya indikator. Pelajari parameter lain yang penting untuk memantau kesehatan.', readTime: '7 menit', image: articlePhotos.health },
  { id: '5', category: 'Nutrisi', title: 'Cara membaca label gizi tanpa bingung', excerpt: 'Panduan praktis memperhatikan takaran saji, gula tambahan, lemak jenuh, dan kandungan sodium.', readTime: '5 menit', image: articlePhotos.nutrition },
  { id: '6', category: 'Mental', title: 'Membangun kebiasaan sehat yang benar-benar bertahan', excerpt: 'Mulai dari target kecil, ukur progres, dan temukan sistem yang sesuai dengan keseharianmu.', readTime: '6 menit', image: articlePhotos.mental },
];

const featuredArticle = {
  title: 'Turun berat badan tanpa diet ekstrem: mulai dari 5 kebiasaan ini',
  excerpt: 'Pendekatan yang sehat tidak meminta kamu mengubah semuanya dalam semalam. Pelajari strategi realistis berbasis kebiasaan.',
  readTime: '8 menit',
  image: articlePhotos.nutrition,
};

export default function ArticlesScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredArticles =
    selectedCategory === 'Semua'
      ? articles
      : articles.filter(a => a.category === selectedCategory);

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
            <Text style={styles.eyebrow}>Pusat edukasi</Text>
            <Text style={styles.title}>Wawasan untuk hidup lebih sehat</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContainer}>
            {CATEGORIES.map(cat => (
              <Pressable key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.featuredArticle} activeOpacity={0.9}>
            <Image source={{ uri: featuredArticle.image }} style={styles.featuredImage} />
            <View style={styles.featuredContent}>
              <View style={styles.featuredTop}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>Pilihan editor</Text>
                </View>
                <Text style={styles.readTimeText}>{featuredArticle.readTime} baca</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredArticle.title}</Text>
              <Text style={styles.featuredExcerpt}>{featuredArticle.excerpt}</Text>
              <View style={styles.readButton}>
                <Text style={styles.readButtonText}>Baca artikel</Text>
                <Icon name="arrow-forward" size={16} color={Colors.white} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.articlesGrid}>
            {filteredArticles.map(article => (
              <TouchableOpacity key={article.id} style={styles.articleCard} activeOpacity={0.9}>
                <Image source={{ uri: article.image }} style={styles.articleImage} />
                <View style={styles.articleContent}>
                  <View style={styles.articleTop}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{article.category}</Text>
                    </View>
                    <Text style={styles.readTimeText}>{article.readTime} baca</Text>
                  </View>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleExcerpt}>{article.excerpt}</Text>
                  <View style={styles.articleFooter}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.articleArrow}>
                      <Icon name="arrow-forward" size={18} color={Colors.primary} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredArticles.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="article" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Belum ada artikel di kategori {selectedCategory}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
