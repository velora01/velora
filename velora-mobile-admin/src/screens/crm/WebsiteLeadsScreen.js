import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import apiClient from '../../api/client';
import { Globe, UserCheck, Phone, Mail } from 'lucide-react-native';

export default function WebsiteLeadsScreen({ navigation }) {
  const [webLeads, setWebLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsiteLeads = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/website-leads');
      setWebLeads(res.data.data || []);
    } catch (e) {
      setWebLeads([
        { _id: 'w1', name: 'Mrs. Neha Kulkarni', phone: '+91 98900 12345', email: 'neha@gmail.com', message: 'Looking for 3BHK interior design consultation in Wakad', status: 'Pending' },
        { _id: 'w2', name: 'Vikram Joshi', phone: '+91 97654 00112', email: 'vikram.j@corp.com', message: 'Inquiry for commercial office interior design in Kharadi', status: 'Converted' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteLeads();
  }, []);

  const handleConvertLead = async (id) => {
    try {
      await apiClient.post(`/erp/website-leads/${id}/convert`);
      Alert.alert('Success', 'Lead successfully converted to CRM Lead');
      fetchWebsiteLeads();
    } catch (e) {
      Alert.alert('Error', 'Failed to convert lead');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Website Direct Inquiries" subtitle="Captured from Velora Web & Estimator" navigation={navigation} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={webLeads}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Globe size={16} color={colors.goldPrimary} />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.row}>
                <Phone size={14} color={colors.textMuted} />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
              {item.email ? (
                <View style={styles.row}>
                  <Mail size={14} color={colors.textMuted} />
                  <Text style={styles.infoText}>{item.email}</Text>
                </View>
              ) : null}

              {item.message ? (
                <View style={styles.msgBox}>
                  <Text style={styles.msgText}>"{item.message}"</Text>
                </View>
              ) : null}

              {item.status !== 'Converted' && (
                <TouchableOpacity style={styles.convertBtn} onPress={() => handleConvertLead(item._id)}>
                  <UserCheck size={16} color="#FFF" />
                  <Text style={styles.convertBtnText}>Convert to CRM Lead</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12, color: colors.textSecondary },
  msgBox: { backgroundColor: colors.surfaceAlt, padding: 10, borderRadius: 10, marginTop: 8 },
  msgText: { fontSize: 12, fontStyle: 'italic', color: colors.textSecondary },
  convertBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.textPrimary, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
  convertBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});
