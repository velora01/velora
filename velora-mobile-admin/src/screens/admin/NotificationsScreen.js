import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import { Bell, Sparkles } from 'lucide-react-native';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../api/client';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Web Lead Assigned', message: 'Inquiry from Dr. Ananya Kulkarni assigned to Sales Team', timestamp: '5 mins ago' },
    { id: 2, title: 'Milestone Invoice Paid', message: 'Tax Invoice INV-VEL-8419 marked as Paid (₹4,50,000)', timestamp: '1 hour ago' },
    { id: 3, title: 'Factory Production Update', message: 'Koregaon Park Estate Kitchen Cabinets moved to Polishing', timestamp: '3 hours ago' },
  ]);

  useEffect(() => {
    const socketUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    const socket = io(socketUrl);
    socket.on('project-updated', (data) => {
      setNotifications((prev) => [
        { id: Date.now(), title: 'Project Status Updated', message: data.message, timestamp: 'Just now' },
        ...prev,
      ]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Real-Time Notifications" subtitle="Live Socket.io Enterprise Feed" navigation={navigation} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Bell size={16} color={colors.goldPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTop}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.timestamp}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  iconBox: { padding: 10, borderRadius: 12, backgroundColor: colors.goldBg, borderWidth: 1, borderColor: colors.goldBorder, height: 38, width: 38, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  time: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  message: { fontSize: 12, color: colors.textSecondary, lineHeight: 16 },
});
