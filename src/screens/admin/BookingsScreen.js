// src/screens/admin/BookingsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView, Modal, Alert, ActivityIndicator,
  Image, Linking,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView,
} from '../../components/SharedComponents';

const STATUS_OPTIONS = [
  { key: 'confirmed',   label: 'Confirm',    color: C.success,  icon: '✅' },
  { key: 'checked_in',  label: 'Check In',   color: C.blue,     icon: '🛬' },
  { key: 'checked_out', label: 'Check Out',  color: C.purple,   icon: '🛫' },
  { key: 'cancelled',   label: 'Cancel',     color: C.danger,   icon: '❌' },
  { key: 'no_show',     label: 'No Show',    color: '#d97706',  icon: '👻' },
];

function statusColor(s) {
  switch (s) {
    case 'confirmed':   return { color: C.success,  bg: '#d1fae5' };
    case 'checked_in':  return { color: C.blue,     bg: '#dbeafe' };
    case 'checked_out': return { color: '#6b7280',  bg: '#f1f5f9' };
    case 'cancelled':   return { color: C.danger,   bg: '#fee2e2' };
    case 'no_show':     return { color: '#d97706',  bg: '#fef3c7' };
    case 'pending':     return { color: '#d97706',  bg: '#fef3c7' };
    default:            return { color: C.gray,     bg: '#f1f5f9' };
  }
}

function Detail({ icon, label }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailText}>{label}</Text>
    </View>
  );
}

function BookingCard({ booking, currencySymbol, onPress }) {
  const sc       = statusColor(booking.status);
  const checkIn  = booking.check_in_date  ? booking.check_in_date.slice(0, 10)  : '—';
  const checkOut = booking.check_out_date ? booking.check_out_date.slice(0, 10) : '—';
  return (
    <TouchableOpacity onPress={() => onPress(booking)} activeOpacity={0.8}>
      <Card>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.guestName}>{booking.guest_first_name} {booking.guest_last_name}</Text>
            <Text style={styles.ref}>#{booking.booking_reference}</Text>
          </View>
          <StatusBadge label={(booking.status || 'pending').replace(/_/g, ' ').toUpperCase()} {...sc} />
        </View>
        <View style={styles.divider} />
        <View style={styles.details}>
          <Detail icon="🛏" label={`Room ${booking.room_number || '—'} · ${booking.room_name || ''}`} />
          <Detail icon="📅" label={`${checkIn} → ${checkOut} (${booking.nights || '?'} nights)`} />
          <Detail icon="👥" label={`${booking.adults || 1} adults${booking.children ? `, ${booking.children} children` : ''}`} />
          <Detail icon="💰" label={`${currencySymbol}${Number(booking.total_amount || 0).toLocaleString()} · ${(booking.payment_status || 'pending').replace(/_/g,' ')}`} />
          {booking.source && <Detail icon="🔗" label={`Source: ${booking.source.replace(/_/g,' ')}`} />}
        </View>
        <Text style={styles.tapHint}>Tap for details & actions →</Text>
      </Card>
    </TouchableOpacity>
  );
}

