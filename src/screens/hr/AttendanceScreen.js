// src/screens/hr/AttendanceScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function AttendanceCard({ record }) {
  const initials = ((record.first_name?.[0] || '') + (record.last_name?.[0] || '')).toUpperCase() || '?';
  const statusMap = {
    present: { color: C.success, bg: '#d1fae5', label: 'PRESENT' },
    absent: { color: C.danger, bg: '#fee2e2', label: 'ABSENT' },
    late: { color: '#d97706', bg: '#fef3c7', label: 'LATE' },
    leave: { color: C.blue, bg: '#dbeafe', label: 'LEAVE' },
  };
  const sc = statusMap[record.status] || { color: C.gray, bg: '#f1f5f9', label: 'UNKNOWN' };

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{record.first_name} {record.last_name}</Text>
          <Text style={styles.dept}>{record.department || '—'}</Text>
          <Text style={styles.date}>{record.date || record.attendance_date || '—'}</Text>
        </View>
        <View style={styles.times}>
          {record.check_in && <Text style={styles.time}>🟢 {record.check_in}</Text>}
          {record.check_out && <Text style={styles.time}>🔴 {record.check_out}</Text>}
          <StatusBadge label={sc.label} color={sc.color} bg={sc.bg} />
        </View>
      </View>
    </Card>
  );
}

export default function AttendanceScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/hr/attendance');
      setRecords(res.data?.attendance || res.data?.records || res.data || []);
    } catch (e) {
      console.error('Attendance error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const filtered = records.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [r.first_name, r.last_name, r.department]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Attendance" subtitle="Today's log" onBack={() => navigation.goBack()} color={C.blue} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['all', 'present', 'absent', 'late', 'leave'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView color={C.blue} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <AttendanceCard record={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="📊" message="No attendance records" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAttendance(); }} tintColor={C.blue} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.blue, borderColor: C.blue },
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.blue + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontSize: 14, fontWeight: '700', color: C.blue },
  flex: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  dept: { fontSize: 12, color: C.gray, marginTop: 2 },
  date: { fontSize: 11, color: C.gray, marginTop: 2 },
  times: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 11, color: C.gray },
});
