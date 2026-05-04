// src/screens/hr/EmployeesScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView,
} from '../../components/SharedComponents';

function EmployeeCard({ employee }) {
  const initials = ((employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')).toUpperCase() || '?';
  const isActive = employee.employment_status === 'active' || !employee.employment_status;

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: isActive ? '#dbeafe' : '#f1f5f9' }]}>
          <Text style={[styles.initials, { color: isActive ? C.blue : C.gray }]}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{employee.first_name} {employee.last_name}</Text>
          <Text style={styles.job}>{employee.job_title || employee.position || '—'}</Text>
          <Text style={styles.dept}>{employee.department || '—'}</Text>
        </View>
        <StatusBadge
          label={isActive ? 'ACTIVE' : 'INACTIVE'}
          color={isActive ? C.success : C.gray}
          bg={isActive ? '#d1fae5' : '#f1f5f9'}
        />
      </View>
      <View style={styles.footer}>
        {employee.email && <Text style={styles.contact}>✉️ {employee.email}</Text>}
        {employee.hire_date && <Text style={styles.hire}>📅 Hired {employee.hire_date}</Text>}
        {employee.salary && <Text style={styles.salary}>💰 ${Number(employee.salary).toLocaleString()}/mo</Text>}
      </View>
    </Card>
  );
}

export default function EmployeesScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      setEmployees(res.data?.employees || res.data?.staff || res.data || []);
    } catch (e) {
      console.error('Employees error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter(e => {
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'active' && (e.employment_status === 'active' || !e.employment_status))
      || (statusFilter === 'inactive' && e.employment_status === 'inactive');
    const q = search.toLowerCase();
    const matchSearch = !q || [e.first_name, e.last_name, e.email, e.job_title, e.department]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Employees" subtitle={`${employees.length} total`} onBack={() => navigation.goBack()} color={C.blue} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['all', 'active', 'inactive'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, statusFilter === f && styles.chipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.chipText, statusFilter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView color={C.blue} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <EmployeeCard employee={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="👤" message="No employees found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEmployees(); }} tintColor={C.blue} />}
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
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontSize: 16, fontWeight: '700' },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  job: { fontSize: 12, color: C.gray, marginTop: 2 },
  dept: { fontSize: 11, color: C.blue, marginTop: 2 },
  footer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  contact: { fontSize: 12, color: C.gray },
  hire: { fontSize: 12, color: C.gray },
  salary: { fontSize: 12, color: C.success, fontWeight: '600' },
});
