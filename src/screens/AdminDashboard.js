// src/screens/AdminDashboard.js
// Fixed: correct API endpoint /api/admin/dashboard, uses api from AuthContext
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const C = {
  primary: '#1a3c2e', gold: '#c9a96e', bg: '#f4f1eb',
  white: '#ffffff', gray: '#6b7280', lightBg: '#fffef9',
  border: '#e5e0d5',
};

function StatCard({ icon, value, label, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ icon, label, onPress, color = C.primary }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
        <Text style={styles.menuEmoji}>{icon}</Text>
      </View>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboard({ navigation }) {
  const [stats, setStats]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]   = useState(true);
  const { user, logout, api }   = useContext(AuthContext);

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin'
    : 'Admin';

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Dashboard fetch error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Good {getTimeOfDay()},</Text>
          <Text style={styles.headerName}>{displayName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Hotel name bar */}
      <View style={styles.hotelBar}>
        <Text style={styles.hotelBarText}>🏨 Grand Lumière Hotel — Admin</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard icon="📋" value={stats?.total_bookings || 0}     label="Total Bookings"   color={C.primary} />
            <StatCard icon="⏳" value={stats?.pending_bookings || 0}   label="Pending"          color="#d97706" />
            <StatCard icon="🛏" value={stats?.active_guests || 0}      label="Active Guests"    color="#0284c7" />
            <StatCard icon="📅" value={stats?.arrivals_today || 0}     label="Arrivals Today"   color="#7c3aed" />
            <StatCard icon="🚪" value={stats?.departures_today || 0}   label="Departures Today" color="#dc2626" />
            <StatCard icon="💰" value={`$${Number(stats?.revenue_this_month || 0).toLocaleString()}`} label="Revenue (Month)" color={C.gold} />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.menuList}>
            <MenuButton icon="📋" label="Bookings"        color="#1a3c2e" onPress={() => {}} />
            <MenuButton icon="🛏" label="Rooms"           color="#0284c7" onPress={() => {}} />
            <MenuButton icon="👤" label="Customers"       color="#7c3aed" onPress={() => {}} />
            <MenuButton icon="👥" label="Staff"           color="#d97706" onPress={() => {}} />
            <MenuButton icon="💳" label="Payments"        color="#059669" onPress={() => {}} />
            <MenuButton icon="📊" label="Reports"         color="#dc2626" onPress={() => {}} />
            <MenuButton icon="⚙️" label="Settings"        color="#6b7280" onPress={() => {}} />
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Grand Lumière Hotel Management System</Text>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.primary,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  headerName: { fontSize: 20, fontWeight: '700', color: C.white },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: { color: C.white, fontSize: 12, fontWeight: '600' },

  hotelBar: {
    backgroundColor: C.gold,
    paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center',
  },
  hotelBarText: { color: C.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  loadingBox: { alignItems: 'center', paddingTop: 80, gap: 16 },
  loadingText: { color: C.gray, fontSize: 14 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    backgroundColor: C.white,
    width: '47%', margin: '1.5%',
    borderRadius: 14, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: C.gray, textAlign: 'center' },

  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: C.gray,
    letterSpacing: 2, paddingHorizontal: 20, marginTop: 8, marginBottom: 12,
  },
  menuList: { paddingHorizontal: 16, paddingBottom: 8 },
  menuItem: {
    backgroundColor: C.white,
    borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.primary },
  menuArrow: { fontSize: 24, color: C.gray, fontWeight: '300' },

  footer: { alignItems: 'center', padding: 24 },
  footerText: { fontSize: 11, color: C.gray },
});
