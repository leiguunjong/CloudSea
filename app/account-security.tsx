import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from './contexts/AuthContext';

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

export default function AccountSecurityPage() {
  const { user } = useAuth();

  const displayName = (user?.username || user?.cloudseaId) ?? '';
  const cloudseaId = user?.cloudseaId ?? '';
  const phone = user?.phone ?? null;
  const email = user?.email ?? null;

  function handleDeleteAccount() {
    Alert.alert('注销账号', '账号注销后将无法恢复，确定要注销吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定注销', style: 'destructive', onPress: () => {} },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: '账号与安全',
          headerStyle: { backgroundColor: '#131316' },
          headerTintColor: '#e5e1e6',
          headerTitleStyle: {
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
          },
        }}
      />

      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName ? displayName.slice(0, 1).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.username}>{displayName || '未设置'}</Text>
        <Text style={styles.cloudseaId}>云海号：{cloudseaId}</Text>
      </View>

      {/* Info List */}
      <View style={styles.menuCard}>
        <InfoRow label="手机号绑定" value={phone ? maskPhone(phone) : '未设置'} />
        <View style={styles.divider} />
        <InfoRow label="邮箱绑定" value={email ?? '未设置'} />
        <View style={styles.divider} />
        <InfoRow label="CloudSea密码" value="未设置" />
      </View>

      {/* Account Deletion */}
      <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>账号注销</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Pressable style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <MaterialIcons name="chevron-right" size={18} color="#47464e" />
      </View>
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
  // Profile
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#74739b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    color: '#fff',
  },
  username: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: '#e5e1e6',
    marginBottom: 4,
  },
  cloudseaId: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#928f99',
  },
  // Info List
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#e5e1e6',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#928f99',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(200, 197, 207, 0.1)',
    marginLeft: 20,
  },
  // Delete
  deleteButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 60,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#ffb4ab',
  },
});
