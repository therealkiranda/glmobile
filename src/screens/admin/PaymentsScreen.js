// src/screens/admin/PaymentsScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ScrollView, TouchableOpacity, Modal, Alert, Image, Linking, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, StatusBadge, SearchBar, EmptyState, LoadingView } from '../../components/SharedComponents';

function statusConfig(s) {
  switch (s) {
    case 'verified':   return { color: C.success, bg: '#d1fae5' };
    case 'pending':    return { color: '#d97706', bg: '#fef3c7' };
    case 'rejected':   return { color: C.danger,  bg: '#fee2e2' };
    case 'cash':       return { color: C.blue,    bg: '#dbeafe' };
    default:           return { color: C.gray,    bg: '#f1f5f9' };
  }
}

function PaymentCard({ payment, currencySymbol, onPress }) {
  const sc = statusConfig(payment.status);
  const guestName = [payment.guest_first_name, payment.guest_last_name].filter(Boolean).join(' ') || 'Guest';
  const date = payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '—';
  return (
    <TouchableOpacity onPress={() => onPress(payment)} activeOpacity={0.8}>
      <Card>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.guest}>{guestName}</Text>
            <Text style={styles.ref}>#{payment.booking_reference || '—'}</Text>
            <Text style={styles.method}>💳 {(payment.method || 'unknown').replace(/_/g, ' ')} · {date}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.amount}>{currencySymbol}{Number(payment.amount || 0).toLocaleString()}</Text>
            <StatusBadge label={(payment.status || 'pending').toUpperCase()} {...sc} />
          </View>
        </View>
        {payment.proof_filename && (
          <Text style={styles.proofHint}>📎 Payment proof attached · tap to view</Text>
        )}
      </Card>
    </TouchableOpacity>
  );
}

