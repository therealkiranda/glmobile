// src/screens/hr/PayrollScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function PayrollCard({ record }) {
  const initials = ((record.first_name?.[0] || '') + (record.last_name?.[0] || '')).toUpperCase() || '?';
  const isPaid = record.payment_status === 'paid';

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{record.first_name} {record.last_name}</Text>
          <Text style={styles.dept}>{record.department || record.position || '—'}</Text>
          <Text style={styles.period}>{record.pay_period || record.month || '—'}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>${Number(record.net_salary || record.salary || 0).toLocaleString()}</Text>
          <StatusBadge
            label={isPaid ? 'PAID' : 'PENDING'}
            color={isPaid ? C.success : '#d97706'}
            bg={isPaid ? '#d1fae5' : '#fef3c7'}
          />
        </View>
      </View>
      {(record.gross_salary || record.deductions) && (
        <View style={styles.breakdown}>
          {record.gross_salary && (
            <Text style={styles.breakItem}>Gross: ${Number(record.gross_salary).toLocaleString()}</Text>
          )}
          {record.deductions && (
            <Text style={styles.breakItem}>Deductions: -${Number(record.deductions).toLocaleString()}</Text>
          )}
        </View>
      )}
    </Card>
  );
}

export default function PayrollScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPayroll = async () => {
    try {
      const res = await api.get('/hr/payroll');
      const d = res.data;
      setPayroll(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      console.error('Payroll error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const totalPaid = payroll
    .filter(p => p.payment_status === 'paid')
    .reduce((s, p) => s + Number(p.net_salary || p.salary || 0), 0);

  const filtered = payroll.filter(p => {
    const q = search.toLowerCase();
    return !q || [p.first_name, p.last_name, p.department, p.position]
      .some(v => String(v || '').toLowerCase().includes(q));
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Payroll" subtitle="This period" onBack={() => navigation.goBack()} color={C.blue} />

      <View style={styles.revBox}>
        <Text style={styles.revLabel}>Total Disbursed</Text>
        <Text style={styles.revAmount}>${totalPaid.toLocaleString()}</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees…" />

      {loading ? <LoadingView color={C.blue} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <PayrollCard record={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="💰" message="No payroll records found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayroll(); }} tintColor={C.blue} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  revBox: { backgroundColor: C.blue, alignItems: 'center', paddingVertical: 16 },
  revLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: 1 },
  revAmount: { fontSize: 32, fontWeight: '800', color: C.white, marginTop: 4 },
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
  period: { fontSize: 11, color: C.gray, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 16, fontWeight: '800', color: C.primary },
  breakdown: {
    flexDirection: 'row', gap: 16, marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  breakItem: { fontSize: 12, color: C.gray },
});
