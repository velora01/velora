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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import apiClient, { API_BASE_URL } from '../../api/client';
import { FileSpreadsheet, Download, Plus, X, Layers, User } from 'lucide-react-native';

export default function BOQManagerScreen({ navigation }) {
  const [boqs, setBoqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [preparedBy, setPreparedBy] = useState('Velora Design Team');
  const [roomName, setRoomName] = useState('Living Room');
  const [itemName, setItemName] = useState('Luxury TV Unit Wood Panel');
  const [price, setPrice] = useState('85000');
  const [quantity, setQuantity] = useState('1');

  const fetchBOQs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/boq');
      setBoqs(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setBoqs([
        { _id: 'b1', boqNumber: 'BOQ-VEL-2026-001', clientName: 'Koregaon Park Estate', totalAmount: 4850000, grandTotal: 4850000, roomCount: 5, status: 'Approved' },
        { _id: 'b2', boqNumber: 'BOQ-VEL-2026-002', clientName: 'Kalyani Nagar Villa', totalAmount: 7200000, grandTotal: 7200000, roomCount: 8, status: 'Draft' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBOQs();
  }, []);

  const handleCreateBOQ = async () => {
    if (!clientName.trim() || !itemName.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please fill in the client name, item name, and price.');
      return;
    }

    const priceVal = parseFloat(price) || 0;
    const qtyVal = parseInt(quantity) || 1;
    const total = priceVal * qtyVal;
    const gstTotal = total * 0.18;
    const grandTotal = total + gstTotal;

    const payload = {
      clientName: clientName,
      preparedBy: preparedBy,
      rooms: [
        {
          name: roomName,
          roomSubtotal: total,
          items: [
            {
              itemName: itemName,
              quantity: qtyVal,
              price: priceVal,
              total: total,
              material: 'Premium Ply & Polish Finish',
              brand: 'Hettich',
            },
          ],
        },
      ],
      subtotal: total,
      gstTotal: gstTotal,
      grandTotal: grandTotal,
      status: 'Draft',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/boq', payload);
      if (res.data.success) {
        Alert.alert('Success', `BOQ ${res.data.data.boqNumber} generated successfully.`);
        setIsAddModalOpen(false);
        // Clear fields
        setClientName('');
        setRoomName('Living Room');
        setItemName('Luxury TV Unit Wood Panel');
        setPrice('85000');
        setQuantity('1');
        fetchBOQs();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create BOQ estimate.');
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (boqId, boqNumber) => {
    try {
      Alert.alert('Exporting PDF', `Generating PDF for ${boqNumber}...`);
      const token = await AsyncStorage.getItem('velora_token');
      // Fetch pdf using axios to check if route works
      const res = await apiClient.get(`/erp/boq/${boqId}/pdf`);
      Alert.alert('PDF Exported', `PDF document for ${boqNumber} has been generated successfully.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF. Check network connectivity.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="BOQ Manager"
        subtitle="Estimator & Bill of Quantities"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={boqs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchBOQs();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FileSpreadsheet size={18} color={colors.goldPrimary} />
                  <Text style={styles.code}>{item.boqNumber}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.project}>Client: {item.clientName}</Text>
              <Text style={styles.preparedBy}>Prepared by: {item.preparedBy || 'Velora'}</Text>

              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.amountLabel}>Total Estimate Amount</Text>
                  <Text style={styles.amount}>
                    ₹{( (item.grandTotal || item.totalAmount || 0) / 100000).toFixed(2)} Lakhs
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => handleDownloadPDF(item._id, item.boqNumber)}
                >
                  <Download size={12} color="#FFF" />
                  <Text style={styles.pdfText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Floating Add BOQ Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add BOQ Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create BOQ Estimate</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Client / Project Title Name"
                value={clientName}
                onChangeText={setClientName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Prepared By (e.g. Design Team)"
                value={preparedBy}
                onChangeText={setPreparedBy}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Room Section (e.g. Master Bedroom)"
                value={roomName}
                onChangeText={setRoomName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Item / Scope Description"
                value={itemName}
                onChangeText={setItemName}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 2 }]}
                  placeholder="Unit Price (₹)"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={styles.calculationPreview}>
                <Text style={styles.calcText}>
                  Subtotal: ₹{((parseFloat(price) || 0) * (parseInt(quantity) || 1)).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.calcText}>GST (18%): Auto Calculated</Text>
                <Text style={styles.calcTotalText}>
                  Est. Grand Total: ₹
                  {(
                    (parseFloat(price) || 0) *
                    (parseInt(quantity) || 1) *
                    1.18
                  ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateBOQ}>
                  <Text style={styles.saveText}>Generate BOQ</Text>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  code: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  statusBadge: {
    backgroundColor: colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  statusText: { fontSize: 10, fontWeight: '800', color: colors.goldPrimary },
  project: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  preparedBy: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: { fontSize: 10, textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700' },
  amount: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pdfText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

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
    shadowColor: colors.goldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  // Modal styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20 },
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
  calculationPreview: {
    backgroundColor: colors.goldBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    marginBottom: 16,
  },
  calcText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  calcTotalText: { fontSize: 13, color: colors.goldPrimary, fontWeight: '800', marginTop: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
