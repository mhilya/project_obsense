import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import HealthCheckScreen from '../screens/HealthCheckScreen';
import MonitoringScreen from '../screens/MonitoringScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import TrainingScreen from '../screens/TrainingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { BottomTabParamList } from '../types/navigation';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = (): React.JSX.Element => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarLabel: 'Beranda',
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="HealthCheck" 
      component={HealthCheckScreen}
      options={{
        tabBarLabel: 'Asesmen',
        tabBarIcon: ({ color, size }) => (
          <Icon name="favorite" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Monitoring" 
      component={MonitoringScreen}
      options={{
        tabBarLabel: 'Monitoring',
        tabBarIcon: ({ color, size }) => (
          <Icon name="show-chart" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Training" 
      component={TrainingScreen}
      options={{
        tabBarLabel: 'Latihan',
        tabBarIcon: ({ color, size }) => (
          <Icon name="fitness-center" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Articles" 
      component={ArticlesScreen}
      options={{
        tabBarLabel: 'Artikel',
        tabBarIcon: ({ color, size }) => (
          <Icon name="article" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ({ color, size }) => (
          <Icon name="person" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default BottomTabNavigator;
