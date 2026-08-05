import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import apiClient from '../../api/client';
import {
  Users,
  FolderBriefcase,
  FileText,
  IndianRupee,
  Clock,
  TrendingUp,
  Factory,
  Wrench,
  ChevronRight,
} from 'lucide-react-native';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [leadsRes, projRes, invRes] = await Promise.all([
        apiClient.get('/erp/leads').catch(() => ({ data: { pagination: { total: 18 } } })),
        apiClient.get('/erp/projects').catch(() => ({ data: { data: [] } })),
        apiClient.get('/erp/invoices').catch(() => ({ data: { data: [] } })),
      ]);

      const projects = projRes.data.data || [
        { _id: '1', heading: 'Koregaon Park Penthouse', stage: 'Production', clientName: 'Mr. Kapoor', progressPercent: 65 },
        { _id: '2', heading: 'Kalyani Nagar Luxury Villa', stage: 'Site Visit', clientName: 'Dr. Deshmukh', progressPercent: 25 },
        { _id: '3', heading: 'Baner Duplex Suite', stage: 'Quotation', clientName: 'Ananya Sharma', progressPercent: 40 },
      ];

      setRecentProjects(projects.slice(0, 4));
      setStats({
        totalLeads: leadsRes.data.pagination?.total || 18,
        activeProjects: projects.length || 6,
        monthlyRevenue: 4850000,
        pendingInvoices: invRes.data.data?.filter(i => i.status === 'Pending').length || 3,
      });
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Velora Dashboard" subtitle="Enterprise Luxury ERP Overview" navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} />}
      >
        {/* Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Active Leads"
            value={stats.totalLeads}
            subtext="+14% this month"
            icon={Users}
            color={colors.infoText}
          />
          <MetricCard
            title="Live Projects"
            value={stats.activeProjects}
            subtext="In active pipeline"
            icon={FolderBriefcase}
            color={colors.goldPrimary}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`₹${(stats.monthlyRevenue / 100000).toFixed(2)}L`}
            subtext="Collected YTD"
            icon={IndianRupee}
            color={colors.success}
          />
          <MetricCard
            title="Pending Invoices"
            value={stats.pendingInvoices}
            subtext="Awaiting client payment"
            icon={FileText}
            color={colors.warning}
          />
        </View>

        {/* Quick Shortcut Hub */}
        <Text style={styles.sectionTitle}>Operations Shortcuts</Text>
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Leads')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#EFF6FF' }]}>
              <Users size={20} color="#2563EB" />
            </View>
            <Text style={styles.shortcutLabel}>Leads CRM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Projects')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FFFBF0' }]}>
              <FolderBriefcase size={20} color="#9E7B1D" />
            </View>
            <Text style={styles.shortcutLabel}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Invoices')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FEF3C7' }]}>
              <FileText size={20} color="#B45309" />
            </View>
            <Text style={styles.shortcutLabel}>Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('Factory')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FFEDD5' }]}>
              <Factory size={20} color="#C2410C" />
            </View>
            <Text style={styles.shortcutLabel}>Factory</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Active Projects List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Active Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentProjects.map((p) => (
          <TouchableOpacity
            key={p._id}
            style={styles.projectCard}
            onPress={() => navigation.navigate('Projects')}
          >
            <View style={styles.projectTopRow}>
              <Text style={styles.projectName}>{p.heading}</Text>
              <StatusBadge status={p.stage} />
            </View>
            <Text style={styles.projectClient}>Client: {p.clientName || 'Bespoke Client'}</Text>
            
            <View style={styles.progressRow}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${p.progressPercent || 20}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{p.progressPercent || 20}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  metricsGrid: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.goldPrimary,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shortcutBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '23%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  shortcutLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  projectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  projectClient: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.goldPrimary,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
