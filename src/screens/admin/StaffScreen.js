// src/screens/admin/StaffScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function StaffCard({ employee }) {
  const initials = ((employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')).toUpperCase() || '?';
  const dept = employee.department_name || employee.department || 'Staff';
  const isActive = employee.employment_status === 'active' || !employee.employment_status;
  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: C.primary + '18' }]}>
          <Text style={[styles.initials, { color: C.primary }]}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{employee.first_name} {employee.last_name}</Text>
          <Text style={styles.job}>{employee.job_title || employee.position || '—'}</Text>
          <Text style={styles.dept}>{dept} · {(employee.employment_type || 'full_time').replace(/_/g,' ')}</Text>
          {employee.salary && (
            <Text style={styles.salary}>
              {employee.salary_currency || 'NPR'} {Number(employee.salary).toLocaleString()}/mo
            </Text>
          )}
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
  const { api, theme } = useContext(AuthContext);
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');

  const primary = theme?.primary_color || C.primary;

  const fetchStaff = async () => {
    try {
      const res = await api.get('/hr/employees');
      const d = res.data;
      setStaff(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      console.error('Staff error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const filtered = staff.filter(e => {
    const matchStatus = filter === 'all'
      || (filter === 'active' && e.employment_status === 'active')
      || (filter === 'inactive' && e.employment_status !== 'active');
    const q = search.toLowerCase();
    const matchSearch = !q || [e.first_name, e.last_name, e.email, e.department_name, e.job_title]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Staff" subtitle={`${staff.length} employees`} onBack={() => navigation.goBack()} color={primary} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, role, department…" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['all', 'active', 'inactive'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && { backgroundColor: primary, borderColor: primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStaff(); }} tintColor={primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 16, fontWeight: '700' },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  job: { fontSize: 12, color: C.gray, marginTop: 2 },
  dept: { fontSize: 11, color: C.gray, marginTop: 2 },
  salary: { fontSize: 11, color: C.success, marginTop: 2, fontWeight: '600' },
  contactRow: { marginTop: 10, gap: 4 },
  contact: { fontSize: 12, color: C.gray },
});
