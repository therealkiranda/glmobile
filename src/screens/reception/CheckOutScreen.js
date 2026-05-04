// src/screens/reception/CheckOutScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function BookingRow({ booking, onCheckOut, loading }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>OUT</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.guestName}>{booking.guest_first_name} {booking.guest_last_name}</Text>
          <Text style={styles.meta}>Room {booking.room_number || '—'} · #{booking.booking_reference}</Text>
          {booking.total_amount && (
            <Text style={styles.amount}>💰 Due: ${Number(booking.total_amount).toLocaleString()}</Text>
          )}
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
  const { api } = useContext(AuthContext);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchDepartures = async () => {
    try {
      const res = await api.get('/frontdesk/today');
      setDepartures(res.data?.departures || []);
    } catch (e) {
      console.error('CheckOut fetch error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDepartures(); }, []);

  const handleCheckOut = (booking) => {
    const amount = booking.total_amount ? `\nTotal due: $${Number(booking.total_amount).toLocaleString()}` : '';
    Alert.alert(
      'Confirm Check-Out',
      `Check out ${booking.guest_first_name} ${booking.guest_last_name} from Room ${booking.room_number}?${amount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async () => {
            setProcessingId(booking.id || booking.booking_id);
            try {
              await api.post(`/frontdesk/check-out/${booking.id || booking.booking_id}`);
              Alert.alert('Success', `${booking.guest_first_name} has been checked out.`);
              fetchDepartures();
            } catch (e) {
              const msg = e.response?.data?.error || 'Check-out failed';
              Alert.alert('Error', msg);
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
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="🛫" message="No pending departures" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDepartures(); }} tintColor={C.gold} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  badge: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#ede9fe',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: C.purple },
  flex: { flex: 1 },
  guestName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 12, color: C.gray, marginTop: 2 },
  amount: { fontSize: 12, color: C.success, fontWeight: '600', marginTop: 4 },
  checkOutBtn: {
    backgroundColor: C.purple, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  checkOutText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
