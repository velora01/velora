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
import { Factory, Plus, X, ArrowRight, Clipboard } from 'lucide-react-native';

const STAGES = [
  'Queued',
  'Cutting',
  'Polishing',
  'Painting',
  'Assembly',
  'Packaging',
  'Dispatch',
  'Completed',
];

const getProgressFromStage = (stage) => {
  switch (stage) {
    case 'Queued': return 10;
    case 'Cutting': return 25;
    case 'Polishing': return 45;
    case 'Painting': return 60;
    case 'Assembly': return 75;
    case 'Packaging': return 85;
    case 'Dispatch': return 95;
    case 'Completed': return 100;
    default: return 0;
  }
};

export default function ProductionFactoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [itemName, setItemName] = useState('');
  const [factoryLocation, setFactoryLocation] = useState('Main Plant - Chakan, Pune');
  const [manager, setManager] = useState('Sanjay Patil (Factory Lead)');
  const [notes, setNotes] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/production');
      setOrders(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setOrders([
        { _id: 'f1', itemName: 'Italian Leather Sectional Sofa Custom Frame', projectName: 'Koregaon Park Estate', status: 'Polishing', progress: 45, factoryLocation: 'Main Plant - Chakan, Pune', assignedFactoryManager: 'Sanjay Patil (Factory Lead)' },
        { _id: 'f2', itemName: 'Modular Oak Wood Kitchen Cabinets', projectName: 'Kalyani Nagar Villa', status: 'Queued', progress: 10, factoryLocation: 'Plant B - Hadapsar, Pune', assignedFactoryManager: 'Ramesh K. (Carpentry Supervisor)' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async () => {
    if (!projectName.trim() || !itemName.trim()) {
      Alert.alert('Validation Error', 'Project name and item name are required.');
      return;
    }

    const payload = {
      productionCode: 'ORD-VEL-' + Math.floor(10000 + Math.random() * 90000),
      projectName: projectName,
      itemName: itemName,
      factoryLocation: factoryLocation,
      assignedFactoryManager: manager,
      status: 'Queued',
      notes: notes,
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/production', payload);
      if (res.data.success) {
        Alert.alert('Success', `Production Order ${res.data.data.productionCode} created.`);
        setIsAddModalOpen(false);
        setProjectName('');
        setItemName('');
        setNotes('');
        fetchOrders();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create production order.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, nextStage) => {
    try {
      const res = await apiClient.put(`/erp/production/${id}/status`, { status: nextStage });
      if (res.data.success) {
        Alert.alert('Updated', `Order advanced to ${nextStage}`);
        fetchOrders();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update production stage.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Factory Operations"
        subtitle="Carpentry & Furniture Production"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          renderItem={({ item }) => {
            const currentProgress = item.progress || getProgressFromStage(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Factory size={18} color={colors.goldPrimary} />
                    <Text style={styles.itemTitle}>{item.itemName}</Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <Text style={styles.project}>Project: {item.projectName}</Text>
                <Text style={styles.detail}>Location: {item.factoryLocation}</Text>
                <Text style={styles.detail}>Lead: {item.assignedFactoryManager}</Text>
                {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}

                <View style={styles.progressBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.label}>Factory Progress</Text>
                    <Text style={styles.val}>{currentProgress}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${currentProgress}%` }]} />
                  </View>
                </View>

                {/* Status Advance Controls */}
                <View style={styles.advanceBox}>
                  <Text style={styles.advanceTitle}>Advance Production Stage:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.advanceScroll}>
                    {STAGES.filter((s) => s !== item.status).map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={styles.stageBtn}
                        onPress={() => handleUpdateStatus(item._id, st)}
                      >
                        <Text style={styles.stageBtnText}>→ {st}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add Order Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Production Order</Text>
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
                placeholder="Furniture Item Description"
                value={itemName}
                onChangeText={setItemName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Factory Location"
                value={factoryLocation}
                onChangeText={setFactoryLocation}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Assigned Factory Manager"
                value={manager}
                onChangeText={setManager}
              />
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Manufacturing Specifications"
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
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateOrder}>
                  <Text style={styles.saveText}>Queue Order</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: 8 },
  project: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  detail: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  notes: { fontSize: 11, fontStyle: 'italic', color: colors.textSecondary, marginTop: 4, backgroundColor: colors.surfaceAlt, padding: 6, borderRadius: 6 },
  progressBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  val: { fontSize: 11, color: colors.textPrimary, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.goldPrimary },

  advanceBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  advanceTitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: colors.textMuted, marginBottom: 6 },
  advanceScroll: { flexDirection: 'row' },
  stageBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  stageBtnText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },

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
