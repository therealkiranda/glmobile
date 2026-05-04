// src/screens/admin/StaffScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView,
} from '../../components/SharedComponents';

const DEPT_COLORS = {
  'Front Desk': { color: C.primary, bg: C.primary + '18' },
  'Housekeeping': { color: C.purple, bg: C.purple + '18' },
  'F&B': { color: '#d97706', bg: '#fef3c7' },
  'Maintenance': { color: C.blue, bg: '#dbeafe' },
  'HR': { color: C.success, bg: '#d1fae5' },
  'Management': { color: C.gold, bg: C.gold + '20' },
};

function StaffCard({ employee }) {
  const initials = ((employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')).toUpperCase() || '?';
  const dept = employee.department || 'Staff';
  const dc = DEPT_COLORS[dept] || { color: C.gray, bg: '#f1f5f9' };
  const isActive = employee.employment_status === 'active' || !employee.employment_status;

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: dc.bg }]}>
          <Text style={[styles.initials, { color: dc.color }]}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{employee.first_name} {employee.last_name}</Text>
          <Text style={styles.job}>{employee.job_title || employee.position || '—'}</Text>
          <View style={[styles.deptTag, { backgroundColor: dc.bg }]}>
            <Text style={[styles.deptText, { color: dc.color }]}>{dept}</Text>
          </View>
        </View>
        <StatusBadge
          label={isActive ? 'ACTIVE' : 'INACTIVE'}
          color={isActive ? C.success : C.gray}
          bg={isActive ? '#d1fae5' : '#f1f5f9'}
        />
      </View>
      {(employee.email || employee.phone) && (
        <View style={styles.contactRow}>
          {employee.email && <Text style={styles.contact}>✉️ {employee.email}</Text>}
          {employee.phone && <Text style={styles.contact}>📞 {employee.phone}</Text>}
        </View>
      )}
    </Card>
  );
}

export default function StaffScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data?.staff || res.data?.employees || res.data || []);
    } catch (e) {
      console.error('Staff error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const departments = ['All', ...new Set(staff.map(s => s.department).filter(Boolean))];

  const filtered = staff.filter(s => {
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [s.first_name, s.last_name, s.email, s.job_title, s.department]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchDept && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Staff" subtitle={`${staff.length} employees`} onBack={() => navigation.goBack()} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or role…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {departments.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, deptFilter === d && styles.chipActive]}
            onPress={() => setDeptFilter(d)}
          >
            <Text style={[styles.chipText, deptFilter === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <StaffCard employee={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="👥" message="No staff found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStaff(); }} tintColor={C.gold} />}
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
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontSize: 16, fontWeight: '700' },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  job: { fontSize: 12, color: C.gray, marginTop: 2 },
  deptTag: { marginTop: 6, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  deptText: { fontSize: 10, fontWeight: '700' },
  contactRow: { marginTop: 10, gap: 4 },
  contact: { fontSize: 12, color: C.gray },
});
