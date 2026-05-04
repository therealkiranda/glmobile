// src/screens/admin/BookingsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar,
  EmptyState, LoadingView, SectionHeader,
} from '../../components/SharedComponents';

function statusColor(s) {
  switch (s) {
    case 'confirmed': return { color: C.success, bg: '#d1fae5' };
    case 'checked_in': return { color: C.blue, bg: '#dbeafe' };
    case 'checked_out': return { color: C.gray, bg: '#f1f5f9' };
    case 'cancelled': return { color: C.danger, bg: '#fee2e2' };
    case 'pending': return { color: '#d97706', bg: '#fef3c7' };
    default: return { color: C.gray, bg: '#f1f5f9' };
  }
}

function BookingCard({ booking }) {
  const sc = statusColor(booking.status);
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.guestName}>
            {booking.guest_first_name} {booking.guest_last_name}
          </Text>
          <Text style={styles.ref}>#{booking.booking_reference}</Text>
        </View>
        <StatusBadge label={booking.status?.replace('_', ' ').toUpperCase()} {...sc} />
      </View>
      <View style={styles.divider} />
      <View style={styles.details}>
        <Detail icon="🛏" label={`Room ${booking.room_number || '—'} · ${booking.room_type || ''}`} />
        <Detail icon="📅" label={`${booking.check_in_date} → ${booking.check_out_date}`} />
        <Detail icon="👥" label={`${booking.adults || 1} adults${booking.children ? `, ${booking.children} children` : ''}`} />
        <Detail icon="💰" label={`$${Number(booking.total_amount || 0).toLocaleString()}`} />
      </View>
    </Card>
  );
}

function Detail({ icon, label }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailText}>{label}</Text>
    </View>
  );
}

export default function BookingsScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const FILTERS = ['all', 'confirmed', 'checked_in', 'pending', 'cancelled'];

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data?.bookings || res.data || []);
    } catch (e) {
      console.error('Bookings error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [b.guest_first_name, b.guest_last_name, b.booking_reference, b.room_number]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Bookings"
        subtitle={`${bookings.length} total`}
        onBack={() => navigation.goBack()}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search guest or reference…" />

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="📋" message="No bookings found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={C.gold} />}
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
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray, textTransform: 'capitalize' },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  flex: { flex: 1, marginRight: 8 },
  guestName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  ref: { fontSize: 11, color: C.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  details: { gap: 6 },
  detail: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { fontSize: 13, marginRight: 8, width: 20 },
  detailText: { fontSize: 13, color: '#374151' },
});
