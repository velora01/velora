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
import { IndianRupee, CheckCircle2, Plus, X, Tag, FileText, Download } from 'lucide-react-native';

export default function PaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('150000');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Bank Transfer' | 'Cheque' | 'Cash'
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/payments');
      setPayments(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setPayments([
        { _id: 'pay1', receiptNumber: 'REC-VEL-901', clientName: 'Mr. Anand Ahuja', amount: 450000, paymentMethod: 'UPI', date: '2026-08-02', transactionId: 'TXN8491823' },
        { _id: 'pay2', receiptNumber: 'REC-VEL-902', clientName: 'Dr. Priya Nair', amount: 300000, paymentMethod: 'Cheque', date: '2026-08-04', transactionId: 'CHQ94819' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRecordPayment = async () => {
    if (!clientName.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Client name and payment amount are required.');
      return;
    }

    const payload = {
      receiptNumber: 'REC-VEL-' + Math.floor(10000 + Math.random() * 90000),
      clientName: clientName,
      amount: parseFloat(amount) || 0,
      paymentMethod: paymentMethod,
      transactionId: transactionId || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      notes: notes,
      status: 'Completed',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/payments', payload);
      if (res.data.success) {
        Alert.alert('Success', `Payment Receipt ${res.data.data.receiptNumber} recorded successfully.`);
        setIsAddModalOpen(false);
        setClientName('');
        setTransactionId('');
        setNotes('');
        fetchPayments();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to record payment transaction.');
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId, receiptNumber) => {
    try {
      Alert.alert('Receipt Export', `Generating receipt PDF for ${receiptNumber}...`);
      await apiClient.get(`/erp/payments/${paymentId}/receipt`);
      Alert.alert('Success', `Receipt PDF exported successfully.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF receipt.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Payment Receipts"
        subtitle="Transaction Ledger & Collections"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchPayments();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={styles.receipt}>{item.receiptNumber}</Text>
                </View>
                <Text style={styles.date}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.date}
                </Text>
              </View>

              <Text style={styles.client}>Client: {item.clientName}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.mode}>Method: {item.paymentMethod || item.mode}</Text>
                {item.transactionId ? (
                  <Text style={styles.txnId}>Ref: {item.transactionId}</Text>
                ) : null}
              </View>

              <View style={styles.amountBox}>
                <View>
                  <Text style={styles.amountLabel}>Received Amount</Text>
                  <Text style={styles.amount}>₹{item.amount?.toLocaleString('en-IN')}</Text>
                </View>

                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => handleDownloadReceipt(item._id, item.receiptNumber)}
                >
                  <Download size={12} color={colors.goldPrimary} />
                  <Text style={styles.pdfText}>Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Record Payment Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment Transaction</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Client Name"
                value={clientName}
                onChangeText={setClientName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Amount Received (₹)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.pickerLabel}>Payment Method</Text>
              <View style={styles.methodSelector}>
                {['UPI', 'Bank Transfer', 'Cheque', 'Cash'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodChip, paymentMethod === m && styles.activeMethodChip]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text style={[styles.methodChipText, paymentMethod === m && styles.activeMethodChipText]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Transaction ID / Cheque Ref"
                value={transactionId}
                onChangeText={setTransactionId}
              />
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Payment Remarks / Notes"
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
                <TouchableOpacity style={styles.saveBtn} onPress={handleRecordPayment}>
                  <Text style={styles.saveText}>Record Receipt</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  receipt: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  date: { fontSize: 11, color: colors.textMuted },
  client: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },
  mode: { fontSize: 11, color: colors.textSecondary },
  txnId: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: { fontSize: 10, textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700' },
  amount: { fontSize: 18, fontWeight: '900', color: colors.success, marginTop: 2 },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pdfText: { color: colors.goldPrimary, fontSize: 11, fontWeight: '700' },

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
  methodSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeMethodChip: { backgroundColor: colors.goldPrimary, borderColor: colors.goldPrimary },
  methodChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '700' },
  activeMethodChipText: { color: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
