import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { authApi } from './services/api';

export default function EditUsernamePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [value, setValue] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      Alert.alert('用户名不能为空');
      return;
    }
    if (trimmed === (user?.username ?? '')) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ username: trimmed });
      if (user) {
        await updateUser({ ...user, username: res.data.username });
      }
      router.back();
    } catch (e: any) {
      const msg = e?.response?.data?.message || '保存失败';
      Alert.alert('保存失败', msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: '用户名',
          headerStyle: { backgroundColor: '#131316' },
          headerTintColor: '#e5e1e6',
          headerTitleStyle: {
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
          },
        }}
      />

      <View style={styles.content}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="输入用户名"
          placeholderTextColor="#928f99"
          style={styles.input}
          autoFocus
          maxLength={20}
        />
        <Text style={styles.hint}>最多20个字符</Text>

        <Pressable
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#231b00" />
          ) : (
            <Text style={styles.saveText}>保存</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131316',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 78, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 30, 34, 0.4)',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#e5e1e6',
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#928f99',
    marginTop: 8,
    marginLeft: 4,
  },
  saveButton: {
    marginTop: 32,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dac587',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#231b00',
  },
});
