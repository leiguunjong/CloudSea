import { View, Text, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/app/contexts/AuthContext';

export default function MePage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#74739b" />
      </View>
    );
  }

  if (!token || !user) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestContent}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="cloud" size={30} color="rgba(196, 194, 239, 0.7)" />
          </View>

          <Text style={styles.ceremonialLabel}>追云者未至</Text>
          <Text style={styles.guestTitle}>天空在等你</Text>
          <Text style={styles.guestBody}>登录后可体验全部功能</Text>

          <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.primaryButtonText}>登录</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
      </View>
    );
  }

  const displayName = user.username || user.cloudseaId;
  const coverImage = user.coverImage || null;
  const avatar = user.avatar || null;

  return (
    <View style={styles.container}>
      {/* Cover + Profile */}
      <View style={styles.headerSection}>
        {/* Cover */}
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        {/* Avatar — overlaps cover bottom */}
        <View style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Name + ID */}
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.cloudseaId}>云海号：{user.cloudseaId}</Text>
      </View>

      {/* Menu List */}
      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          <MenuRow icon="edit" label="编辑主页" onPress={() => router.push('/edit-profile')} />
          <View style={styles.divider} />
          <MenuRow icon="favorite-border" label="我的收藏" onPress={() => {}} />
          <View style={styles.divider} />
          <MenuRow icon="settings" label="设置" onPress={() => router.push('/settings')} />
          <View style={styles.divider} />
          <MenuRow icon="workspace-premium" label="会员中心" onPress={() => {}} />
          <View style={styles.divider} />
          <MenuRow icon="feedback" label="用户反馈" onPress={() => {}} />
          <View style={styles.divider} />
          <MenuRow icon="info-outline" label="关于云海" onPress={() => {}} />
        </View>
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
  // Shared
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131316',
  },
  container: {
    flex: 1,
    backgroundColor: '#131316',
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(116, 115, 155, 0.15)',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  avatarWrap: {
    marginTop: -40,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#74739b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#131316',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#131316',
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    color: '#fff',
  },
  displayName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#e5e1e6',
    marginBottom: 4,
  },
  cloudseaId: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#928f99',
  },

  // Menu
  menuSection: {
    paddingHorizontal: 16,
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(200, 197, 207, 0.1)',
    marginLeft: 52,
  },

  // Guest
  ceremonialLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 3,
    color: '#928f99',
    textTransform: 'uppercase',
  },
  guestContainer: {
    flex: 1,
    backgroundColor: '#131316',
  },
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 216, 0.15)',
    backgroundColor: 'rgba(53, 52, 56, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 32,
    letterSpacing: 0.5,
    color: '#e5e1e6',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 29,
    color: '#c8c5cf',
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 280,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#74739b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
