import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import apiClient from '../../api/client';
import { FolderBriefcase, ChevronRight, User, Calendar, Sliders } from 'lucide-react-native';

const STAGES = [
  'Lead',
  'Consultation',
  'Site Visit',
  'Quotation',
  'BOQ',
  'Design',
  'Approval',
  'Production',
  'Dispatch',
  'Installation',
  'Handover',
  'Completed',
];

export default function ProjectsKanbanScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [selectedStage, setSelectedStage] = useState('Consultation');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/projects');
      setProjects(res.data.data || []);
    } catch (e) {
      setProjects([
        { _id: 'p1', heading: 'Koregaon Park Estate', stage: 'Production', clientName: 'Anand Ahuja', budget: 12000000, progressPercent: 65 },
        { _id: 'p2', heading: 'Kalyani Nagar Villa', stage: 'Site Visit', clientName: 'Rajesh Shah', budget: 8500000, progressPercent: 20 },
        { _id: 'p3', heading: 'Baner Duplex Suite', stage: 'Consultation', clientName: 'Priya Nair', budget: 4500000, progressPercent: 15 },
        { _id: 'p4', heading: 'Viman Nagar Penthouse', stage: 'Quotation', clientName: 'Suresh Patil', budget: 6000000, progressPercent: 35 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateStage = async (id, nextStage) => {
    try {
      await apiClient.put(`/erp/projects/${id}/stage`, { stage: nextStage });
      Alert.alert('Updated', `Project stage updated to ${nextStage}`);
      fetchProjects();
    } catch (e) {
      Alert.alert('Error', 'Failed to update stage');
    }
  };

  const filteredProjects = projects.filter((p) => p.stage === selectedStage);

  return (
    <View style={styles.container}>
      <Header title="Projects Pipeline" subtitle="12-Stage Mobile Kanban Board" navigation={navigation} />

      {/* Stage Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageBar}>
        {STAGES.map((st) => {
          const count = projects.filter((p) => p.stage === st).length;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.stageChip, selectedStage === st && styles.activeStageChip]}
              onPress={() => setSelectedStage(st)}
            >
              <Text style={[styles.stageChipText, selectedStage === st && styles.activeStageChipText]}>
                {st} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Projects List for Selected Stage */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : filteredProjects.length === 0 ? (
        <View style={styles.emptyBox}>
          <FolderBriefcase size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>No projects currently in {selectedStage} stage</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.heading}>{item.heading}</Text>
                <StatusBadge status={item.stage} />
              </View>

              <Text style={styles.client}>Client: {item.clientName || 'Bespoke Client'}</Text>
              <Text style={styles.budget}>Value: ₹{(item.budget / 100000).toFixed(1)} Lakhs</Text>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Overall Completion</Text>
                  <Text style={styles.progressVal}>{item.progressPercent || 15}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${item.progressPercent || 15}%` }]} />
                </View>
              </View>

              {/* Quick Move Stage Actions */}
              <View style={styles.stageMoveBox}>
                <Text style={styles.moveTitle}>Advance Stage:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moveRow}>
                  {STAGES.filter(s => s !== item.stage).slice(0, 4).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.moveBtn}
                      onPress={() => handleUpdateStage(item._id, s)}
                    >
                      <Text style={styles.moveBtnText}>→ {s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
  stageBar: { paddingHorizontal: 16, marginVertical: 12, maxHeight: 44 },
  stageChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 8, height: 36, justifyContent: 'center' },
  activeStageChip: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  stageChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  activeStageChipText: { color: '#FFF' },
  list: { padding: 16 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  heading: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: 8 },
  client: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  budget: { fontSize: 13, fontWeight: '800', color: colors.goldPrimary, marginBottom: 12 },
  progressSection: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  progressVal: { fontSize: 11, color: colors.textPrimary, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.goldPrimary },
  stageMoveBox: { paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  moveTitle: { fontSize: 10, textTransform: 'uppercase', color: colors.textMuted, fontWeight: '700', marginBottom: 6 },
  moveRow: { flexDirection: 'row' },
  moveBtn: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  moveBtnText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
});
