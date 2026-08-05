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
import StatusBadge from '../../components/StatusBadge';
import apiClient from '../../api/client';
import { Truck, Plus, X, Calendar, ClipboardCheck } from 'lucide-react-native';

const STATUSES = ['Scheduled', 'In Progress', 'Quality Check', 'Customer Handover', 'Completed'];

export default function InstallationManagerScreen({ navigation }) {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('Team Alpha');
  const [scheduledDate, setScheduledDate] = useState('2026-08-10');
  const [notes, setNotes] = useState('');

  const fetchInstallations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/installation');
      setInstallations(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setInstallations([
        { _id: 'inst1', installationCode: 'INST-VEL-101', projectName: 'Koregaon Park Estate', assignedTeam: 'Team Alpha', status: 'In Progress', scheduledDate: '2026-08-06', notes: 'Wardrobe carcass assembly' },
        { _id: 'inst2', installationCode: 'INST-VEL-102', projectName: 'Kalyani Nagar Villa', assignedTeam: 'Team Beta', status: 'Scheduled', scheduledDate: '2026-08-12', notes: 'Kitchen cabinet modular mounting' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInstallations();
  }, []);

  const handleCreateInstallation = async () => {
    if (!projectName.trim()) {
      Alert.alert('Validation Error', 'Project name is required.');
      return;
    }

    const payload = {
      installationCode: 'INST-VEL-' + Math.floor(10000 + Math.random() * 90000),
      projectName: projectName,
      assignedTeam: assignedTeam,
      scheduledDate: scheduledDate,
      notes: notes,
      status: 'Scheduled',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/installation', payload);
      if (res.data.success) {
        Alert.alert('Success', `Installation ${res.data.data.installationCode} scheduled.`);
        setIsAddModalOpen(false);
        setProjectName('');
        setNotes('');
        fetchInstallations();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to schedule installation.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await apiClient.put(`/erp/installation/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        Alert.alert('Updated', `Installation updated to: ${nextStatus}`);
        fetchInstallations();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update installation status.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Site Installations"
        subtitle="Assembly & Handover Management"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={installations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchInstallations();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Truck size={18} color={colors.goldPrimary} />
                  <Text style={styles.code}>{item.installationCode}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.projectName}>Project: {item.projectName}</Text>
              <Text style={styles.detail}>Assigned Team: {item.assignedTeam}</Text>

              <View style={styles.dateRow}>
                <Calendar size={12} color={colors.textMuted} />
                <Text style={styles.dateText}>
                  Scheduled: {new Date(item.scheduledDate || Date.now()).toLocaleDateString()}
                </Text>
              </View>
              {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}

              {/* Status Advance Bar */}
              <View style={styles.statusBox}>
                <Text style={styles.statusBoxTitle}>Change Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
                  {STATUSES.filter((s) => s !== item.status).map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={styles.statusBtn}
                      onPress={() => handleUpdateStatus(item._id, st)}
                    >
                      <Text style={styles.statusBtnText}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Schedule Installation Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Installation</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Project Name / Client"
                value={projectName}
                onChangeText={setProjectName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Assigned Assembly Team (e.g. Team Alpha)"
                value={assignedTeam}
                onChangeText={setAssignedTeam}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Scheduled Date (YYYY-MM-DD)"
                value={scheduledDate}
                onChangeText={setScheduledDate}
              />
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Task Details & Notes"
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateInstallation}>
                  <Text style={styles.saveText}>Schedule Team</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  code: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  projectName: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  detail: { fontSize: 11, color: colors.textMuted },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4 },
  dateText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  notes: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', backgroundColor: colors.surfaceAlt, padding: 6, borderRadius: 6, marginTop: 4 },

  statusBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  statusBoxTitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: colors.textMuted, marginBottom: 6 },
  statusScroll: { flexDirection: 'row' },
  statusBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  statusBtnText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },

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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
