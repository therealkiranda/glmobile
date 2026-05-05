// src/screens/hr/LeaveScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView,
} from '../../components/SharedComponents';

function leaveStatusColor(s) {
  switch (s) {
    case 'approved': return { color: C.success, bg: '#d1fae5' };
    case 'pending': return { color: '#d97706', bg: '#fef3c7' };
    case 'rejected': return { color: C.danger, bg: '#fee2e2' };
    default: return { color: C.gray, bg: '#f1f5f9' };
  }
}

function LeaveCard({ leave }) {
  const sc = leaveStatusColor(leave.status);
  const initials = ((leave.employee_first_name?.[0] || leave.first_name?.[0] || '') + (leave.employee_last_name?.[0] || leave.last_name?.[0] || '')).toUpperCase() || '?';

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.empName}>
            {leave.employee_first_name || leave.first_name} {leave.employee_last_name || leave.last_name}
          </Text>
          <Text style={styles.leaveType}>{leave.leave_type || leave.type || 'Leave'}</Text>
          <Text style={styles.dates}>
            {leave.start_date} → {leave.end_date}
            {leave.days_count ? ` (${leave.days_count} days)` : ''}
          </Text>
        </View>
        <StatusBadge label={(leave.status || 'pending').toUpperCase()} {...sc} />
      </View>
      {leave.reason && (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason</Text>
          <Text style={styles.reason}>{leave.reason}</Text>
        </View>
      )}
    </Card>
  );
}

export default function LeaveScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/hr/leave-requests');
      const d = res.data;
      setLeaves(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      console.error('Leave error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const counts = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
  };

  const filtered = leaves.filter(l => {
    const matchStatus = filter === 'all' || l.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [l.employee_first_name, l.first_name, l.employee_last_name, l.last_name, l.leave_type]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Leave Requests" subtitle={`${counts.pending} pending`} onBack={() => navigation.goBack()} color={C.blue} />

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Pending', value: counts.pending, color: '#d97706' },
          { label: 'Approved', value: counts.approved, color: C.success },
          { label: 'Total', value: leaves.length, color: C.gray },
        ].map(s => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by employee or type…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
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
          renderItem={({ item }) => <LeaveCard leave={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="📋" message="No leave requests found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaves(); }} tintColor={C.blue} />}
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
  summaryVal: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: C.gray, marginTop: 2 },
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
  empName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  leaveType: { fontSize: 12, color: C.blue, marginTop: 2 },
  dates: { fontSize: 11, color: C.gray, marginTop: 2 },
  reasonBox: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  reasonLabel: { fontSize: 10, color: C.gray, fontWeight: '600', marginBottom: 3 },
  reason: { fontSize: 13, color: '#374151' },
});
