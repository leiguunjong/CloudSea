import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './contexts/AuthContext';
import { authApi } from './services/api';

const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
  { label: '不展示', value: '不展示' },
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState(formatBirthday(user?.birthday));
  const [uploading, setUploading] = useState(false);

  const username = user?.username ?? '';
  const cloudseaId = user?.cloudseaId ?? '';
  const displayName = (user?.username || user?.cloudseaId) ?? '';
  const gender = user?.gender || null;
  const birthday = user?.birthday || null;
  const avatar = user?.avatar || null;
  const coverImage = user?.coverImage || null;

  async function handlePickImage(type: 'avatar' | 'cover') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';

    setUploading(true);
    try {
      // 1. Get COS upload credential
      const credRes = await authApi.getCosCredential(type, ext, mimeType);
      const { url: uploadUrl, publicUrl } = credRes.data;

      // 2. Upload to COS
      const fileResponse = await fetch(asset.uri);
      const arrayBuffer = await fileResponse.arrayBuffer();
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: arrayBuffer,
        headers: { 'Content-Type': mimeType },
      });
      if (!uploadRes.ok) {
        console.log('COS upload failed:', uploadRes.status, uploadRes.statusText);
        throw new Error(`COS 上传失败 ${uploadRes.status}`);
      }

      // 3. Update profile
      const updateData = type === 'avatar' ? { avatar: publicUrl } : { coverImage: publicUrl };
      const profileRes = await authApi.updateProfile(updateData);

      if (user) {
        await updateUser({ ...user, ...profileRes.data });
      }
    } catch (e: any) {
      console.log('upload error:', e?.message, e?.status, e?.response?.status);
      Alert.alert('上传失败', e?.message || '请重试');
    } finally {
      setUploading(false);
    }
  }

  async function handleSelectGender(value: string) {
    setGenderModalVisible(false);
    if (value === (user?.gender ?? '')) return;
    try {
      const res = await authApi.updateProfile({ gender: value });
      if (user) {
        await updateUser({ ...user, gender: res.data.gender });
      }
    } catch (e: any) {
      Alert.alert('保存失败');
    }
  }

  async function handleSaveBirthday() {
    setBirthdayModalVisible(false);
    const trimmed = birthdayInput.trim();
    if (!trimmed) {
      try {
        const res = await authApi.updateProfile({ birthday: '' });
        if (user) {
          await updateUser({ ...user, birthday: res.data.birthday });
        }
      } catch { }
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      Alert.alert('格式错误', '请输入 YYYY-MM-DD 格式的日期');
      return;
    }
    if (trimmed === formatBirthday(user?.birthday)) return;
    try {
      const res = await authApi.updateProfile({ birthday: trimmed });
      if (user) {
        await updateUser({ ...user, birthday: res.data.birthday });
      }
    } catch (e: any) {
      Alert.alert('保存失败');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: '编辑主页',
          headerStyle: { backgroundColor: '#131316' },
          headerTintColor: '#e5e1e6',
          headerTitleStyle: {
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
          },
        }}
      />

      {/* Cover + Avatar */}
      <View style={styles.coverSection}>
        <Pressable onPress={() => handlePickImage('cover')}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
          {uploading ? (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
        </Pressable>
        <Pressable style={styles.avatarWrap} onPress={() => handlePickImage('avatar')}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName ? displayName.slice(0, 1).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <Text style={styles.changeHint}>更换头像</Text>
        </Pressable>
      </View>

      {/* Info List */}
      <View style={styles.menuCard}>
        <Pressable style={styles.infoRow} onPress={() => router.push('/edit-username' as any)}>
          <Text style={styles.label}>用户名</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{username || '未设置'}</Text>
            <MaterialIcons name="chevron-right" size={18} color="#47464e" />
          </View>
        </Pressable>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.label}>云海号</Text>
          <Text style={styles.value}>{cloudseaId}</Text>
        </View>
        <View style={styles.divider} />
        <Pressable style={styles.infoRow} onPress={() => setGenderModalVisible(true)}>
          <Text style={styles.label}>性别</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{gender || '未设置'}</Text>
            <MaterialIcons name="chevron-right" size={18} color="#47464e" />
          </View>
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.infoRow} onPress={() => {
          setBirthdayInput(formatBirthday(user?.birthday));
          setBirthdayModalVisible(true);
        }}>
          <Text style={styles.label}>生日</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{formatBirthday(birthday) || '未设置'}</Text>
            <MaterialIcons name="chevron-right" size={18} color="#47464e" />
          </View>
        </Pressable>
      </View>

      {/* Gender Modal */}
      <Modal visible={genderModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setGenderModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择性别</Text>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.modalOption,
                  opt.value === (gender ?? '') && styles.modalOptionActive,
                ]}
                onPress={() => handleSelectGender(opt.value)}
              >
                <Text style={[
                  styles.modalOptionText,
                  opt.value === (gender ?? '') && styles.modalOptionTextActive,
                ]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Birthday Modal */}
      <Modal visible={birthdayModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setBirthdayModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <Text style={styles.modalTitle}>设置生日</Text>
            <TextInput
              value={birthdayInput}
              onChangeText={setBirthdayInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#928f99"
              style={styles.modalInput}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.modalHint}>格式：YYYY-MM-DD，如 1990-01-15</Text>
            <Pressable style={styles.modalSaveButton} onPress={handleSaveBirthday}>
              <Text style={styles.modalSaveText}>确定</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function formatBirthday(d: string | Date | null | undefined): string {
  if (!d) return '';
  if (typeof d === 'string') {
    // "2020-01-15" or ISO string
    return d.slice(0, 10);
  }
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131316',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  // Cover
  coverSection: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverPlaceholder: {
    height: 120,
    backgroundColor: 'rgba(116, 115, 155, 0.2)',
  },
  coverImage: {
    height: 120,
    width: '100%',
  },
  uploadOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -36,
    paddingBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#74739b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#131316',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#131316',
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    color: '#fff',
  },
  changeHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#928f99',
    marginTop: 8,
  },
  // Info List
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 60,
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
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1c1b20',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 20,
    color: '#e5e1e6',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(116, 115, 155, 0.3)',
  },
  modalOptionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#c8c5cf',
  },
  modalOptionTextActive: {
    color: '#e5e1e6',
    fontFamily: 'Inter_600SemiBold',
  },
  modalInput: {
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
  modalHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#928f99',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalSaveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dac587',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#231b00',
  },
});
