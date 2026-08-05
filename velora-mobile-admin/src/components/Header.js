import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Bell, LogOut, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, subtitle, showBack, navigation }) {
  const { logout, user } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity 
          onPress={() => navigation?.navigate('Notifications')} 
          style={styles.iconBtn}
        >
          <Bell size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.iconBtn}>
          <LogOut size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
});
