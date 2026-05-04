// src/screens/AdminDashboard.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

function StatCard({ icon, value, label, color, primary }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ icon, label, onPress, color }) {
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
  const [stats, setStats]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const { user, logout, api, hotelInfo, theme } = useContext(AuthContext);

  const primary = theme?.primary_color || '#1a3c2e';
  const gold    = theme?.secondary_color || '#c9a96e';
  const bg      = theme?.background_color || '#f4f1eb';

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Admin'
    : 'Admin';

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data?.stats || response.data);
    } catch (error) {
      console.error('Dashboard error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} tintColor={gold} />}
    >
      <StatusBar barStyle="light-content" backgroundColor={primary} />

      <View style={[styles.header, { backgroundColor: primary }]}>
        <View>
          <Text style={styles.headerGreeting}>Good {getTimeOfDay()},</Text>
          <Text style={styles.headerName}>{displayName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.hotelBar, { backgroundColor: gold }]}>
        <Text style={[styles.hotelBarText, { color: primary }]}>🏨 {hotelInfo?.name || 'Hotel'} — Admin</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={gold} />
          <Text style={styles.loadingText}>Loading dashboard…</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard icon="📋" value={stats?.total_bookings || 0}    label="Total Bookings"    color="#1a3c2e" />
            <StatCard icon="⏳" value={stats?.pending_bookings || 0}  label="Pending"           color="#d97706" />
            <StatCard icon="🛏" value={stats?.active_guests || 0}     label="Active Guests"     color="#0284c7" />
            <StatCard icon="📅" value={stats?.arrivals_today || 0}    label="Arrivals Today"    color="#7c3aed" />
            <StatCard icon="🚪" value={stats?.departures_today || 0}  label="Departures Today"  color="#dc2626" />
            <StatCard icon="💰" value={`${hotelInfo?.currency_symbol || '$'}${Number(stats?.revenue_this_month || 0).toLocaleString()}`} label="Revenue (Month)" color={gold} />
          </View>

          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.menuList}>
            <MenuButton icon="📋" label="Bookings"  color={primary}   onPress={() => navigation.navigate('AdminBookings')} />
            <MenuButton icon="🛏" label="Rooms"     color="#0284c7"   onPress={() => navigation.navigate('AdminRooms')} />
            <MenuButton icon="👤" label="Customers" color="#7c3aed"   onPress={() => navigation.navigate('AdminCustomers')} />
            <MenuButton icon="👥" label="Staff"     color="#d97706"   onPress={() => navigation.navigate('AdminStaff')} />
            <MenuButton icon="💳" label="Payments"  color="#059669"   onPress={() => navigation.navigate('AdminPayments')} />
            <MenuButton icon="📊" label="Reports"   color="#dc2626"   onPress={() => navigation.navigate('AdminReports')} />
            <MenuButton icon="⚙️" label="Settings"  color="#6b7280"   onPress={() => navigation.navigate('AdminSettings')} />
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{hotelInfo?.name || 'Hotel'} Management System</Text>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  headerName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  hotelBar: { paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center' },
  hotelBarText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  loadingBox: { alignItems: 'center', paddingTop: 80, gap: 16 },
  loadingText: { color: '#6b7280', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  statCard: {
    backgroundColor: '#fff',
    width: '47%', margin: '1.5%',
    borderRadius: 14, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: '#6b7280',
    letterSpacing: 2, paddingHorizontal: 20, marginTop: 8, marginBottom: 12,
  },
  menuList: { paddingHorizontal: 16, paddingBottom: 8 },
  menuItem: {
    backgroundColor: '#fff',
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
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a3c2e' },
  menuArrow: { fontSize: 24, color: '#6b7280', fontWeight: '300' },
  footer: { alignItems: 'center', padding: 24 },
  footerText: { fontSize: 11, color: '#6b7280' },
});
