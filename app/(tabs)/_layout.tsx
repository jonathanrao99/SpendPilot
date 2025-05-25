import React from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={{
      position: 'absolute',
      bottom: 24,
      left: '15%',
      width: '75%',
      backgroundColor: '#18181B',
      borderRadius: 32,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      height: 70,
      zIndex: 100,
    }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => { if (!isFocused) navigation.navigate(route.name); };
        let icon;
        const iconColor = isFocused ? Colors.light.purple : '#fff';
        if (route.name === 'dashboard') icon = <MaterialCommunityIcons name="view-dashboard-outline" size={28} color={iconColor} />;
        if (route.name === 'analytics') icon = <Feather name="pie-chart" size={28} color={iconColor} />;
        if (route.name === 'delivery') icon = <MaterialIcons name="delivery-dining" size={28} color={iconColor} />;
        if (route.name === 'scanbill') icon = <Ionicons name="receipt-outline" size={28} color={iconColor} />;
        if (route.name === 'settings') icon = <Feather name="settings" size={28} color={iconColor} />;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={1}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {isFocused ? (
              <View style={{ backgroundColor: '#E5E7EB', borderRadius: 24, padding: 10 }}>
                {icon}
              </View>
            ) : (
              icon
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <Feather name="pie-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{
          title: 'Delivery',
          tabBarIcon: ({ color }) => <MaterialIcons name="delivery-dining" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanbill"
        options={{
          title: 'Scan Bill',
          tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Feather name="settings" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
