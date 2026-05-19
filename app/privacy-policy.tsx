import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function PrivacyPolicyPage() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '隐私政策' }} />
      <Text style={styles.placeholder}>隐私政策</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#928f99',
  },
});
