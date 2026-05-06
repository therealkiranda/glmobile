// src/screens/hr/AttendanceScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

const STATUS_MAP = {
  present: { color: C.success, bg: '#d1fae5', label: 'PRESENT' },
  absent:  { color: C.danger,  bg: '#fee2e2', label: 'ABSENT' },
  late:    { color: '#d97706', bg: '#fef3c7', label: 'LATE' },
  leave:   { color: C.blue,   bg: '#dbeafe', label: 'LEAVE' },
  half_day:{ color: C.purple, bg: '#ede9fe', label: 'HALF DAY' },
};

function AttendanceCard({ record }) {
  const initials = ((record.first_name?.[0] || '') + (record.last_name?.[0] || '')).toUpperCase() || '?';
  const sc = STATUS_MAP[record.status] || { color: C.gray, bg: '#f1f5f9', label: 'UNKNOWN' };
  const date = record.date ? record.date.slice(0, 10) : '—';

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{record.first_name} {record.last_name}</Text>
          <Text style={styles.dept}>{record.department || '—'} · {date}</Text>
          <View style={styles.timeRow}>
            {record.check_in && <Text style={styles.time}>🟢 In: {record.check_in.slice(0,5)}</Text>}
            {record.check_out && <Text style={styles.time}>🔴 Out: {record.check_out.slice(0,5)}</Text>}
            {record.break_minutes ? <Text style={styles.time}>☕ Break: {record.break_minutes}m</Text> : null}
          </View>
          {record.notes ? <Text style={styles.notes} numberOfLines={1}>📝 {record.notes}</Text> : null}
        </View>
        <StatusBadge label={sc.label} color={sc.color} bg={sc.bg} />
      </View>
    </Card>
  );
}

export default function AttendanceScreen({ navigation }) {
  const { api, theme } = useContext(AuthContext);
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');

  const primary = theme?.primary_color || C.primary;

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await api.get('/hr/attendance', { params: { date_from: today, date_to: today } });
      const d = res.data;
      setRecords(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      console.error('Attendance error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const counts = Object.keys(STATUS_MAP).reduce((acc, k) => {
    acc[k] = records.filter(r => r.status === k).length;
    return acc;
  }, {});

  const filtered = records.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [r.first_name, r.last_name, r.department]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Attendance" subtitle="Today's log" onBack={() => navigation.goBack()} color={primary} />

      <View style={styles.summaryRow}>
        {Object.entries(STATUS_MAP).map(([k, sc]) => (
          <View key={k} style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: sc.color }]}>{counts[k] || 0}</Text>
            <Text style={styles.summaryLabel}>{sc.label.split(' ')[0]}</Text>
          </View>
        ))}
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['all', 'present', 'absent', 'late', 'leave', 'half_day'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && { backgroundColor: primary, borderColor: primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <AttendanceCard record={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="📋" message="No attendance records today" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAttendance(); }} tintColor={primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  summaryRow: {
    flexDirection: 'row', backgroundColor: C.white,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 9, color: C.gray, marginTop: 2, fontWeight: '600' },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray, textTransform: 'capitalize' },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary + '18', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: C.primary },
  flex: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  dept: { fontSize: 11, color: C.gray, marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  time: { fontSize: 11, color: C.gray },
  notes: { fontSize: 11, color: C.gray, marginTop: 4 },
});
