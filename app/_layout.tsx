import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import ExpoGaodeMapModule from 'expo-gaode-map';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    ExpoGaodeMapModule.setPrivacyConfig({
      hasShow: true,
      hasContainsPrivacy: true,
      hasAgree: true,
    });
    ExpoGaodeMapModule.initSDK({
      iosKey: '971ccf3a9ff13270b637e3db4b9f6073',
    });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#131316', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#74739b" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#131316' },
        }}
      />
    </AuthProvider>
  );
}
