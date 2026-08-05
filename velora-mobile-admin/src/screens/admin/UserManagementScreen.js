import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import apiClient from '../../api/client';
import { Shield, User, Plus, X, ShieldAlert, Mail } from 'lucide-react-native';

const ROLES = [
  'Admin',
  'Super Admin',
  'Designer',
  'Project Manager',
  'Sales',
  'Factory Manager',
  'Accountant',
  'Installation Team',
];

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Designer');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/users');
      setUsers(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setUsers([
        { _id: 'u1', name: 'Rohan (Super Admin)', email: 'admin@velora.com', role: 'Super Admin' },
        { _id: 'u2', name: 'Vikram Malhotra', email: 'vikram@velora.com', role: 'Designer' },
        { _id: 'u3', name: 'Suresh Patil', email: 'suresh@velora.com', role: 'Project Manager' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const payload = {
      name: name,
      email: email,
      password: password,
      role: role,
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/users', payload);
      if (res.data.success) {
        Alert.alert('Success', `User ${res.data.data.name} created.`);
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchUsers();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create user account.');
      setLoading(false);
    }
  };

  const handleUpdateRole = async (targetRole) => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const res = await apiClient.put(`/erp/users/${selectedUser._id}/role`, { role: targetRole });
      if (res.data.success) {
        Alert.alert('Role Updated', `${selectedUser.name}'s role changed to ${targetRole}`);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update user role.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="User Management"
        subtitle="Team Accounts & Access Control"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchUsers();
          }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedUser(item)}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <User size={18} color={colors.goldPrimary} />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <View style={styles.roleBadge}>
                  <Shield size={10} color={colors.goldPrimary} />
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Mail size={12} color={colors.textMuted} />
                <Text style={styles.email}>{item.email}</Text>
              </View>

              <Text style={styles.tapTip}>Tap to manage permissions / role →</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add User Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Team Member</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Corporate Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Access Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.pickerLabel}>Assigned Role</Text>
              <View style={styles.roleSelector}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.activeRoleChip]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.roleChipText, role === r && styles.activeRoleChipText]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateUser}>
                  <Text style={styles.saveText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Update Role Modal */}
      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Team Role</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={styles.roleUpdateForm}>
                <Text style={styles.currentUserLabel}>
                  Assign new system access role for{' '}
                  <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
                    {selectedUser.name}
                  </Text>
                  :
                </Text>

                <View style={styles.roleGrid}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.updateRoleBtn,
                        selectedUser.role === r && styles.activeUpdateRoleBtn,
                      ]}
                      onPress={() => handleUpdateRole(r)}
                    >
                      <Shield size={12} color={selectedUser.role === r ? '#FFF' : colors.goldPrimary} />
                      <Text
                        style={[
                          styles.updateRoleBtnText,
                          selectedUser.role === r && styles.activeUpdateRoleBtnText,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  roleText: { fontSize: 11, fontWeight: '800', color: colors.goldPrimary },
  email: { fontSize: 12, color: colors.textSecondary },
  tapTip: { fontSize: 10, color: colors.goldPrimary, fontWeight: '700', marginTop: 8, textAlign: 'right' },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.goldPrimary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  // Modal styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  modalForm: { marginVertical: 4 },
  modalInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  pickerLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  roleSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeRoleChip: { backgroundColor: colors.goldPrimary, borderColor: colors.goldPrimary },
  roleChipText: { fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  activeRoleChipText: { color: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  // Role update styles
  roleUpdateForm: { paddingVertical: 6 },
  currentUserLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  updateRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeUpdateRoleBtn: { backgroundColor: colors.goldPrimary, borderColor: colors.goldPrimary },
  updateRoleBtnText: { fontSize: 11, color: colors.textSecondary, fontWeight: '800' },
  activeUpdateRoleBtnText: { color: '#FFF' },
});
