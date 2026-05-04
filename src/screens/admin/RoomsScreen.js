// src/screens/admin/RoomsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
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
    case 'available':    return { color: C.success,   bg: '#d1fae5' };
    case 'occupied':     return { color: C.blue,       bg: '#dbeafe' };
    case 'maintenance':  return { color: '#d97706',    bg: '#fef3c7' };
    case 'housekeeping': return { color: C.purple,     bg: '#ede9fe' };
    case 'reserved':     return { color: C.primary,    bg: '#d1fae5' };
    default:             return { color: C.gray,       bg: '#f1f5f9' };
  }
}

function RoomCard({ room, currencySymbol }) {
  const sc = roomStatusColor(room.status);
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.roomNumBox}>
          <Text style={styles.roomNum}>{room.room_number}</Text>
          <Text style={styles.floor}>Floor {room.floor || '—'}</Text>
          {room.wing ? <Text style={styles.floor}>Wing {room.wing}</Text> : null}
        </View>
        <View style={styles.flex}>
          <Text style={styles.roomType}>{room.category_name || 'Room'}</Text>
          <Text style={styles.capacity}>
            {room.max_adults ? `Up to ${room.max_adults} guests` : ''}
            {room.base_price ? ` · ${currencySymbol}${Number(room.base_price).toLocaleString()}/night` : ''}
          </Text>
          {room.bed_type ? <Text style={styles.bed}>🛏 {room.bed_type}</Text> : null}
          {room.housekeeping_status && room.housekeeping_status !== 'clean' && (
            <Text style={styles.hk}>🧹 {room.housekeeping_status}</Text>
          )}
          {room.booking_reference && (
            <Text style={styles.guest}>👤 {room.guest_first_name} {room.guest_last_name} · #{room.booking_reference}</Text>
          )}
        </View>
        <StatusBadge label={(room.status || 'available').replace(/_/g, ' ').toUpperCase()} {...sc} />
      </View>
      {room.notes ? (
        <Text style={styles.notes} numberOfLines={1}>📝 {room.notes}</Text>
      ) : null}
    </Card>
  );
}

export default function RoomsScreen({ navigation }) {
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');

  const primary        = theme?.primary_color || C.primary;
  const currencySymbol = hotelInfo?.currency_symbol || '$';
  const FILTERS        = ['all', 'available', 'occupied', 'maintenance', 'housekeeping'];

  const fetchRooms = async () => {
    try {
      const res = await api.get('/admin/rooms');
      const data = res.data;
      setRooms(Array.isArray(data) ? data : (data?.rooms || []));
    } catch (e) {
      console.error('Rooms error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const stats = {
    total:       rooms.length,
    available:   rooms.filter(r => r.status === 'available').length,
    occupied:    rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const filtered = rooms.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || String(r.room_number || '').toLowerCase().includes(q)
      || String(r.category_name || '').toLowerCase().includes(q)
      || String(r.wing || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Rooms"
        subtitle={`${rooms.length} rooms`}
        onBack={() => navigation.goBack()}
        color={primary}
      />

      <View style={styles.statsRow}>
        {[
          { label: 'Available',   value: stats.available,   color: C.success },
          { label: 'Occupied',    value: stats.occupied,    color: C.blue },
          { label: 'Maintenance', value: stats.maintenance, color: '#d97706' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by room number or type…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && { backgroundColor: primary, borderColor: primary }]}
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
          renderItem={({ item }) => <RoomCard room={item} currencySymbol={currencySymbol} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="🛏" message="No rooms found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  statsRow: {
    flexDirection: 'row', backgroundColor: C.white,
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: C.gray, marginTop: 2 },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  roomNumBox: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  roomNum: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  floor: { fontSize: 9, color: C.gray, marginTop: 1 },
  flex: { flex: 1 },
  roomType: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  capacity: { fontSize: 12, color: C.gray, marginTop: 2 },
  bed: { fontSize: 11, color: C.gray, marginTop: 2 },
  hk: { fontSize: 11, color: '#d97706', marginTop: 2 },
  guest: { fontSize: 11, color: C.blue, marginTop: 2 },
  notes: { fontSize: 11, color: C.gray, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
});
