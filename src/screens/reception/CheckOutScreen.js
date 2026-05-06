// src/screens/reception/CheckOutScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function BookingRow({ booking, onCheckOut, loading, currencySymbol }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>OUT</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.guestName}>{booking.guest_first_name} {booking.guest_last_name}</Text>
          <Text style={styles.meta}>Room {booking.room_number || '—'} · #{booking.booking_reference}</Text>
          <Text style={styles.meta}>
            {booking.adults || 1} adults{booking.children ? `, ${booking.children} children` : ''}
          </Text>
          {booking.total_amount ? (
            <Text style={styles.amount}>
              💰 Total: {currencySymbol}{Number(booking.total_amount).toLocaleString()}
            </Text>
          ) : null}
          {booking.payment_status ? (
            <Text style={[styles.payStatus, { color: booking.payment_status === 'paid' ? C.success : '#d97706' }]}>
              💳 {booking.payment_status.replace(/_/g, ' ')}
            </Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.checkOutBtn, loading && { opacity: 0.6 }]}
        onPress={() => onCheckOut(booking)}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.checkOutText}>🔑 Check Out</Text>
        }
      </TouchableOpacity>
    </Card>
  );
}

export default function CheckOutScreen({ navigation }) {
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [processingId, setProcessingId] = useState(null);

  const primary        = theme?.primary_color || C.primary;
  const currencySymbol = hotelInfo?.currency_symbol || 'Rs';

  const fetchDepartures = async () => {
    try {
      const res = await api.get('/frontdesk/today');
      setDepartures(res.data?.departures || []);
    } catch (e) {
      console.error('CheckOut error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDepartures(); }, []);

  const handleCheckOut = (booking) => {
    const amount = booking.total_amount
      ? `\nTotal: ${currencySymbol}${Number(booking.total_amount).toLocaleString()}`
      : '';
    Alert.alert(
      'Confirm Check-Out',
      `Check out ${booking.guest_first_name} ${booking.guest_last_name} from Room ${booking.room_number}?${amount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            const id = booking.id || booking.booking_id;
            setProcessingId(id);
            try {
              await api.post(`/frontdesk/check-out/${id}`);
              Alert.alert('✅ Checked Out', `${booking.guest_first_name} has been checked out. Room set to housekeeping.`);
              fetchDepartures();
            } catch (e) {
              Alert.alert('Error', e.response?.data?.error || 'Check-out failed');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const filtered = departures.filter(d => {
    const q = search.toLowerCase();
    return !q || [d.guest_first_name, d.guest_last_name, d.booking_reference, d.room_number]
      .some(v => String(v || '').toLowerCase().includes(q));
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Check Out"
        subtitle={`${departures.length} departures today`}
        onBack={() => navigation.goBack()}
        color={primary}
      />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search guest or room…" />
      {loading ? <LoadingView /> : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <BookingRow
              booking={item}
              onCheckOut={handleCheckOut}
              loading={processingId === (item.id || item.booking_id)}
              currencySymbol={currencySymbol}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="🛫" message="No pending departures" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDepartures(); }} tintColor={primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  badge: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9, fontWeight: '800', color: C.purple },
  flex: { flex: 1 },
  guestName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 12, color: C.gray, marginTop: 2 },
  amount: { fontSize: 12, color: C.primary, fontWeight: '600', marginTop: 4 },
  payStatus: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  checkOutBtn: { backgroundColor: C.purple, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  checkOutText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
