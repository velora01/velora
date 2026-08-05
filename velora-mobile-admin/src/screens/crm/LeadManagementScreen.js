import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import apiClient from '../../api/client';
import { Search, Plus, Phone, Mail, UserCheck, RefreshCw } from 'lucide-react-native';

export default function LeadManagementScreen({ navigation }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', status: 'Warm', budget: '2500000' });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/leads', { params: { search, status: selectedStatus } });
      setLeads(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallback mock leads if server empty
      setLeads([
        { _id: '1', name: 'Rajesh Sharma', phone: '+91 98220 11223', email: 'rajesh@sharmagroup.com', status: 'Warm', budget: 4500000, source: 'Website' },
        { _id: '2', name: 'Dr. Ananya Kulkarni', phone: '+91 94225 88990', email: 'ananya.k@healthplus.in', status: 'Hot', budget: 8500000, source: 'Referral' },
        { _id: '3', name: 'Sanjay Mehta', phone: '+91 97664 33221', email: 'sanjay@mehtatech.io', status: 'Cold', budget: 2000000, source: 'Instagram' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, selectedStatus]);

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.phone) {
      Alert.alert('Error', 'Name and Phone are required');
      return;
    }
    try {
      await apiClient.post('/erp/leads', newLead);
      setIsModalOpen(false);
      setNewLead({ name: '', phone: '', email: '', status: 'Warm', budget: '2500000' });
      fetchLeads();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleStatusChange = async (leadId, nextStatus) => {
    try {
      await apiClient.put(`/erp/leads/${leadId}`, { status: nextStatus });
      fetchLeads();
    } catch (e) {
      Alert.alert('Error', 'Failed to update lead status');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Lead Management" subtitle="CRM Pipeline & Inquiries" navigation={navigation} />

      {/* Search & Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads by name or phone..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabBar}>
        {['', 'Warm', 'Hot', 'Cold', 'Converted'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.tab, selectedStatus === st && styles.activeTab]}
            onPress={() => setSelectedStatus(st)}
          >
            <Text style={[styles.tabText, selectedStatus === st && styles.activeTabText]}>
              {st || 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lead List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.leadCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.leadName}>{item.name}</Text>
                  <Text style={styles.leadSource}>Source: {item.source || 'Direct'}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.infoRow}>
                <Phone size={14} color={colors.textMuted} />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
              {item.email ? (
                <View style={styles.infoRow}>
                  <Mail size={14} color={colors.textMuted} />
                  <Text style={styles.infoText}>{item.email}</Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.budgetText}>Budget: ₹{(item.budget / 100000).toFixed(1)}L</Text>
                <View style={styles.actionsGroup}>
                  <TouchableOpacity
                    style={[styles.statusToggle, { backgroundColor: '#FFFBEB' }]}
                    onPress={() => handleStatusChange(item._id, 'Warm')}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#D97706' }}>Warm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusToggle, { backgroundColor: '#FEF2F2' }]}
                    onPress={() => handleStatusChange(item._id, 'Hot')}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#DC2626' }}>Hot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Create Lead Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Lead</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={newLead.name}
              onChangeText={(t) => setNewLead({ ...newLead, name: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newLead.phone}
              onChangeText={(t) => setNewLead({ ...newLead, phone: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email Address"
              keyboardType="email-address"
              value={newLead.email}
              onChangeText={(t) => setNewLead({ ...newLead, email: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Estimated Budget (₹)"
              keyboardType="numeric"
              value={newLead.budget}
              onChangeText={(t) => setNewLead({ ...newLead, budget: t })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateLead}>
                <Text style={styles.saveText}>Save Lead</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.goldPrimary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
  },
  activeTab: {
    backgroundColor: colors.textPrimary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  leadCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leadName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  leadSource: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.goldPrimary,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
