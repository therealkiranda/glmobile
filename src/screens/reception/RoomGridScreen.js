// src/screens/reception/RoomGridScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, LoadingView } from '../../components/SharedComponents';

const STATUS_CONFIG = {
  available:   { color: C.success,   bg: '#d1fae5', label: 'Available',   short: 'AVL' },
  occupied:    { color: C.blue,      bg: '#dbeafe', label: 'Occupied',    short: 'OCC' },
  maintenance: { color: '#d97706',   bg: '#fef3c7', label: 'Maintenance', short: 'MNT' },
  cleaning:    { color: C.purple,    bg: '#ede9fe', label: 'Cleaning',    short: 'CLN' },
  reserved:    { color: C.primary,   bg: C.primary + '18', label: 'Reserved', short: 'RSV' },
};

function RoomCell({ room, onPress }) {
  const sc = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor: sc.bg, borderColor: sc.color + '40' }]}
      onPress={() => onPress(room)}
      activeOpacity={0.7}
    >
      <Text style={[styles.cellNum, { color: sc.color }]}>{room.room_number}</Text>
      <Text style={[styles.cellStatus, { color: sc.color }]}>{sc.short}</Text>
      {room.room_type && <Text style={styles.cellType} numberOfLines={1}>{room.room_type}</Text>}
    </TouchableOpacity>
  );
}

function RoomDetail({ room, onClose }) {
  const sc = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  return (
    <View style={styles.detailOverlay}>
      <TouchableOpacity style={styles.detailBg} onPress={onClose} />
      <View style={styles.detailCard}>
        <View style={[styles.detailHeader, { backgroundColor: sc.color }]}>
          <Text style={styles.detailRoom}>Room {room.room_number}</Text>
          <Text style={styles.detailStatus}>{sc.label}</Text>
        </View>
        <View style={styles.detailBody}>
          {room.room_type && <DetailRow label="Type" value={room.room_type} />}
          {room.floor && <DetailRow label="Floor" value={room.floor} />}
          {room.capacity && <DetailRow label="Capacity" value={`${room.capacity} guests`} />}
          {room.price_per_night && <DetailRow label="Rate" value={`$${Number(room.price_per_night).toLocaleString()}/night`} />}
          {room.guest_name && <DetailRow label="Guest" value={room.guest_name} />}
          {room.check_out_date && <DetailRow label="Check-Out" value={room.check_out_date} />}
          {room.amenities?.length > 0 && <DetailRow label="Amenities" value={room.amenities.join(', ')} />}
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function RoomGridScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchRooms = async () => {
    try {
      const res = await api.get('/frontdesk/rooms');
      setRooms(res.data?.rooms || res.data || []);
    } catch (e) {
      // fallback to admin rooms
      try {
        const res = await api.get('/admin/rooms');
        setRooms(res.data?.rooms || res.data || []);
      } catch { }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const stats = Object.keys(STATUS_CONFIG).map(key => ({
    key,
    ...STATUS_CONFIG[key],
    count: rooms.filter(r => r.status === key).length,
  }));

  const filtered = filterStatus === 'all' ? rooms : rooms.filter(r => r.status === filterStatus);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Room Grid" subtitle={`${rooms.length} rooms`} onBack={() => navigation.goBack()} />

      {/* Legend / filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendRow} contentContainerStyle={styles.legendContent}>
        <TouchableOpacity
          style={[styles.legendItem, filterStatus === 'all' && styles.legendActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.legendLabel, filterStatus === 'all' && { color: C.primary, fontWeight: '700' }]}>
            All ({rooms.length})
          </Text>
        </TouchableOpacity>
        {stats.filter(s => s.count > 0).map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.legendItem, { borderBottomColor: s.color }, filterStatus === s.key && styles.legendActive]}
            onPress={() => setFilterStatus(s.key)}
          >
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendLabel, { color: s.color }]}>{s.label} ({s.count})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView /> : (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={C.gold} />}
        >
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No rooms found</Text>
          ) : (
            filtered.map((room, i) => (
              <RoomCell key={i} room={room} onPress={setSelectedRoom} />
            ))
          )}
        </ScrollView>
      )}

      {selectedRoom && (
        <RoomDetail room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  legendRow: { maxHeight: 48, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  legendContent: { paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  legendItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  legendActive: { borderBottomColor: C.primary },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLabel: { fontSize: 11, fontWeight: '600', color: C.gray },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 12, gap: 8,
  },
  cell: {
    width: '22%', aspectRatio: 0.9,
    borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', padding: 4,
  },
  cellNum: { fontSize: 14, fontWeight: '800' },
  cellStatus: { fontSize: 8, fontWeight: '700', marginTop: 2 },
  cellType: { fontSize: 7, color: C.gray, marginTop: 1, textAlign: 'center' },
  empty: { color: C.gray, textAlign: 'center', marginTop: 40, fontSize: 14 },

  // Detail modal
  detailOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  detailBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  detailCard: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  detailHeader: { padding: 20, alignItems: 'center' },
  detailRoom: { fontSize: 22, fontWeight: '800', color: '#fff' },
  detailStatus: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  detailBody: { padding: 20 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  detailLabel: { fontSize: 13, color: C.gray },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', maxWidth: '60%', textAlign: 'right' },
  closeBtn: {
    margin: 16, backgroundColor: C.bg, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: C.primary },
});
