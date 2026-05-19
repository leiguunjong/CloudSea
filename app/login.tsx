import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { authApi } from './services/api';
import { useAuth } from './contexts/AuthContext';

type Stage = 'form' | 'ceremony' | 'result';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [result, setResult] = useState({ username: '', welcome: '' });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  async function handleSendCode() {
    if (!account.trim()) {
      Alert.alert('请输入手机号或邮箱地址');
      return;
    }
    setSending(true);
    try {
      await authApi.sendCode(account.trim());
      Alert.alert('验证码已发送', '请注意查收短信或邮箱');
    } catch (e: any) {
      const msg = e?.response?.data?.message || '发送失败，请重试';
      Alert.alert('发送失败', msg);
    } finally {
      setSending(false);
    }
  }

  async function handleLogin() {
    if (!account.trim()) {
      Alert.alert('请输入手机号或邮箱地址');
      return;
    }
    if (!code.trim()) {
      Alert.alert('请输入验证码');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(account.trim(), code.trim());
      const user = {
        id: '',
        cloudseaId: res.data.cloudseaId || '',
        username: res.data.username ?? null,
        phone: res.data.phone ?? null,
        email: res.data.email ?? null,
        gender: res.data.gender ?? null,
        birthday: res.data.birthday ?? null,
        avatar: res.data.avatar ?? null,
        coverImage: res.data.coverImage ?? null,
      };
      await signIn(res.data.access_token, user);

      if (res.data.isNewUser) {
        setResult({
          username: res.data.cloudseaId || '',
          welcome: res.data.welcome || '',
        });
        setStage('ceremony');
      } else {
        router.replace('/me');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || '登录失败，请重试';
      Alert.alert('登录失败', msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (stage === 'ceremony') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        setStage('result');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'result') {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [stage]);

  if (stage === 'ceremony') {
    return (
      <View style={styles.ceremonyContainer}>
        <View style={styles.ceremonyGlow} />
        <Animated.View style={[styles.ceremonyContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.cloudIconWrap}>
            <View style={styles.cloudGlow} />
            <MaterialIcons name="cloud" size={80} color="#c4c2ef" />
          </View>
          <Text style={styles.ceremonyTitle}>云端身份授予</Text>
          <Text style={styles.ceremonySubtitle}>
            天空正在为你编织一个独特的名字...
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '66%'],
                  }),
                },
              ]}
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  if (stage === 'result') {
    return (
      <View style={styles.ceremonyContainer}>
        <Animated.View style={[styles.resultContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <MaterialIcons name="auto-awesome" size={64} color="#dac587" />
          <Text style={styles.resultLabel}>你的云端身份</Text>
          <Text style={styles.resultName}>{result.username}</Text>
          <Text style={styles.resultWelcome}>{result.welcome}</Text>
          <Pressable
            style={styles.journeyButton}
            onPress={() => router.replace('/me')}
          >
            <Text style={styles.journeyButtonText}>踏上征途</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.formContainer}>
          <View style={styles.bgGlowTop} />

          <View style={styles.formContent}>
            <Text style={styles.ceremonialLabel}>追云者归队</Text>
            <Text style={styles.title}>天空的召唤</Text>
            <Text style={styles.subtitle}>天空记得每一位追云者的名字</Text>

            <TextInput
              value={account}
              onChangeText={setAccount}
              placeholder="手机号或邮箱"
              placeholderTextColor="#928f99"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.codeRow}>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="输入验证码"
                placeholderTextColor="#928f99"
                style={styles.codeInput}
                keyboardType="number-pad"
              />
              <Pressable
                style={[styles.sendButton, sending && styles.disabledButton]}
                onPress={handleSendCode}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#c8c5cf" size="small" />
                ) : (
                  <Text style={styles.sendButtonText}>获取验证码</Text>
                )}
              </Pressable>
            </View>

            <Pressable
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#231b00" />
              ) : (
                <Text style={styles.primaryButtonText}>登录</Text>
              )}
            </Pressable>

            <Text style={styles.footerText}>
              还没有账号？ <Text style={styles.footerHighlight}>输入验证码即可自动注册</Text>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: '#131316' },

  // Form
  formContainer: {
    flex: 1,
    backgroundColor: '#131316',
    justifyContent: 'center',
  },
  bgGlowTop: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '60%',
    height: '50%',
    borderRadius: 999,
    backgroundColor: 'rgba(196, 194, 239, 0.05)',
    opacity: 0.6,
  },
  formContent: {
    paddingHorizontal: 24,
  },
  ceremonialLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3,
    color: '#928f99',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: '#e5e1e6',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#c8c5cf',
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 78, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 30, 34, 0.4)',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#e5e1e6',
    marginBottom: 16,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  codeInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 78, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 30, 34, 0.4)',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#e5e1e6',
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 78, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#c8c5cf',
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#dac587',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#231b00',
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#928f99',
    textAlign: 'center',
    marginTop: 24,
  },
  footerHighlight: {
    color: '#e5e1e6',
  },
  disabledButton: { opacity: 0.6 },

  // Ceremony
  ceremonyContainer: {
    flex: 1,
    backgroundColor: '#131316',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  ceremonyGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(116, 115, 155, 0.05)',
    opacity: 0.5,
  },
  ceremonyContent: { alignItems: 'center' },
  cloudIconWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  cloudGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(30, 30, 34, 0.3)',
    opacity: 0.5,
  },
  ceremonyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#e5e1e6',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ceremonySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#928f99',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 40,
  },
  progressBar: {
    width: 192,
    height: 2,
    backgroundColor: '#2a292d',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: '#74739b',
    borderRadius: 1,
  },

  // Result
  resultContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 3,
    color: '#928f99',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  resultName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: '#bdaa6e',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultWelcome: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#c8c5cf',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 280,
    marginBottom: 40,
  },
  journeyButton: {
    width: 280,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#74739b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
