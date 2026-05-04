// src/screens/admin/CustomersScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, SearchBar, EmptyState, LoadingView,
} from '../../components/SharedComponents';

function CustomerCard({ customer }) {
  const initials = ((customer.first_name?.[0] || '') + (customer.last_name?.[0] || '')).toUpperCase() || '?';
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{customer.first_name} {customer.last_name}</Text>
          <Text style={styles.email}>{customer.email}</Text>
          {customer.phone && <Text style={styles.phone}>📞 {customer.phone}</Text>}
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statNum}>{customer.total_bookings || 0}</Text>
          <Text style={styles.statLabel}>Stays</Text>
        </View>
      </View>
      {(customer.total_spent > 0 || customer.nationality) && (
        <View style={styles.footer}>
          {customer.total_spent > 0 && (
            <Text style={styles.spent}>💰 ${Number(customer.total_spent).toLocaleString()} total</Text>
          )}
          {customer.nationality && (
            <Text style={styles.country}>🌍 {customer.nationality}</Text>
          )}
        </View>
      )}
    </Card>
  );
}

export default function CustomersScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data?.customers || res.data?.guests || res.data || []);
    } catch (e) {
      console.error('Customers error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || [c.first_name, c.last_name, c.email, c.phone]
      .some(v => String(v || '').toLowerCase().includes(q));
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Customers"
        subtitle={`${customers.length} guests`}
        onBack={() => navigation.goBack()}
      />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or email…" />

      {loading ? <LoadingView /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <CustomerCard customer={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="👤" message="No customers found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCustomers(); }} tintColor={C.gold} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontSize: 16, fontWeight: '700', color: C.primary },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  email: { fontSize: 12, color: C.gray, marginTop: 2 },
  phone: { fontSize: 12, color: C.blue, marginTop: 2 },
  statsBox: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: C.primary },
  statLabel: { fontSize: 10, color: C.gray },
  footer: {
    flexDirection: 'row', gap: 16,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  spent: { fontSize: 12, color: C.success, fontWeight: '600' },
  country: { fontSize: 12, color: C.gray },
});
