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
import { FileText, Download, Plus, X, Calendar, DollarSign } from 'lucide-react-native';

export default function QuotationInvoiceScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'quotations'
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Invoice Form states
  const [invClientName, setInvClientName] = useState('');
  const [invDesc, setInvDesc] = useState('Modular Wardrobe & Bed Frame fitting');
  const [invPrice, setInvPrice] = useState('150000');
  const [invQty, setInvQty] = useState('1');
  const [invDueDate, setInvDueDate] = useState('2026-08-30');

  // Quotation Form states
  const [qClientName, setQClientName] = useState('');
  const [qDesc, setQDesc] = useState('Luxury Interior Design & Execution consultation');
  const [qPrice, setQPrice] = useState('80000');
  const [qQty, setQQty] = useState('1');
  const [qValidUntil, setQValidUntil] = useState('2026-09-15');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, qRes] = await Promise.all([
        apiClient.get('/erp/invoices').catch(() => ({ data: { data: [] } })),
        apiClient.get('/erp/quotations').catch(() => ({ data: { data: [] } })),
      ]);

      setInvoices(invRes.data.data || []);
      setQuotations(qRes.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setInvoices([
        { _id: 'i1', invoiceNumber: 'INV-VEL-8419', clientName: 'Mr. Anand Ahuja', grandTotal: 450000, status: 'Paid', dueDate: '2026-08-01' },
        { _id: 'i2', invoiceNumber: 'INV-VEL-8420', clientName: 'Dr. Priya Nair', grandTotal: 1200000, status: 'Pending', dueDate: '2026-08-15' },
      ]);
      setQuotations([
        { _id: 'q1', quotationNumber: 'QTN-VEL-301', clientName: 'Mr. Anand Ahuja', netTotal: 850000, status: 'Accepted', validUntil: '2026-08-30' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async () => {
    if (!invClientName.trim() || !invPrice.trim()) {
      Alert.alert('Validation Error', 'Client name and price are required.');
      return;
    }

    const priceVal = parseFloat(invPrice) || 0;
    const qtyVal = parseInt(invQty) || 1;
    const subtotal = priceVal * qtyVal;
    const gstTotal = subtotal * 0.18;
    const grandTotal = subtotal + gstTotal;

    const payload = {
      invoiceNumber: 'INV-VEL-' + Math.floor(10000 + Math.random() * 90000),
      clientName: invClientName,
      subtotal: subtotal,
      gstTotal: gstTotal,
      grandTotal: grandTotal,
      balanceDue: grandTotal,
      items: [{ description: invDesc, quantity: qtyVal, unitPrice: priceVal, total: subtotal }],
      dueDate: invDueDate,
      status: 'Issued',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/invoices', payload);
      if (res.data.success) {
        Alert.alert('Success', `Invoice ${res.data.data.invoiceNumber} generated.`);
        setIsInvoiceModalOpen(false);
        setInvClientName('');
        fetchData();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create invoice.');
      setLoading(false);
    }
  };

  const handleCreateQuotation = async () => {
    if (!qClientName.trim() || !qPrice.trim()) {
      Alert.alert('Validation Error', 'Client name and price are required.');
      return;
    }

    const priceVal = parseFloat(qPrice) || 0;
    const qtyVal = parseInt(qQty) || 1;
    const amount = priceVal * qtyVal;
    const gstAmount = amount * 0.18;
    const netTotal = amount + gstAmount;

    const payload = {
      quotationNumber: 'QTN-VEL-' + Math.floor(10000 + Math.random() * 90000),
      clientName: qClientName,
      amount: amount,
      gstAmount: gstAmount,
      netTotal: netTotal,
      notes: qDesc,
      validUntil: qValidUntil,
      status: 'Draft',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/quotations', payload);
      if (res.data.success) {
        Alert.alert('Success', `Quotation ${res.data.data.quotationNumber} generated.`);
        setIsQuoteModalOpen(false);
        setQClientName('');
        fetchData();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create quotation.');
      setLoading(false);
    }
  };

  const handleExportPDF = async (id, number, type) => {
    try {
      Alert.alert('Exporting PDF', `Generating PDF document for ${number}...`);
      const endpoint = type === 'invoice' ? `/erp/invoices/${id}/pdf` : `/erp/boq`; // Quotation falls back to general
      await apiClient.get(endpoint);
      Alert.alert('PDF Exported', `${type === 'invoice' ? 'Invoice' : 'Quotation'} PDF exported successfully.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF. Check network connectivity.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Financial Manager"
        subtitle="Billing, Invoices & Quotations"
        showBack={true}
        navigation={navigation}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
          onPress={() => setActiveTab('invoices')}
        >
          <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>
            Tax Invoices ({invoices.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quotations' && styles.activeTab]}
          onPress={() => setActiveTab('quotations')}
        >
          <Text style={[styles.tabText, activeTab === 'quotations' && styles.activeTabText]}>
            Quotations ({quotations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lists */}
      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : activeTab === 'invoices' ? (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color={colors.goldPrimary} />
                  <Text style={styles.number}>{item.invoiceNumber}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.client}>Client: {item.clientName}</Text>
              <Text style={styles.dueDate}>Due Date: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</Text>

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.label}>Grand Total</Text>
                  <Text style={styles.amount}>₹{item.grandTotal?.toLocaleString('en-IN')}</Text>
                </View>

                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => handleExportPDF(item._id, item.invoiceNumber, 'invoice')}
                >
                  <Download size={12} color="#FFF" />
                  <Text style={styles.pdfText}>Tax Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={quotations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color={colors.goldPrimary} />
                  <Text style={styles.number}>{item.quotationNumber}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.client}>Client: {item.clientName}</Text>
              <Text style={styles.dueDate}>Valid Until: {item.validUntil ? new Date(item.validUntil).toLocaleDateString() : 'N/A'}</Text>

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.label}>Net Total</Text>
                  <Text style={styles.amount}>₹{item.netTotal?.toLocaleString('en-IN')}</Text>
                </View>

                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => handleExportPDF(item._id, item.quotationNumber, 'quotation')}
                >
                  <Download size={12} color="#FFF" />
                  <Text style={styles.pdfText}>Quote PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => (activeTab === 'invoices' ? setIsInvoiceModalOpen(true) : setIsQuoteModalOpen(true))}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Create Invoice Modal */}
      <Modal visible={isInvoiceModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Tax Invoice</Text>
              <TouchableOpacity onPress={() => setIsInvoiceModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Client Name"
                value={invClientName}
                onChangeText={setInvClientName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Item/Service Description"
                value={invDesc}
                onChangeText={setInvDesc}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 2 }]}
                  placeholder="Unit Price"
                  keyboardType="numeric"
                  value={invPrice}
                  onChangeText={setInvPrice}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={invQty}
                  onChangeText={setInvQty}
                />
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Due Date (YYYY-MM-DD)"
                value={invDueDate}
                onChangeText={setInvDueDate}
              />

              <View style={styles.calculationPreview}>
                <Text style={styles.calcText}>
                  Subtotal: ₹{((parseFloat(invPrice) || 0) * (parseInt(invQty) || 1)).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.calcText}>GST (18%): Auto Calculated</Text>
                <Text style={styles.calcTotalText}>
                  Grand Total: ₹
                  {(
                    (parseFloat(invPrice) || 0) *
                    (parseInt(invQty) || 1) *
                    1.18
                  ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsInvoiceModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateInvoice}>
                  <Text style={styles.saveText}>Generate</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Quotation Modal */}
      <Modal visible={isQuoteModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Quotation</Text>
              <TouchableOpacity onPress={() => setIsQuoteModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Client Name"
                value={qClientName}
                onChangeText={setQClientName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Notes / Specifications"
                value={qDesc}
                onChangeText={setQDesc}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 2 }]}
                  placeholder="Estimated Price"
                  keyboardType="numeric"
                  value={qPrice}
                  onChangeText={setQPrice}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={qQty}
                  onChangeText={setQQty}
                />
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Valid Until Date (YYYY-MM-DD)"
                value={qValidUntil}
                onChangeText={setQValidUntil}
              />

              <View style={styles.calculationPreview}>
                <Text style={styles.calcText}>
                  Net Value: ₹{((parseFloat(qPrice) || 0) * (parseInt(qQty) || 1)).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.calcText}>GST (18%): Auto Calculated</Text>
                <Text style={styles.calcTotalText}>
                  Net Total: ₹
                  {(
                    (parseFloat(qPrice) || 0) *
                    (parseInt(qQty) || 1) *
                    1.18
                  ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsQuoteModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateQuotation}>
                  <Text style={styles.saveText}>Save Quote</Text>
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.goldPrimary },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  activeTabText: { color: colors.goldPrimary },
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
  number: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  client: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  dueDate: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { fontSize: 10, textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700' },
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
    elevation: 5,
  },

  // Modals
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
