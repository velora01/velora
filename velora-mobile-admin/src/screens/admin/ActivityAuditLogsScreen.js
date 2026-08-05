import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import apiClient from '../../api/client';
import { ShieldAlert, Clock } from 'lucide-react-native';

export default function ActivityAuditLogsScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/activity-logs');
      setLogs(res.data.data || []);
    } catch (e) {
      setLogs([
        { _id: 'l1', userName: 'Admin', action: 'Created', module: 'Projects', description: 'Created project Koregaon Park Estate', timestamp: '2026-08-05 14:30' },
        { _id: 'l2', userName: 'Admin', action: 'Updated', module: 'Leads', description: 'Assigned lead Dr. Ananya Kulkarni', timestamp: '2026-08-05 12:15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Activity & Audit Logs" subtitle="Security Trail & Module Actions" navigation={navigation} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.user}>{item.userName} • {item.module}</Text>
                <View style={styles.actionBadge}>
                  <Text style={styles.actionText}>{item.action}</Text>
                </View>
              </View>

              <Text style={styles.desc}>{item.description}</Text>

              <View style={styles.timeRow}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
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
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  user: { fontSize: 12, fontWeight: '800', color: colors.textSecondary },
  actionBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  actionText: { fontSize: 10, fontWeight: '800', color: colors.textPrimary },
  desc: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', marginBottom: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, color: colors.textMuted },
});
