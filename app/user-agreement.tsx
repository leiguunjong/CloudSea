import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function UserAgreementPage() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '用户协议' }} />
      <Text style={styles.placeholder}>用户协议</Text>
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
