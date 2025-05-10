import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ title = 'SpendPilot', showAvatar = true, showTitle = true }: { title?: string; showAvatar?: boolean; showTitle?: boolean }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const handleAvatarPress = () => {
    // @ts-ignore: bypass route typing for new settings route
    router.push('/settings');
  };

  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);

  return (
    <View
      style={[
        styles.container,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          paddingTop: insets.top,
          backgroundColor: theme.colors.surface,
          zIndex: 1,
        },
      ]}
    >
      {showTitle && (
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      )}
      {showAvatar && (
        <TouchableOpacity onPress={handleAvatarPress}>
          <Avatar.Image size={36} source={{ uri: 'https://placehold.co/100x100' }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // no elevation or shadow for seamless merge into status bar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
