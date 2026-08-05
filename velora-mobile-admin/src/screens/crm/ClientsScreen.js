import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import apiClient from '../../api/client';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Plus,
  PhoneCall,
  User,
  X,
  CreditCard,
} from 'lucide-react-native';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newLog, setNewLog] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Pune',
    address: '',
    gstin: '',
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/clients', { params: { search } });
      setClients(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallback mocks
      setClients([
        {
          _id: 'c1',
          name: 'Rohan Mehta',
          clientCode: 'VEL-C-104',
          phone: '+91 98220 99887',
          email: 'rohan.m@gmail.com',
          city: 'Pune',
          address: 'Koregaon Park, Lane 7',
          activeProjects: 2,
          gstin: '27AAAAA1111A1Z1',
          communicationHistory: [
            { summary: 'Discussed quotation adjustments for modular cabinets', channel: 'Call', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
            { summary: 'Initial site visit requirements catalogued', channel: 'Call', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() },
          ],
        },
        {
          _id: 'c2',
          name: 'Dr. Priya Nair',
          clientCode: 'VEL-C-108',
          phone: '+91 94220 11445',
          email: 'priya.nair@health.org',
          city: 'Pune',
          address: 'Kalyani Nagar Estate',
          activeProjects: 1,
          gstin: '',
          communicationHistory: [],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone) {
      Alert.alert('Validation Error', 'Client name and phone number are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/clients', newClient);
      if (res.data.success) {
        Alert.alert('Success', 'Client profile successfully registered.');
        setIsAddModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', city: 'Pune', address: '', gstin: '' });
        fetchClients();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create client profile.');
      setLoading(false);
    }
  };

  const handleAddCommunicationLog = async () => {
    if (!newLog.trim()) {
      Alert.alert('Error', 'Communication summary cannot be empty.');
      return;
    }

    try {
      const res = await apiClient.post(`/erp/clients/${selectedClient._id}/communication`, {
        summary: newLog,
        channel: 'Call',
      });

      if (res.data.success) {
        const updatedClient = res.data.data;
        setSelectedClient(updatedClient);
        setNewLog('');
        // Refresh client in the main list
        setClients((prev) => prev.map((c) => (c._id === updatedClient._id ? updatedClient : c)));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add communication log.');
    }
  };

  const makeCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Calling is not supported on this device.');
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Clients Directory"
        subtitle="Bespoke Client Accounts & 360 Logs"
        showBack={true}
        navigation={navigation}
      />

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients by name, phone, or code..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddModalOpen(true)}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Clients FlatList */}
      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchClients();
          }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedClient(item)}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.codeBadge}>
                    <ShieldCheck size={12} color={colors.goldPrimary} />
                    <Text style={styles.codeText}>{item.clientCode}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => makeCall(item.phone)}>
                  <Phone size={12} color="#FFF" />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <Phone size={12} color={colors.textMuted} />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
              {item.email ? (
                <View style={styles.row}>
                  <Mail size={12} color={colors.textMuted} />
                  <Text style={styles.infoText}>{item.email}</Text>
                </View>
              ) : null}
              {item.address ? (
                <View style={styles.row}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={styles.infoText}>
                    {item.address}, {item.city}
                  </Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.projectsCount}>
                  Active Projects: {item.activeProjects || 1}
                </Text>
                <Text style={styles.viewProfileText}>View Profile 360 →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Client 360 Profile Drawer/Modal */}
      <Modal visible={!!selectedClient} animationType="slide" transparent>
        <View style={styles.drawerBg}>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Client 360 Profile</Text>
              <TouchableOpacity onPress={() => setSelectedClient(null)} style={styles.closeBtn}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedClient && (
              <ScrollView contentContainerStyle={styles.drawerContent}>
                {/* Profile Card */}
                <View style={styles.profileSummaryCard}>
                  <Text style={styles.profileName}>{selectedClient.name}</Text>
                  <Text style={styles.profileCode}>Code: {selectedClient.clientCode}</Text>
                  <Text style={styles.profileDetail}>Phone: {selectedClient.phone}</Text>
                  <Text style={styles.profileDetail}>Email: {selectedClient.email || 'N/A'}</Text>
                  <Text style={styles.profileDetail}>City: {selectedClient.city}</Text>
                  {selectedClient.address ? (
                    <Text style={styles.profileDetail}>Address: {selectedClient.address}</Text>
                  ) : null}
                  {selectedClient.gstin ? (
                    <View style={styles.gstBadge}>
                      <CreditCard size={12} color={colors.successText} />
                      <Text style={styles.gstText}>GSTIN: {selectedClient.gstin}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Communication History Section */}
                <View style={styles.commHistorySection}>
                  <Text style={styles.sectionHeaderTitle}>
                    <PhoneCall size={16} color={colors.goldPrimary} /> Communication History Logs
                  </Text>

                  {/* Add log entry inline form */}
                  <View style={styles.addLogBox}>
                    <TextInput
                      style={styles.logInput}
                      placeholder="Add conversation call summary..."
                      value={newLog}
                      onChangeText={setNewLog}
                    />
                    <TouchableOpacity style={styles.logAddBtn} onPress={handleAddCommunicationLog}>
                      <Text style={styles.logAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Logs list */}
                  {selectedClient.communicationHistory && selectedClient.communicationHistory.length > 0 ? (
                    selectedClient.communicationHistory.map((log, idx) => (
                      <View key={idx} style={styles.logCard}>
                        <Text style={styles.logSummary}>{log.summary}</Text>
                        <Text style={styles.logMeta}>
                          {log.channel} • {log.performedBy || 'Staff'} •{' '}
                          {new Date(log.timestamp).toLocaleDateString()} at{' '}
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyLogsBox}>
                      <Text style={styles.emptyLogsText}>No communication logs recorded yet.</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Client Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Client Profile</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Full Client/Business Name"
                value={newClient.name}
                onChangeText={(t) => setNewClient({ ...newClient, name: t })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Primary Contact Phone"
                keyboardType="phone-pad"
                value={newClient.phone}
                onChangeText={(t) => setNewClient({ ...newClient, phone: t })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Email Address"
                keyboardType="email-address"
                value={newClient.email}
                onChangeText={(t) => setNewClient({ ...newClient, email: t })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="City Location"
                value={newClient.city}
                onChangeText={(t) => setNewClient({ ...newClient, city: t })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Tax GSTIN Number (Optional)"
                value={newClient.gstin}
                onChangeText={(t) => setNewClient({ ...newClient, gstin: t })}
              />
              <TextInput
                style={[styles.modalInput, { height: 70 }]}
                placeholder="Complete Project Site Address"
                multiline
                numberOfLines={3}
                value={newClient.address}
                onChangeText={(t) => setNewClient({ ...newClient, address: t })}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddClient}>
                  <Text style={styles.saveText}>Register Client</Text>
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
  filterSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.textPrimary },
  addBtn: {
    backgroundColor: colors.goldPrimary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  codeText: { fontSize: 11, fontWeight: '700', color: colors.goldPrimary },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12, color: colors.textSecondary },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  projectsCount: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  viewProfileText: { fontSize: 11, fontWeight: '700', color: colors.goldPrimary },

  // Drawer / 360 Profile Styles
  drawerBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  drawerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  drawerTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  closeBtn: { padding: 4 },
  drawerContent: { paddingBottom: 40 },
  profileSummaryCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  profileName: { fontSize: 16, fontWeight: '900', color: colors.textPrimary },
  profileCode: { fontSize: 12, color: colors.goldPrimary, fontWeight: '700', marginTop: 2, marginBottom: 8 },
  profileDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  gstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  gstText: { fontSize: 10, fontWeight: '800', color: colors.successText },

  commHistorySection: { marginTop: 10 },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  addLogBox: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  logInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    color: colors.textPrimary,
  },
  logAddBtn: {
    backgroundColor: colors.goldPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  logAddBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  logCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  logSummary: { fontSize: 12, color: colors.textPrimary, fontWeight: '600' },
  logMeta: { fontSize: 10, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  emptyLogsBox: { padding: 20, alignItems: 'center' },
  emptyLogsText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },

  // Modal forms
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingBottom: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
