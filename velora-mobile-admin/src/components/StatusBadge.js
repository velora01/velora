import React from 'react';
import { View, Text, StyleSheet } from 'react me-native'; // Wait, correction below
import { View as RNView, Text as RNText } from 'react-native';
import { colors } from '../theme/colors';

const statusStyles = {
  // Stages
  Lead: { bg: '#F1F5F9', text: '#475569' },
  Consultation: { bg: '#EFF6FF', text: '#2563EB' },
  'Site Visit': { bg: '#F5F3FF', text: '#7C3AED' },
  Quotation: { bg: '#FFFBEB', text: '#D97706' },
  BOQ: { bg: '#FEF3C7', text: '#B45309' },
  Design: { bg: '#FCE7F3', text: '#DB2777' },
  Approval: { bg: '#E0E7FF', text: '#4F46E5' },
  Production: { bg: '#FFEDD5', text: '#C2410C' },
  Dispatch: { bg: '#E0F2FE', text: '#0284C7' },
  Installation: { bg: '#CCFBF1', text: '#0D9488' },
  Handover: { bg: '#D1FAE5', text: '#059669' },
  Completed: { bg: '#DCFCE7', text: '#15803D' },
  
  // Lead Statuses
  Warm: { bg: '#FFFBEB', text: '#D97706' },
  Hot: { bg: '#FEF2F2', text: '#DC2626' },
  Cold: { bg: '#F1F5F9', text: '#64748B' },
  Converted: { bg: '#ECFDF5', text: '#059669' },

  // Financial Statuses
  Paid: { bg: '#ECFDF5', text: '#059669' },
  Pending: { bg: '#FFFBEB', text: '#D97706' },
  Overdue: { bg: '#FEF2F2', text: '#DC2626' },
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || { bg: '#F1F5F9', text: '#475569' };

  return (
    <RNView style={[styles.badge, { backgroundColor: style.bg }]}>
      <RNText style={[styles.text, { color: style.text }]}>{status || 'N/A'}</RNText>
    </RNView>
  );
}

const styles = {
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
};
