import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, FontSize, FontWeight } from '../theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'white';
}

export default function Logo({ 
  size = 'medium', 
  showText = true,
  variant = 'default' 
}: LogoProps) {
  const iconSize = size === 'small' ? 32 : size === 'medium' ? 40 : 56;
  const fontSize = size === 'small' ? FontSize.base : size === 'medium' ? FontSize.xl : FontSize.xxl;

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/Logo Obsense_remove bg.png')}
        style={[
          styles.logoImage,
          { 
            width: iconSize, 
            height: iconSize,
          }
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[
          styles.logoText, 
          { 
            fontSize,
            color: variant === 'white' ? Colors.white : Colors.textPrimary,
          }
        ]}>
          OBSENSE
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    // width and height will be set dynamically
  },
  logoText: {
    fontWeight: FontWeight.bold as any,
    letterSpacing: 0.5,
  },
});
