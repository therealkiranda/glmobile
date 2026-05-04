// src/screens/admin/ReportsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, LoadingView } from '../../components/SharedComponents';

function StatRow({ label, value, sub }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statRight}>
        <Text style={styles.statValue}>{value}</Text>
        {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Card>
  );
}

export default function ReportsScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      // Try multiple possible endpoints
      const [dashRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
      ]);
      const stats = dashRes.status === 'fulfilled' ? dashRes.value.data?.stats : null;
      setData(stats);
    } catch (e) {
      console.error('Reports error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} tintColor={C.gold} />}
    >
      <ScreenHeader title="Reports" subtitle="Overview" onBack={() => navigation.goBack()} />

      <View style={styles.dateBar}>
        <Text style={styles.dateText}>📅 {today}</Text>
      </View>

      {loading ? <LoadingView /> : (
        <View style={styles.content}>
          <Section title="📋 Bookings">
            <StatRow label="Total Bookings" value={data?.total_bookings ?? '—'} />
            <StatRow label="Pending" value={data?.pending_bookings ?? '—'} />
            <StatRow label="Active Guests" value={data?.active_guests ?? '—'} />
          </Section>

          <Section title="📅 Today">
            <StatRow label="Arrivals" value={data?.arrivals_today ?? '—'} />
            <StatRow label="Departures" value={data?.departures_today ?? '—'} />
          </Section>

          <Section title="💰 Revenue">
            <StatRow label="This Month" value={data?.revenue_this_month != null ? `$${Number(data.revenue_this_month).toLocaleString()}` : '—'} />
            <StatRow label="Total" value={data?.total_revenue != null ? `$${Number(data.total_revenue).toLocaleString()}` : '—'} />
          </Section>

          <Section title="🛏 Rooms">
            <StatRow label="Total Rooms" value={data?.total_rooms ?? '—'} />
            <StatRow label="Available" value={data?.available_rooms ?? '—'} />
            <StatRow label="Occupied" value={data?.occupied_rooms ?? '—'} />
            <StatRow label="Occupancy Rate" value={data?.occupancy_rate != null ? `${data.occupancy_rate}%` : '—'} />
          </Section>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  dateBar: {
    backgroundColor: C.gold + '25', paddingVertical: 8, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  dateText: { fontSize: 12, color: C.primary, fontWeight: '600' },
  content: { padding: 16 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.primary, marginBottom: 12 },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  statLabel: { fontSize: 13, color: '#374151' },
  statRight: { alignItems: 'flex-end' },
  statValue: { fontSize: 15, fontWeight: '700', color: C.primary },
  statSub: { fontSize: 10, color: C.gray, marginTop: 1 },
});
