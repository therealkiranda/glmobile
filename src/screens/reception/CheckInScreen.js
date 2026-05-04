// src/screens/reception/CheckInScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function BookingRow({ booking, onCheckIn, loading }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>IN</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.guestName}>{booking.guest_first_name} {booking.guest_last_name}</Text>
          <Text style={styles.meta}>Room {booking.room_number || '—'} · #{booking.booking_reference}</Text>
          <Text style={styles.meta}>
            {booking.adults || 1} adults{booking.children ? `, ${booking.children} children` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.checkInBtn, loading && { opacity: 0.6 }]}
        onPress={() => onCheckIn(booking)}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.checkInText}>✅ Check In</Text>
        }
      </TouchableOpacity>
    </Card>
  );
}

export default function CheckInScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchArrivals = async () => {
    try {
      const res = await api.get('/frontdesk/today');
      setArrivals(res.data?.arrivals || []);
    } catch (e) {
      console.error('CheckIn fetch error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchArrivals(); }, []);

  const handleCheckIn = (booking) => {
    Alert.alert(
      'Confirm Check-In',
      `Check in ${booking.guest_first_name} ${booking.guest_last_name} to Room ${booking.room_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            setProcessingId(booking.id || booking.booking_id);
            try {
              await api.post(`/frontdesk/check-in/${booking.id || booking.booking_id}`);
              Alert.alert('Success', `${booking.guest_first_name} has been checked in.`);
              fetchArrivals();
            } catch (e) {
              const msg = e.response?.data?.error || 'Check-in failed';
              Alert.alert('Error', msg);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const filtered = arrivals.filter(a => {
    const q = search.toLowerCase();
    return !q || [a.guest_first_name, a.guest_last_name, a.booking_reference, a.room_number]
      .some(v => String(v || '').toLowerCase().includes(q));
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Check In"
        subtitle={`${arrivals.length} arrivals today`}
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
              onCheckIn={handleCheckIn}
              loading={processingId === (item.id || item.booking_id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="🛬" message="No pending arrivals" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchArrivals(); }} tintColor={C.gold} />}
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
    backgroundColor: '#d1fae5',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: C.success },
  flex: { flex: 1 },
  guestName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 12, color: C.gray, marginTop: 2 },
  checkInBtn: {
    backgroundColor: C.success, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  checkInText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
