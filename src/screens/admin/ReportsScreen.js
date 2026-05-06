// src/screens/admin/ReportsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, LoadingView } from '../../components/SharedComponents';

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
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
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const primary        = theme?.primary_color || C.primary;
  const gold           = theme?.secondary_color || '#c9a96e';
  const currencySymbol = hotelInfo?.currency_symbol || 'Rs';

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data?.stats || res.data);
    } catch (e) {
      console.error('Reports error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const fmt = (n) => n != null ? `${currencySymbol}${Number(n).toLocaleString()}` : '—';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} tintColor={gold} />}
    >
      <ScreenHeader title="Reports" subtitle="Overview" onBack={() => navigation.goBack()} color={primary} />
      <View style={[styles.dateBar, { backgroundColor: gold + '20' }]}>
        <Text style={[styles.dateText, { color: primary }]}>📅 {today}</Text>
      </View>

      {loading ? <LoadingView /> : (
        <View style={styles.content}>
          <Section title="📋 Bookings">
            <StatRow label="Total Bookings"   value={data?.total_bookings} />
            <StatRow label="Pending"          value={data?.pending_bookings} />
            <StatRow label="Active Guests"    value={data?.active_guests} />
          </Section>
          <Section title="📅 Today">
            <StatRow label="Arrivals Today"   value={data?.arrivals_today} />
            <StatRow label="Departures Today" value={data?.departures_today} />
          </Section>
          <Section title="💰 Revenue">
            <StatRow label="This Month"       value={fmt(data?.revenue_this_month)} />
            <StatRow label="Total Revenue"    value={fmt(data?.total_revenue)} />
          </Section>
          <Section title="🛏 Rooms">
            <StatRow label="Total Rooms"      value={data?.total_rooms} />
            <StatRow label="Available"        value={data?.available_rooms} />
            <StatRow label="Occupied"         value={data?.occupied_rooms} />
            <StatRow label="Maintenance"      value={data?.maintenance_rooms} />
            <StatRow label="Occupancy Rate"   value={data?.occupancy_rate != null ? `${data.occupancy_rate}%` : '—'} />
          </Section>
          {data?.top_room_types?.length ? (
            <Section title="🏆 Top Room Types">
              {data.top_room_types.map((r, i) => (
                <StatRow key={i} label={r.name} value={`${r.bookings} bookings`} />
              ))}
            </Section>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateBar: { paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  dateText: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.primary, marginBottom: 12 },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  statLabel: { fontSize: 13, color: '#374151' },
  statValue: { fontSize: 15, fontWeight: '700', color: C.primary },
});
