// src/screens/ReceptionDashboard.js — Fixed API endpoint
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

function BookingRow({ booking, type }) {
  const color = type === 'arrival' ? '#065f46' : '#7c3aed';
  const bg    = type === 'arrival' ? '#d1fae5' : '#ede9fe';
  return (
    <View style={styles.bookingRow}>
      <View style={[styles.bookingBadge, { backgroundColor: bg }]}>
        <Text style={[styles.bookingBadgeText, { color }]}>
          {type === 'arrival' ? 'IN' : 'OUT'}
        </Text>
      </View>
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingName}>
          {booking.guest_first_name} {booking.guest_last_name}
        </Text>
        <Text style={styles.bookingMeta}>Room {booking.room_number || '—'} · {booking.booking_reference}</Text>
      </View>
      <Text style={styles.bookingStatus}>{booking.status}</Text>
    </View>
  );
}

export default function ReceptionDashboard({ navigation }) {
  const [data, setData]         = useState({ arrivals: [], departures: [], occupied: [] });
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout, api }   = useContext(AuthContext);

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Receptionist'
    : 'Receptionist';

  const fetchData = async () => {
    try {
      const response = await api.get('/frontdesk/today');
      setData(response.data || { arrivals: [], departures: [], occupied: [] });
    } catch (error) {
      console.error('Frontdesk error:', error.response?.data || error.message);
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
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Welcome back,</Text>
          <Text style={styles.headerName}>{displayName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hotelBar}>
        <Text style={styles.hotelBarText}>🏨 Grand Lumière — Front Desk</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.gold} />
          <Text style={styles.loadingText}>Loading today's schedule...</Text>
        </View>
      ) : (
        <>
          {/* Today summary */}
          <View style={styles.statsRow}>
            {[
              { icon: '🛬', value: data.arrivals?.length || 0,   label: "Arrivals",   color: '#065f46' },
              { icon: '🛫', value: data.departures?.length || 0, label: "Departures", color: '#7c3aed' },
              { icon: '🛏',  value: data.occupied?.length || 0,   label: "Occupied",   color: '#0284c7' },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: '➕', label: 'New Booking', color: '#1a3c2e' },
              { icon: '✅', label: 'Check In',    color: '#065f46' },
              { icon: '🔑', label: 'Check Out',   color: '#7c3aed' },
              { icon: '🗺', label: 'Room Grid',   color: '#0284c7' },
            ].map(a => (
              <TouchableOpacity key={a.label} style={[styles.actionBtn, { borderTopColor: a.color }]}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Arrivals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Arrivals ({data.arrivals?.length || 0})</Text>
            {(data.arrivals || []).length === 0
              ? <Text style={styles.emptyText}>No arrivals today</Text>
              : (data.arrivals || []).map((b, i) => <BookingRow key={i} booking={b} type="arrival" />)
            }
          </View>

          {/* Departures */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Departures ({data.departures?.length || 0})</Text>
            {(data.departures || []).length === 0
              ? <Text style={styles.emptyText}>No departures today</Text>
              : (data.departures || []).map((b, i) => <BookingRow key={i} booking={b} type="departure" />)
            }
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
    backgroundColor: C.primary,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  headerName: { fontSize: 20, fontWeight: '700', color: C.white },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: { color: C.white, fontSize: 12, fontWeight: '600' },
  hotelBar: { backgroundColor: C.gold, paddingVertical: 8, alignItems: 'center' },
  hotelBarText: { color: C.primary, fontSize: 12, fontWeight: '700' },

  loadingBox: { alignItems: 'center', paddingTop: 80, gap: 16 },
  loadingText: { color: C.gray, fontSize: 14 },

  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 14,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, color: C.gray, marginTop: 2 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.gray,
    letterSpacing: 2, paddingHorizontal: 16, marginBottom: 10, marginTop: 4,
  },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 0 },
  actionBtn: {
    backgroundColor: C.white, width: '46%', margin: '2%',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '700' },

  section: {
    backgroundColor: C.white, margin: 16, marginTop: 8,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.primary, marginBottom: 12 },
  emptyText: { color: C.gray, fontSize: 13, textAlign: 'center', paddingVertical: 12 },

  bookingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  bookingBadge: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  bookingBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bookingInfo: { flex: 1 },
  bookingName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  bookingMeta: { fontSize: 11, color: C.gray, marginTop: 2 },
  bookingStatus: {
    fontSize: 10, color: C.gray, textTransform: 'capitalize',
    backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },

  footer: { alignItems: 'center', padding: 24 },
  footerText: { fontSize: 11, color: C.gray },
});
