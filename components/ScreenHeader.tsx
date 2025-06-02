import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface ScreenHeaderProps {
  title: string;
  style?: import('react-native').ViewStyle;
}

export default function ScreenHeader({ title, style }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.headerRow, { backgroundColor: colors.background }, style]}> 
      <Text style={[styles.greeting, { color: colors.onSurface }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
  },
}); 