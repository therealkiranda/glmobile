// src/screens/admin/PaymentsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView,
} from '../../components/SharedComponents';

function PaymentCard({ payment }) {
  const isPaid = payment.status === 'paid' || payment.status === 'completed';
  const isPending = payment.status === 'pending';
  const sc = isPaid
    ? { color: C.success, bg: '#d1fae5' }
    : isPending
    ? { color: '#d97706', bg: '#fef3c7' }
    : { color: C.danger, bg: '#fee2e2' };

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.guest}>{payment.guest_name || payment.customer_name || 'Guest'}</Text>
          <Text style={styles.ref}>#{payment.payment_reference || payment.booking_reference || '—'}</Text>
          <Text style={styles.method}>💳 {payment.payment_method || 'Unknown'}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>${Number(payment.amount || 0).toLocaleString()}</Text>
          <StatusBadge label={(payment.status || 'pending').toUpperCase()} {...sc} />
        </View>
      </View>
      {payment.payment_date && (
        <Text style={styles.date}>📅 {payment.payment_date}</Text>
      )}
    </Card>
  );
}

export default function PaymentsScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const FILTERS = ['all', 'paid', 'pending', 'failed'];

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      const d = res.data;
      setPayments(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      console.error('Payments error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const totalRevenue = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filtered = payments.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [p.guest_name, p.customer_name, p.payment_reference, p.booking_reference]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Payments" subtitle={`${payments.length} transactions`} onBack={() => navigation.goBack()} />

      {/* Revenue summary */}
      <View style={styles.revBox}>
        <Text style={styles.revLabel}>Total Collected</Text>
        <Text style={styles.revAmount}>${totalRevenue.toLocaleString()}</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search guest or reference…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
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

      {loading ? <LoadingView /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <PaymentCard payment={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="💳" message="No payments found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} tintColor={C.gold} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  revBox: {
    backgroundColor: C.primary, alignItems: 'center', paddingVertical: 16,
  },
  revLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: 1 },
  revAmount: { fontSize: 32, fontWeight: '800', color: C.gold, marginTop: 4 },
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
  flex: { flex: 1 },
  guest: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  ref: { fontSize: 11, color: C.gray, marginTop: 2 },
  method: { fontSize: 12, color: C.gray, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 18, fontWeight: '800', color: C.primary },
  date: { fontSize: 11, color: C.gray, marginTop: 10 },
});
