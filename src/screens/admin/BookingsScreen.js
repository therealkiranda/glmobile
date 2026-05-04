// src/screens/admin/BookingsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar,
  EmptyState, LoadingView,
} from '../../components/SharedComponents';

function statusColor(s) {
  switch (s) {
    case 'confirmed':   return { color: C.success,   bg: '#d1fae5' };
    case 'checked_in':  return { color: C.blue,       bg: '#dbeafe' };
    case 'checked_out': return { color: C.gray,       bg: '#f1f5f9' };
    case 'cancelled':   return { color: C.danger,     bg: '#fee2e2' };
    case 'pending':     return { color: '#d97706',    bg: '#fef3c7' };
    default:            return { color: C.gray,       bg: '#f1f5f9' };
  }
}

function BookingCard({ booking, currencySymbol }) {
  const sc = statusColor(booking.status);
  const checkIn  = booking.check_in_date  ? booking.check_in_date.slice(0, 10)  : '—';
  const checkOut = booking.check_out_date ? booking.check_out_date.slice(0, 10) : '—';
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.guestName}>
            {booking.guest_first_name} {booking.guest_last_name}
          </Text>
          <Text style={styles.ref}>#{booking.booking_reference}</Text>
        </View>
        <StatusBadge label={booking.status?.replace(/_/g, ' ').toUpperCase()} {...sc} />
      </View>
      <View style={styles.divider} />
      <View style={styles.details}>
        <Detail icon="🛏" label={`Room ${booking.room_number || '—'} · ${booking.room_name || ''}`} />
        <Detail icon="📅" label={`${checkIn} → ${checkOut}`} />
        <Detail icon="👥" label={`${booking.adults || 1} adults${booking.children ? `, ${booking.children} children` : ''}`} />
        <Detail icon="💰" label={`${currencySymbol}${Number(booking.total_amount || 0).toLocaleString()}`} />
        {booking.payment_status && (
          <Detail icon="💳" label={`Payment: ${booking.payment_status}`} />
        )}
        {booking.source && (
          <Detail icon="🔗" label={`Source: ${booking.source}`} />
        )}
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
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [bookings, setBookings]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');

  const primary        = theme?.primary_color || C.primary;
  const currencySymbol = hotelInfo?.currency_symbol || '$';
  const FILTERS        = ['all', 'confirmed', 'checked_in', 'pending', 'checked_out', 'cancelled'];

  const fetchBookings = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const res = await api.get('/bookings', { params });
      const d = res.data;
      if (Array.isArray(d)) {
        setBookings(d);
        setTotal(d.length);
      } else {
        setBookings(d?.data || []);
        setTotal(d?.total || 0);
      }
    } catch (e) {
      console.error('Bookings error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleSearch = () => { setLoading(true); fetchBookings(); };

  const filtered = filter === 'all' && !search
    ? bookings
    : bookings.filter(b => {
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
        subtitle={`${total} total`}
        onBack={() => navigation.goBack()}
        color={primary}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search guest, reference, room…"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && { backgroundColor: primary, borderColor: primary }]}
            onPress={() => { setFilter(f); setLoading(true); }}
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
          renderItem={({ item }) => <BookingCard booking={item} currencySymbol={currencySymbol} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="📋" message="No bookings found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={primary} />}
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
