import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

interface LogoImageProps {
  size?: number;
  style?: ImageStyle;
}

export default function LogoImage({ size = 40, style }: LogoImageProps) {
  return (
    <Image 
      source={require('../assets/images/Logo Obsense_remove bg.png')}
      style={[
        styles.logo,
        { 
          width: size, 
          height: size,
        },
        style
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // width and height will be set dynamically via props
  },
});
