import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * GradientBackground dengan gradient smooth Blue → Teal → Green
 * Menggunakan banyak layer dengan overlap besar untuk gradasi ultra smooth tanpa garis
 */
export default function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Base layer - Solid Blue */}
      <View style={styles.baseLayer} />
      
      {/* Gradient layers dengan overlap besar untuk smooth transition */}
      <View style={styles.layer1} />
      <View style={styles.layer2} />
      <View style={styles.layer3} />
      <View style={styles.layer4} />
      <View style={styles.layer5} />
      <View style={styles.layer6} />
      <View style={styles.layer7} />
      <View style={styles.layer8} />
      
      {/* Content on top */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Base solid blue (#2563EB)
  baseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB', // Blue
  },
  
  // Gradient layers dengan opacity rendah dan overlap besar
  layer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#1E7FB8', 
    opacity: 0.3,
  },
  layer2: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#1A96B0',
    opacity: 0.3,
  },
  layer3: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#16A8A4',
    opacity: 0.35,
  },
  layer4: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#14B89E',
    opacity: 0.35,
  },
  layer5: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#12C598',
    opacity: 0.4,
  },
  layer6: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#10CE92',
    opacity: 0.4,
  },
  layer7: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#10B981',
    opacity: 0.5,
  },
  layer8: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: '#059669',
    opacity: 0.4,
  },
  
  // Content wrapper
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});
