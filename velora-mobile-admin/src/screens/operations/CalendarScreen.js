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
import { Calendar as CalendarIcon, Plus, X, MapPin, Clock, Info } from 'lucide-react-native';

const EVENT_TYPES = ['Meeting', 'Site Visit', 'Installation', 'Task', 'Reminder'];

export default function CalendarScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Meeting');
  const [startDate, setStartDate] = useState('2026-08-06T11:00:00.000Z');
  const [location, setLocation] = useState('Velora Design Showroom, Pune');
  const [description, setDescription] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/calendar');
      setEvents(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setEvents([
        { _id: 'e1', title: 'Consultation with Mr. Anand Ahuja', type: 'Meeting', startDate: '2026-08-06T11:00:00.000Z', location: 'Velora Design Showroom, Pune', description: 'Discuss layout finalization & wood sample selection' },
        { _id: 'e2', title: 'Site Inspection - Dr. Priya Nair', type: 'Site Visit', startDate: '2026-08-08T15:00:00.000Z', location: 'Kalyani Nagar Estate', description: 'Check layout dimensions for living room sliding windows' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (!title.trim() || !startDate.trim()) {
      Alert.alert('Validation Error', 'Event title and start date are required.');
      return;
    }

    const payload = {
      title: title,
      type: type,
      startDate: new Date(startDate).toISOString(),
      location: location,
      description: description,
      status: 'Scheduled',
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/calendar', payload);
      if (res.data.success) {
        Alert.alert('Success', `Calendar Event created: ${res.data.data.title}`);
        setIsAddModalOpen(false);
        setTitle('');
        setDescription('');
        fetchEvents();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to schedule calendar event.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Event Calendar"
        subtitle="Meetings, site visits & team schedule"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchEvents();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <CalendarIcon size={18} color={colors.goldPrimary} />
                  <Text style={styles.title}>{item.title}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={styles.infoText}>
                  {new Date(item.startDate).toLocaleDateString()} at{' '}
                  {new Date(item.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              {item.location ? (
                <View style={styles.row}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={styles.infoText}>{item.location}</Text>
                </View>
              ) : null}

              {item.description ? (
                <View style={styles.descBox}>
                  <Info size={12} color={colors.textSecondary} />
                  <Text style={styles.descText}>{item.description}</Text>
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Calendar Event</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Event Title"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.pickerLabel}>Event Type</Text>
              <View style={styles.typeSelector}>
                {EVENT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, type === t && styles.activeTypeChip]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeChipText, type === t && styles.activeTypeChipText]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Date/Time (YYYY-MM-DDTHH:MM:00Z)"
                value={startDate}
                onChangeText={setStartDate}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Event description or notes"
                multiline
                numberOfLines={2}
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateEvent}>
                  <Text style={styles.saveText}>Save Event</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, flex: 1, marginRight: 8 },
  typeBadge: {
    backgroundColor: colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  typeText: { fontSize: 10, fontWeight: '800', color: colors.goldPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12, color: colors.textSecondary },
  descBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  descText: { fontSize: 11, color: colors.textSecondary, flex: 1, fontWeight: '600' },

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
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTypeChip: { backgroundColor: colors.goldPrimary, borderColor: colors.goldPrimary },
  typeChipText: { fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  activeTypeChipText: { color: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