function BookingDetailModal({ booking, visible, onClose, onStatusChange, currencySymbol, apiBase }) {
  const [updating, setUpdating] = useState(false);
  const [activeBtn, setActiveBtn] = useState(null);
  if (!booking) return null;

  const sc       = statusColor(booking.status);
  const checkIn  = booking.check_in_date  ? booking.check_in_date.slice(0, 10)  : '—';
  const checkOut = booking.check_out_date ? booking.check_out_date.slice(0, 10) : '—';

  const handleStatus = (opt) => {
    Alert.alert(
      `${opt.icon} ${opt.label}`,
      `Change booking #${booking.booking_reference} to "${opt.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: opt.label,
          style: opt.key === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdating(true);
            setActiveBtn(opt.key);
            await onStatusChange(booking.id, opt.key);
            setUpdating(false);
            setActiveBtn(null);
          },
        },
      ]
    );
  };

  const proofUrl = booking.proof_filename
    ? `${apiBase.replace('/api', '')}/uploads/payment-proofs/${booking.proof_filename}`
    : null;

  const rows = [
    ['Guest',          `${booking.guest_first_name} ${booking.guest_last_name}`],
    ['Email',          booking.guest_email || '—'],
    ['Phone',          booking.guest_phone || '—'],
    ['Nationality',    booking.guest_nationality || '—'],
    ['ID Type',        booking.guest_id_type || '—'],
    ['ID Number',      booking.guest_id_number || '—'],
    ['Room',           `${booking.room_number || '—'} — ${booking.room_name || '—'}`],
    ['Check-in',       checkIn],
    ['Check-out',      checkOut],
    ['Nights',         booking.nights || '—'],
    ['Adults/Children',`${booking.adults || 1} / ${booking.children || 0}`],
    ['Room Rate',      `${currencySymbol}${Number(booking.room_rate || 0).toLocaleString()}`],
    ['Subtotal',       `${currencySymbol}${Number(booking.subtotal || 0).toLocaleString()}`],
    ['Tax (13%)',      `${currencySymbol}${Number(booking.taxes || 0).toLocaleString()}`],
    ['Service Charge', `${currencySymbol}${Number(booking.service_charge || 0).toLocaleString()}`],
    ['Discount',       `${currencySymbol}${Number(booking.discount_amount || 0).toLocaleString()}`],
    ['Total',          `${currencySymbol}${Number(booking.total_amount || 0).toLocaleString()}`],
    ['Payment Method', (booking.payment_method || '—').replace(/_/g,' ')],
    ['Payment Status', (booking.payment_status || '—').replace(/_/g,' ')],
    ['Source',         (booking.source || '—').replace(/_/g,' ')],
    ['Booked At',      booking.created_at ? new Date(booking.created_at).toLocaleString() : '—'],
    ['Checked In At',  booking.checked_in_at ? new Date(booking.checked_in_at).toLocaleString() : '—'],
    ['Checked Out At', booking.checked_out_at ? new Date(booking.checked_out_at).toLocaleString() : '—'],
  ];

  const availableActions = STATUS_OPTIONS.filter(o => o.key !== booking.status);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBg} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={[styles.modalHeader, { backgroundColor: sc.color }]}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalGuestName}>{booking.guest_first_name} {booking.guest_last_name}</Text>
              <Text style={styles.modalRef}>#{booking.booking_reference}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>ACTIONS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsRow}>
              {availableActions.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.actionBtn, { backgroundColor: opt.color + '18', borderColor: opt.color }]}
                  onPress={() => handleStatus(opt)}
                  disabled={updating}
                >
                  {updating && activeBtn === opt.key
                    ? <ActivityIndicator size="small" color={opt.color} />
                    : <>
                        <Text style={styles.actionIcon}>{opt.icon}</Text>
                        <Text style={[styles.actionLabel, { color: opt.color }]}>{opt.label}</Text>
                      </>
                  }
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>BOOKING DETAILS</Text>
            {rows.map(([l, v]) => (
              <View key={l} style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>{l}</Text>
                <Text style={styles.detailRowValue}>{v}</Text>
              </View>
            ))}

            {booking.special_requests ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>SPECIAL REQUESTS</Text>
                <Text style={styles.notesText}>{booking.special_requests}</Text>
              </View>
            ) : null}

            {booking.internal_notes ? (
              <View style={[styles.notesBox, { backgroundColor: '#fef9c3' }]}>
                <Text style={styles.notesLabel}>INTERNAL NOTES</Text>
                <Text style={styles.notesText}>{booking.internal_notes}</Text>
              </View>
            ) : null}

            {proofUrl ? (
              <View style={styles.proofBox}>
                <Text style={styles.sectionLabel}>PAYMENT PROOF</Text>
                <Image source={{ uri: proofUrl }} style={styles.proofImage} resizeMode="contain" />
                <TouchableOpacity
                  style={styles.proofOpenBtn}
                  onPress={() => Linking.openURL(proofUrl)}
                >
                  <Text style={styles.proofOpenText}>Open Full Image</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function BookingsScreen({ navigation }) {
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [bookings, setBookings]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [selected, setSelected]     = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const primary        = theme?.primary_color || C.primary;
  const currencySymbol = hotelInfo?.currency_symbol || 'Rs';
  const FILTERS        = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  const fetchBookings = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const res = await api.get('/bookings', { params });
      const d = res.data;
      setBookings(Array.isArray(d) ? d : (d?.data || []));
      setTotal(Array.isArray(d) ? d.length : (d?.total || 0));
    } catch (e) {
      console.error('Bookings error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchBookings(); }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
      setBookings(updated);
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      Alert.alert('Updated', `Booking status changed to ${status.replace(/_/g, ' ')}`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCardPress = (booking) => {
    setSelected(booking);
    setShowDetail(true);
  };

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
        subtitle={`${total} total`}
        onBack={() => navigation.goBack()}
        color={primary}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search guest, reference, room…"
        onSubmitEditing={() => { setLoading(true); fetchBookings(); }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && { backgroundColor: primary, borderColor: primary }]}
            onPress={() => setFilter(f)}
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
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              currencySymbol={currencySymbol}
              onPress={handleCardPress}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="📋" message="No bookings found" />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchBookings(); }}
              tintColor={primary}
            />
          }
        />
      )}

      <BookingDetailModal
        booking={selected}
        visible={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null); }}
        onStatusChange={handleStatusChange}
        currencySymbol={currencySymbol}
        apiBase="https://hotel.primelogic.com.np/api"
      />
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
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  details: { gap: 6 },
  detail: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { fontSize: 13, marginRight: 8, width: 20 },
  detailText: { fontSize: 13, color: '#374151' },
  tapHint: { fontSize: 10, color: C.gray, textAlign: 'right', marginTop: 8 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  modalHeaderLeft: { flex: 1 },
  modalGuestName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  modalRef: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalBody: { padding: 20 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.gray,
    letterSpacing: 1.5, marginBottom: 10, marginTop: 4,
  },
  actionsRow: { marginBottom: 20 },
  actionBtn: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', marginRight: 10, minWidth: 70,
  },
  actionIcon: { fontSize: 18, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '700' },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  detailRowLabel: { fontSize: 13, color: C.gray, flex: 1 },
  detailRowValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right', textTransform: 'capitalize' },

  notesBox: {
    marginTop: 16, backgroundColor: '#f8fafc',
    borderRadius: 12, padding: 14,
  },
  notesLabel: { fontSize: 10, fontWeight: '700', color: C.gray, letterSpacing: 1.5, marginBottom: 6 },
  notesText: { fontSize: 13, color: '#374151', lineHeight: 20 },

  proofBox: { marginTop: 16 },
  proofImage: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#f1f5f9' },
  proofOpenBtn: {
    marginTop: 8, alignItems: 'center', padding: 10,
    backgroundColor: C.bg, borderRadius: 8,
  },
  proofOpenText: { color: C.primary, fontWeight: '600', fontSize: 13 },
});
