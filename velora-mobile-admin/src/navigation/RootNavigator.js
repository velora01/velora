import React from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LeadManagementScreen from '../screens/crm/LeadManagementScreen';
import WebsiteLeadsScreen from '../screens/crm/WebsiteLeadsScreen';
import ClientsScreen from '../screens/crm/ClientsScreen';
import ProjectsKanbanScreen from '../screens/projects/ProjectsKanbanScreen';
import BOQManagerScreen from '../screens/financials/BOQManagerScreen';
import QuotationInvoiceScreen from '../screens/financials/QuotationInvoiceScreen';
import PaymentsScreen from '../screens/financials/PaymentsScreen';
import ProductionFactoryScreen from '../screens/operations/ProductionFactoryScreen';
import InventoryMaterialsScreen from '../screens/operations/InventoryMaterialsScreen';
import InstallationManagerScreen from '../screens/operations/InstallationManagerScreen';
import SiteVisitsScreen from '../screens/operations/SiteVisitsScreen';
import CalendarScreen from '../screens/operations/CalendarScreen';
import NotificationsScreen from '../screens/admin/NotificationsScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import ActivityAuditLogsScreen from '../screens/admin/ActivityAuditLogsScreen';
import ReportsAnalyticsScreen from '../screens/admin/ReportsAnalyticsScreen';

import {
  LayoutDashboard,
  Users,
  FolderBriefcase,
  Factory,
  Grid,
  Globe,
  FileText,
  Boxes,
  Calendar as CalendarIcon,
  ShieldCheck,
  Bell,
  BarChart3,
  CreditCard,
  Wrench,
  Compass,
} from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MoreMenuScreen({ navigation }) {
  const menuItems = [
    { title: 'Website Inquiries', route: 'WebsiteLeads', icon: Globe, color: colors.goldPrimary },
    { title: 'Clients Directory', route: 'Clients', icon: ShieldCheck, color: colors.infoText },
    { title: 'BOQ Estimator', route: 'BOQ', icon: FileText, color: colors.goldPrimary },
    { title: 'Invoices & Quotes', route: 'Invoices', icon: CreditCard, color: colors.success },
    { title: 'Payment Receipts', route: 'Payments', icon: CreditCard, color: colors.warning },
    { title: 'Inventory Materials', route: 'Inventory', icon: Boxes, color: colors.infoText },
    { title: 'Site Installations', route: 'Installation', icon: Wrench, color: colors.goldPrimary },
    { title: 'Site Visits', route: 'SiteVisits', icon: Compass, color: colors.success },
    { title: 'Schedule Calendar', route: 'Calendar', icon: CalendarIcon, color: colors.goldPrimary },
    { title: 'Reports & Analytics', route: 'Reports', icon: BarChart3, color: colors.infoText },
    { title: 'Notifications Feed', route: 'Notifications', icon: Bell, color: colors.goldPrimary },
    { title: 'User Management', route: 'Users', icon: Users, color: colors.textPrimary },
    { title: 'Activity Audit Logs', route: 'Logs', icon: ShieldCheck, color: colors.textMuted },
  ];

  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuHeaderTitle}>Velora Luxury ERP Suite</Text>
        <Text style={styles.menuHeaderSubtitle}>Complete Point-to-Point Operations</Text>
      </View>
      <View style={styles.menuGrid}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                <Icon size={20} color={item.color} />
              </View>
              <Text style={styles.menuCardText}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadManagementScreen}
        options={{
          tabBarLabel: 'CRM Leads',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsKanbanScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => <FolderBriefcase size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Factory"
        component={ProductionFactoryScreen}
        options={{
          tabBarLabel: 'Factory',
          tabBarIcon: ({ color, size }) => <Factory size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreMenuScreen}
        options={{
          tabBarLabel: 'More Suite',
          tabBarIcon: ({ color, size }) => <Grid size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.goldPrimary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="WebsiteLeads" component={WebsiteLeadsScreen} />
            <Stack.Screen name="Clients" component={ClientsScreen} />
            <Stack.Screen name="BOQ" component={BOQManagerScreen} />
            <Stack.Screen name="Invoices" component={QuotationInvoiceScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="Inventory" component={InventoryMaterialsScreen} />
            <Stack.Screen name="Installation" component={InstallationManagerScreen} />
            <Stack.Screen name="SiteVisits" component={SiteVisitsScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Reports" component={ReportsAnalyticsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Users" component={UserManagementScreen} />
            <Stack.Screen name="Logs" component={ActivityAuditLogsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    paddingTop: 48,
  },
  menuHeader: {
    marginBottom: 20,
  },
  menuHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  menuHeaderSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIconBox: {
    padding: 8,
    borderRadius: 10,
  },
  menuCardText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
});
