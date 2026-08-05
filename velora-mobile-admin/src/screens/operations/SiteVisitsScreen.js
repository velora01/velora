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
import { MapPin, Plus, X, Calendar, User, Phone, CheckCircle2 } from 'lucide-react-native';

const STATUSES = ['Scheduled', 'En Route', 'In Progress', 'Completed', 'Cancelled'];

export default function SiteVisitsScreen({ navigation }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [designer, setDesigner] = useState('Anjali Sharma (Senior Designer)');
  const [scheduledDate, setScheduledDate] = useState('2026-08-08');
  const [notes, setNotes] = useState('');

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/site-visits');
      setVisits(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setVisits([
        { _id: 'v1', visitCode: 'VST-VEL-201', clientName: 'Mr. Anand Ahuja', clientPhone: '+91 98900 12345', address: 'Koregaon Park, Lane 5', assignedDesigner: 'Anjali Sharma (Senior Designer)', status: 'Scheduled', scheduledDate: '2026-08-06', visitNotes: 'Measure kitchen height and electrical layouts' },
        { _id: 'v2', visitCode: 'VST-VEL-202', clientName: 'Dr. Priya Nair', clientPhone: '+91 95450 67890', address: 'Kalyani Nagar Estate', assignedDesigner: 'Varun Sen (Design Associate)', status: 'Completed', scheduledDate: '2026-08-04', visitNotes: 'Completed wall layout mapping and lighting checks' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleScheduleVisit = async () => {
    if (!clientName.trim() || !address.trim()) {
      Alert.alert('Validation Error', 'Client name and site address are required.');
      return;
    }

    const payload = {
      visitCode: 'VST-VEL-' + Math.floor(10000 + Math.random() * 90000),
      clientName: clientName,
      clientPhone: clientPhone,
      address: address,
      assignedDesigner: designer,
      scheduledDate: scheduledDate,
      visitNotes: notes,
      status: 'Scheduled',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/site-visits', payload);
      if (res.data.success) {
        Alert.alert('Success', `Site Visit ${res.data.data.visitCode} scheduled.`);
        setIsAddModalOpen(false);
        setClientName('');
        setClientPhone('');
        setAddress('');
        setNotes('');
        fetchVisits();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to schedule site visit.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await apiClient.put(`/erp/site-visits/${id}`, { status: nextStatus });
      if (res.data.success) {
        Alert.alert('Updated', `Visit status updated to ${nextStatus}`);
        fetchVisits();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update visit status.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Designer Site Visits"
        subtitle="Measurements, Site Checks & Surveys"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchVisits();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color={colors.goldPrimary} />
                  <Text style={styles.code}>{item.visitCode}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.client}>Client: {item.clientName}</Text>
              <Text style={styles.address}>Site Address: {item.address}</Text>

              <View style={styles.designerRow}>
                <User size={12} color={colors.textMuted} />
                <Text style={styles.designerText}>Designer: {item.assignedDesigner}</Text>
              </View>

              <View style={styles.dateRow}>
                <Calendar size={12} color={colors.textMuted} />
                <Text style={styles.dateText}>
                  Scheduled: {new Date(item.scheduledDate || Date.now()).toLocaleDateString()}
                </Text>
              </View>

              {item.visitNotes ? (
                <Text style={styles.notes}>Survey Notes: {item.visitNotes}</Text>
              ) : null}

              {/* Status Update Controls */}
              <View style={styles.statusBox}>
                <Text style={styles.statusBoxTitle}>Update Visit Status:</Text>
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

      {/* Schedule Visit Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Designer Visit</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Client / Lead Name"
                value={clientName}
                onChangeText={setClientName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Contact Phone"
                keyboardType="phone-pad"
                value={clientPhone}
                onChangeText={setClientPhone}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Site Address Location"
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Assigned Designer"
                value={designer}
                onChangeText={setDesigner}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Scheduled Date (YYYY-MM-DD)"
                value={scheduledDate}
                onChangeText={setScheduledDate}
              />
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Measurement requirements & instructions"
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
                <TouchableOpacity style={styles.saveBtn} onPress={handleScheduleVisit}>
                  <Text style={styles.saveText}>Schedule Visit</Text>
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
  client: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  address: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  designerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  designerText: { fontSize: 11, color: colors.textSecondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dateText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  notes: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', backgroundColor: colors.surfaceAlt, padding: 6, borderRadius: 6, marginTop: 6 },

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
