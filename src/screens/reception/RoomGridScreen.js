// src/screens/reception/RoomGridScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, LoadingView } from '../../components/SharedComponents';

const STATUS_CONFIG = {
  available:    { color: C.success, bg: '#d1fae5', label: 'Available',    short: 'AVL' },
  occupied:     { color: C.blue,    bg: '#dbeafe', label: 'Occupied',     short: 'OCC' },
  maintenance:  { color: '#d97706', bg: '#fef3c7', label: 'Maintenance',  short: 'MNT' },
  housekeeping: { color: C.purple,  bg: '#ede9fe', label: 'Housekeeping', short: 'HKP' },
  reserved:     { color: C.primary, bg: C.primary + '18', label: 'Reserved', short: 'RSV' },
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
      {room.category_name && (
        <Text style={styles.cellType} numberOfLines={1}>{room.category_name}</Text>
      )}
    </TouchableOpacity>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function RoomDetail({ room, onClose, currencySymbol }) {
  const sc = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  const checkIn  = room.check_in_date  ? room.check_in_date.slice(0, 10)  : null;
  const checkOut = room.check_out_date ? room.check_out_date.slice(0, 10) : null;
  return (
    <View style={styles.detailOverlay}>
      <TouchableOpacity style={styles.detailBg} onPress={onClose} />
      <View style={styles.detailCard}>
        <View style={[styles.detailHeader, { backgroundColor: sc.color }]}>
          <Text style={styles.detailRoom}>Room {room.room_number}</Text>
          <Text style={styles.detailStatus}>{sc.label}</Text>
        </View>
        <ScrollView style={styles.detailBody}>
          <DetailRow label="Category"     value={room.category_name} />
          <DetailRow label="Floor"        value={room.floor ? `Floor ${room.floor}` : null} />
          <DetailRow label="Wing"         value={room.wing} />
          <DetailRow label="Bed Type"     value={room.bed_type} />
          <DetailRow label="Max Guests"   value={room.max_adults ? `${room.max_adults} adults` : null} />
          <DetailRow label="Rate"         value={room.base_price ? `${currencySymbol}${Number(room.base_price).toLocaleString()}/night` : null} />
          <DetailRow label="Housekeeping" value={room.housekeeping_status} />
          {room.booking_reference && (
            <>
              <View style={[styles.detailRow, { marginTop: 8, borderTopWidth: 2, borderTopColor: '#e5e7eb' }]}>
                <Text style={[styles.detailLabel, { fontWeight: '700' }]}>Current Guest</Text>
              </View>
              <DetailRow label="Guest"      value={`${room.guest_first_name || ''} ${room.guest_last_name || ''}`.trim()} />
              <DetailRow label="Phone"      value={room.guest_phone} />
              <DetailRow label="Reference"  value={room.booking_reference} />
              <DetailRow label="Check-In"   value={checkIn} />
              <DetailRow label="Check-Out"  value={checkOut} />
              <DetailRow label="Booking Status" value={room.booking_status?.replace(/_/g, ' ')} />
              <DetailRow label="Payment"    value={room.payment_status} />
              {room.total_amount && (
                <DetailRow label="Total"    value={`${currencySymbol}${Number(room.total_amount).toLocaleString()}`} />
              )}
              {room.amount_paid && (
                <DetailRow label="Paid"     value={`${currencySymbol}${Number(room.amount_paid).toLocaleString()}`} />
              )}
            </>
          )}
          {room.notes ? <DetailRow label="Notes" value={room.notes} /> : null}
        </ScrollView>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RoomGridScreen({ navigation }) {
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const primary        = theme?.primary_color || C.primary;
  const currencySymbol = hotelInfo?.currency_symbol || '$';

  const fetchRooms = async () => {
    try {
      const res = await api.get('/frontdesk/room-grid');
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Room grid error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = rooms.filter(r => r.status === key).length;
    return acc;
  }, {});

  const legend = [
    { key: 'all',         label: `All (${rooms.length})`,                            color: C.gray },
    { key: 'available',   label: `Available (${statusCounts.available || 0})`,        color: C.success },
    { key: 'occupied',    label: `Occupied (${statusCounts.occupied || 0})`,          color: C.blue },
    { key: 'maintenance', label: `Maintenance (${statusCounts.maintenance || 0})`,   color: '#d97706' },
    { key: 'housekeeping',label: `Housekeeping (${statusCounts.housekeeping || 0})`, color: C.purple },
  ];

  const filtered = filterStatus === 'all' ? rooms : rooms.filter(r => r.status === filterStatus);

  const grouped = filtered.reduce((acc, r) => {
    const key = `Floor ${r.floor || '—'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Room Grid"
        subtitle={`${rooms.length} rooms`}
        onBack={() => navigation.goBack()}
        color={primary}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendRow} contentContainerStyle={styles.legendContent}>
        {legend.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.legendItem, filterStatus === s.key && { borderBottomColor: s.color, borderBottomWidth: 2 }]}
            onPress={() => setFilterStatus(s.key)}
          >
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendLabel, { color: s.color }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <LoadingView /> : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={primary} />}
        >
          {Object.keys(grouped).sort().map(floorKey => (
            <View key={floorKey} style={styles.floorSection}>
              <Text style={[styles.floorLabel, { color: primary }]}>{floorKey}</Text>
              <View style={styles.grid}>
                {grouped[floorKey].map((room, i) => (
                  <RoomCell key={i} room={room} onPress={setSelectedRoom} />
                ))}
              </View>
            </View>
          ))}
          {filtered.length === 0 && (
            <Text style={styles.empty}>No rooms found</Text>
          )}
        </ScrollView>
      )}

      {selectedRoom && (
        <RoomDetail room={selectedRoom} onClose={() => setSelectedRoom(null)} currencySymbol={currencySymbol} />
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
    paddingHorizontal: 10, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLabel: { fontSize: 11, fontWeight: '600' },
  floorSection: { paddingHorizontal: 12, paddingTop: 12 },
  floorLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: '22%', aspectRatio: 0.9,
    borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', padding: 4,
  },
  cellNum: { fontSize: 14, fontWeight: '800' },
  cellStatus: { fontSize: 8, fontWeight: '700', marginTop: 2 },
  cellType: { fontSize: 7, color: C.gray, marginTop: 1, textAlign: 'center' },
  empty: { color: C.gray, textAlign: 'center', marginTop: 40, fontSize: 14 },
  detailOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  detailBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  detailCard: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden', maxHeight: '75%',
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
