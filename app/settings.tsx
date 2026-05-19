import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from './contexts/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '设置',
          headerStyle: { backgroundColor: '#131316' },
          headerTintColor: '#e5e1e6',
          headerTitleStyle: {
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
          },
        }}
      />

      <View style={styles.menuCard}>
        <MenuRow
          icon="security"
          label="账号与安全"
          onPress={() => router.push('/account-security')}
        />
        <View style={styles.divider} />
        <MenuRow
          icon="description"
          label="用户协议"
          onPress={() => router.push('/user-agreement')}
        />
        <View style={styles.divider} />
        <MenuRow
          icon="policy"
          label="隐私政策"
          onPress={() => router.push('/privacy-policy')}
        />
        <View style={styles.divider} />
        <Pressable style={styles.menuRow} onPress={handleSignOut}>
          <View style={styles.menuRowLeft}>
            <MaterialIcons name="logout" size={20} color="#ffb4ab" />
            <Text style={styles.signOutLabel}>退出登录</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuRowLeft}>
        <MaterialIcons name={icon as any} size={20} color="#c8c5cf" />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#c8c5cf" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131316',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#e5e1e6',
  },
  signOutLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#ffb4ab',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(200, 197, 207, 0.1)',
    marginLeft: 52,
  },
});
