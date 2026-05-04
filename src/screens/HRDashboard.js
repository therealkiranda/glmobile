// src/screens/HRDashboard.js — Fixed API endpoint
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const C = {
  primary: '#1a3c2e', gold: '#c9a96e', bg: '#f4f1eb',
  white: '#ffffff', gray: '#6b7280',
};

export default function HRDashboard({ navigation }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout, api }   = useContext(AuthContext);

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'HR Manager'
    : 'HR Manager';

  const fetchData = async () => {
    try {
      const response = await api.get('/hr/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('HR Dashboard error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0284c7" />

      <View style={[styles.header, { backgroundColor: '#0284c7' }]}>
        <View>
          <Text style={styles.headerSub}>Welcome back,</Text>
          <Text style={styles.headerName}>{displayName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.hotelBar, { backgroundColor: '#0284c7' + '22' }]}>
        <Text style={[styles.hotelBarText, { color: '#0284c7' }]}>
          👥 Grand Lumière — HR Management
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading HR data...</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            {[
              { icon: '👤', value: data?.summary?.total_employees || 0, label: 'Total Staff',     color: '#0284c7' },
              { icon: '✅', value: data?.summary?.active_employees || 0, label: 'Active',         color: '#065f46' },
              { icon: '📋', value: data?.pendingLeaves?.length || 0,    label: 'Pending Leaves',  color: '#d97706' },
              { icon: '🎂', value: data?.summary?.birthdays_this_month || 0, label: 'Birthdays', color: '#7c3aed' },
            ].map(s => (
              <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Recent hires */}
          {(data?.recentHires || []).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Hires</Text>
              {data.recentHires.slice(0, 5).map((e, i) => (
                <View key={i} style={styles.employeeRow}>
                  <View style={styles.empAvatar}>
                    <Text style={styles.empAvatarText}>
                      {(e.first_name?.[0] || '') + (e.last_name?.[0] || '')}
                    </Text>
                  </View>
                  <View style={styles.empInfo}>
                    <Text style={styles.empName}>{e.first_name} {e.last_name}</Text>
                    <Text style={styles.empJob}>{e.job_title || e.department || '—'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick actions */}
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.menuList}>
            {[
              { icon: '👤', label: 'Manage Employees',  color: '#0284c7', screen: 'HREmployees' },
              { icon: '🏢', label: 'Departments',       color: '#7c3aed', screen: 'HRDepartments' },
              { icon: '📋', label: 'Leave Requests',    color: '#d97706', screen: 'HRLeave' },
              { icon: '💰', label: 'Payroll',           color: '#065f46', screen: 'HRPayroll' },
              { icon: '📊', label: 'Attendance',        color: '#dc2626', screen: 'HRAttendance' },
            ].map(a => (
              <TouchableOpacity key={a.label} style={styles.menuItem} onPress={() => navigation.navigate(a.screen)}>
                <View style={[styles.menuIcon, { backgroundColor: a.color + '15' }]}>
                  <Text style={styles.menuEmoji}>{a.icon}</Text>
                </View>
                <Text style={styles.menuText}>{a.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Grand Lumière Hotel Management</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  headerName: { fontSize: 20, fontWeight: '700', color: C.white },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  logoutText: { color: C.white, fontSize: 12, fontWeight: '600' },
  hotelBar: { paddingVertical: 8, alignItems: 'center' },
  hotelBarText: { fontSize: 12, fontWeight: '700' },

  loadingBox: { alignItems: 'center', paddingTop: 80, gap: 16 },
  loadingText: { color: C.gray, fontSize: 14 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  statCard: {
    backgroundColor: C.white, width: '46%', margin: '2%',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, color: C.gray, textAlign: 'center', marginTop: 4 },

  section: {
    backgroundColor: C.white, margin: 16, marginTop: 8,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.primary, marginBottom: 12 },

  employeeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  empAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0284c7' + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  empAvatarText: { fontSize: 14, fontWeight: '700', color: '#0284c7' },
  empInfo: { flex: 1 },
  empName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  empJob: { fontSize: 12, color: C.gray },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.gray,
    letterSpacing: 2, paddingHorizontal: 16, marginBottom: 10,
  },
  menuList: { paddingHorizontal: 16, paddingBottom: 8 },
  menuItem: {
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.primary },
  menuArrow: { fontSize: 24, color: C.gray },

  footer: { alignItems: 'center', padding: 24 },
  footerText: { fontSize: 11, color: C.gray },
});
