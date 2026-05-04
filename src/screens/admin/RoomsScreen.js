// src/screens/admin/RoomsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar,
  EmptyState, LoadingView,
} from '../../components/SharedComponents';

function roomStatusColor(s) {
  switch (s) {
    case 'available': return { color: C.success, bg: '#d1fae5' };
    case 'occupied': return { color: C.blue, bg: '#dbeafe' };
    case 'maintenance': return { color: '#d97706', bg: '#fef3c7' };
    case 'cleaning': return { color: C.purple, bg: '#ede9fe' };
    case 'reserved': return { color: C.primary, bg: '#d1fae5' };
    default: return { color: C.gray, bg: '#f1f5f9' };
  }
}

function RoomCard({ room }) {
  const sc = roomStatusColor(room.status);
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.roomNumBox}>
          <Text style={styles.roomNum}>{room.room_number}</Text>
          <Text style={styles.floor}>Floor {room.floor || '—'}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.roomType}>{room.room_type || room.type || 'Standard'}</Text>
          <Text style={styles.capacity}>
            {room.capacity || room.max_occupancy || 2} guests · ${Number(room.price_per_night || room.rate || 0).toLocaleString()}/night
          </Text>
          {room.guest_name && (
            <Text style={styles.guest}>👤 {room.guest_name}</Text>
          )}
        </View>
        <StatusBadge label={(room.status || 'available').toUpperCase()} {...sc} />
      </View>
      {room.amenities?.length > 0 && (
        <Text style={styles.amenities} numberOfLines={1}>
          {room.amenities.join(' · ')}
        </Text>
      )}
    </Card>
  );
}

export default function RoomsScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const FILTERS = ['all', 'available', 'occupied', 'maintenance', 'cleaning'];

  const fetchRooms = async () => {
    try {
      const res = await api.get('/admin/rooms');
      setRooms(res.data?.rooms || res.data || []);
    } catch (e) {
      console.error('Rooms error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const filtered = rooms.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [r.room_number, r.room_type, r.type, r.guest_name]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Rooms" subtitle={`${stats.total} rooms`} onBack={() => navigation.goBack()} />

      {/* Summary bar */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Available', value: stats.available, color: C.success },
          { label: 'Occupied', value: stats.occupied, color: C.blue },
          { label: 'Maintenance', value: stats.maintenance, color: '#d97706' },
        ].map(s => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by room number or type…" />

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
          renderItem={({ item }) => <RoomCard room={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="🛏" message="No rooms found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={C.gold} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  summaryRow: {
    flexDirection: 'row', backgroundColor: C.white,
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: C.gray, marginTop: 2 },
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
  roomNumBox: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: C.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  roomNum: { fontSize: 16, fontWeight: '800', color: C.primary },
  floor: { fontSize: 9, color: C.gray, marginTop: 1 },
  flex: { flex: 1 },
  roomType: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  capacity: { fontSize: 12, color: C.gray, marginTop: 3 },
  guest: { fontSize: 12, color: C.blue, marginTop: 3 },
  amenities: { fontSize: 11, color: C.gray, marginTop: 10 },
});