function PaymentDetailModal({ payment, visible, onClose, onVerify, onReject, currencySymbol }) {
  const [loading, setLoading] = useState(false);
  if (!payment) return null;

  const guestName = [payment.guest_first_name, payment.guest_last_name].filter(Boolean).join(' ') || 'Guest';
  const proofUrl = payment.proof_filename
    ? `https://hotel.primelogic.com.np/uploads/payment-proofs/${payment.proof_filename}`
    : null;

  const handleVerify = () => {
    Alert.alert('Verify Payment', `Mark ${currencySymbol}${Number(payment.amount).toLocaleString()} payment as verified?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Verify', onPress: async () => { setLoading(true); await onVerify(payment.id); setLoading(false); } },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Payment', 'Reject this payment proof?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => { setLoading(true); await onReject(payment.id); setLoading(false); } },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBg} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Detail</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {[
              ['Guest',    guestName],
              ['Booking',  `#${payment.booking_reference || '—'}`],
              ['Method',   (payment.method || '—').replace(/_/g,' ')],
              ['Amount',   `${currencySymbol}${Number(payment.amount || 0).toLocaleString()}`],
              ['Status',   (payment.status || '—')],
              ['Date',     payment.created_at ? new Date(payment.created_at).toLocaleString() : '—'],
              ['Notes',    payment.notes || '—'],
            ].map(([l, v]) => (
              <View key={l} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{l}</Text>
                <Text style={styles.detailValue}>{v}</Text>
              </View>
            ))}

            {proofUrl ? (
              <View style={styles.proofBox}>
                <Text style={styles.proofTitle}>Payment Proof</Text>
                <Image source={{ uri: proofUrl }} style={styles.proofImage} resizeMode="contain" />
                <TouchableOpacity style={styles.openBtn} onPress={() => Linking.openURL(proofUrl)}>
                  <Text style={styles.openBtnText}>Open Full Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noProof}>No payment proof uploaded</Text>
            )}

            {payment.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.verifyText}>✅ Verify Payment</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectBtn, loading && { opacity: 0.6 }]}
                  onPress={handleReject}
                  disabled={loading}
                >
                  <Text style={styles.rejectText}>❌ Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function PaymentsScreen({ navigation }) {
  const { api, hotelInfo, theme } = useContext(AuthContext);
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const primary        = theme?.primary_color || C.primary;
  const currencySymbol = hotelInfo?.currency_symbol || 'Rs';
  const FILTERS        = ['all', 'pending', 'verified', 'rejected'];

  const fetchPayments = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/payments', { params });
      const d = res.data;
      setPayments(Array.isArray(d) ? d : (d?.data || []));
    } catch (e) {
      console.error('Payments error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); fetchPayments(); }, [filter]);

  const totalCollected = payments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pending = payments.filter(p => p.status === 'pending').length;

  const handleVerify = async (id) => {
    try {
      await api.put(`/payments/${id}/verify`, { status: 'verified' });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'verified' } : p));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'verified' }));
      Alert.alert('Verified', 'Payment has been verified successfully.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to verify');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/payments/${id}/verify`, { status: 'rejected' });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'rejected' }));
      Alert.alert('Rejected', 'Payment has been rejected.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to reject');
    }
  };

  const filtered = payments.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter;
    const q = search.toLowerCase();
    const name = [p.guest_first_name, p.guest_last_name].join(' ');
    const matchSearch = !q || [name, p.booking_reference]
      .some(v => String(v || '').toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Payments" subtitle={`${payments.length} transactions`} onBack={() => navigation.goBack()} color={primary} />

      <View style={[styles.revBox, { backgroundColor: primary }]}>
        <View style={styles.revItem}>
          <Text style={styles.revLabel}>Total Verified</Text>
          <Text style={styles.revAmount}>{currencySymbol}{totalCollected.toLocaleString()}</Text>
        </View>
        {pending > 0 && (
          <View style={[styles.revItem, styles.revItemBorder]}>
            <Text style={styles.revLabel}>Pending Review</Text>
            <Text style={[styles.revAmount, { color: '#fbbf24' }]}>{pending}</Text>
          </View>
        )}
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search guest or reference…" />

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
          renderItem={({ item }) => (
            <PaymentCard
              payment={item}
              currencySymbol={currencySymbol}
              onPress={p => { setSelected(p); setShowDetail(true); }}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="💳" message="No payments found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} tintColor={primary} />}
        />
      )}

      <PaymentDetailModal
        payment={selected}
        visible={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null); }}
        onVerify={handleVerify}
        onReject={handleReject}
        currencySymbol={currencySymbol}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  revBox: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 20 },
  revItem: { flex: 1, alignItems: 'center' },
  revItemBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  revLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: 0.5 },
  revAmount: { fontSize: 24, fontWeight: '800', color: '#c9a96e', marginTop: 2 },
  filterRow: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  chipText: { fontSize: 12, fontWeight: '600', color: C.gray },
  chipTextActive: { color: C.white },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flex: { flex: 1 },
  guest: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  ref: { fontSize: 11, color: C.gray, marginTop: 2 },
  method: { fontSize: 12, color: C.gray, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 18, fontWeight: '800', color: C.primary },
  proofHint: { fontSize: 11, color: C.blue, marginTop: 8, fontWeight: '600' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: C.gray },
  modalBody: { padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailLabel: { fontSize: 13, color: C.gray },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' },
  proofBox: { marginTop: 20 },
  proofTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  proofImage: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#f1f5f9' },
  openBtn: { marginTop: 8, alignItems: 'center', padding: 10, backgroundColor: C.bg, borderRadius: 8 },
  openBtnText: { color: C.primary, fontWeight: '600', fontSize: 13 },
  noProof: { textAlign: 'center', color: C.gray, marginTop: 20, fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  verifyBtn: { flex: 1, backgroundColor: C.success, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  verifyText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.danger },
  rejectText: { color: C.danger, fontWeight: '700', fontSize: 14 },
});
