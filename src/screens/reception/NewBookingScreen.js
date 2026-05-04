// src/screens/reception/NewBookingScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader } from '../../components/SharedComponents';

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', required }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.gray}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  );
}

function RoomPicker({ rooms, selectedId, onSelect }) {
  if (!rooms.length) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Select Room *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
        {rooms.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.roomChip, selectedId === r.id && styles.roomChipActive]}
            onPress={() => onSelect(r)}
          >
            <Text style={[styles.roomChipNum, selectedId === r.id && { color: '#fff' }]}>{r.room_number}</Text>
            <Text style={[styles.roomChipType, selectedId === r.id && { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
              {r.category_name}
            </Text>
            <Text style={[styles.roomChipPrice, selectedId === r.id && { color: '#fff' }]}>
              {r.base_price ? `${r.base_price}/night` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function NewBookingScreen({ navigation }) {
  const { api, theme, hotelInfo } = useContext(AuthContext);
  const [loading, setLoading]     = useState(false);
  const [rooms, setRooms]         = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const primary = theme?.primary_color || C.primary;

  const [form, setForm] = useState({
    guest_first_name: '',
    guest_last_name: '',
    guest_email: '',
    guest_phone: '',
    guest_nationality: '',
    guest_id_type: '',
    guest_id_number: '',
    check_in_date: '',
    check_out_date: '',
    adults: '1',
    children: '0',
    payment_method: 'cash',
    amount_paid: '0',
    special_requests: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const fetchAvailableRooms = async () => {
    if (!form.check_in_date || !form.check_out_date) return;
    if (form.check_in_date >= form.check_out_date) return;
    setLoadingRooms(true);
    try {
      const res = await api.get('/frontdesk/available-rooms', {
        params: { check_in: form.check_in_date, check_out: form.check_out_date },
      });
      setRooms(res.data || []);
      setSelectedRoom(null);
    } catch (e) {
      console.error('Available rooms error:', e.response?.data || e.message);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (form.check_in_date && form.check_out_date) fetchAvailableRooms();
  }, [form.check_in_date, form.check_out_date]);

  const handleSubmit = async () => {
    if (!form.guest_first_name || !form.guest_last_name) {
      Alert.alert('Missing Fields', 'Guest first and last name are required.');
      return;
    }
    if (!selectedRoom) {
      Alert.alert('Missing Room', 'Please select dates and a room.');
      return;
    }
    if (!form.check_in_date || !form.check_out_date) {
      Alert.alert('Missing Dates', 'Please enter check-in and check-out dates.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/frontdesk/walk-in', {
        room_id: selectedRoom.id,
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        guest_first_name: form.guest_first_name,
        guest_last_name: form.guest_last_name,
        guest_email: form.guest_email || undefined,
        guest_phone: form.guest_phone || undefined,
        guest_nationality: form.guest_nationality || undefined,
        guest_id_type: form.guest_id_type || undefined,
        guest_id_number: form.guest_id_number || undefined,
        adults: parseInt(form.adults) || 1,
        children: parseInt(form.children) || 0,
        payment_method: form.payment_method,
        amount_paid: parseFloat(form.amount_paid) || 0,
        special_requests: form.special_requests || undefined,
      });
      const ref = res.data?.booking_reference || '';
      const total = res.data?.total_amount || '';
      Alert.alert(
        'Booking Created ✅',
        `Reference: ${ref}\nTotal: ${hotelInfo?.currency_symbol || '$'}${total}\nGuest is checked in.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.message || 'Failed to create booking';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Walk-in Booking" onBack={() => navigation.goBack()} color={primary} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>Guest Information</Text>
          <Field label="First Name" value={form.guest_first_name} onChangeText={v => set('guest_first_name', v)} placeholder="First name" required />
          <Field label="Last Name"  value={form.guest_last_name}  onChangeText={v => set('guest_last_name', v)}  placeholder="Last name"  required />
          <Field label="Phone"      value={form.guest_phone}      onChangeText={v => set('guest_phone', v)}      placeholder="+977 98XXXXXXXX" keyboardType="phone-pad" />
          <Field label="Email"      value={form.guest_email}      onChangeText={v => set('guest_email', v)}      placeholder="guest@email.com"  keyboardType="email-address" />
          <Field label="Nationality" value={form.guest_nationality} onChangeText={v => set('guest_nationality', v)} placeholder="Nepali" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>ID Verification</Text>
          <Field label="ID Type"   value={form.guest_id_type}   onChangeText={v => set('guest_id_type', v)}   placeholder="Passport / Citizenship / Licence" />
          <Field label="ID Number" value={form.guest_id_number} onChangeText={v => set('guest_id_number', v)} placeholder="ID number" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>Stay Dates</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Check-In Date"  value={form.check_in_date}  onChangeText={v => set('check_in_date', v)}  placeholder="YYYY-MM-DD" required />
            </View>
            <View style={styles.half}>
              <Field label="Check-Out Date" value={form.check_out_date} onChangeText={v => set('check_out_date', v)} placeholder="YYYY-MM-DD" required />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Adults"   value={form.adults}   onChangeText={v => set('adults', v)}   placeholder="1" keyboardType="number-pad" />
            </View>
            <View style={styles.half}>
              <Field label="Children" value={form.children} onChangeText={v => set('children', v)} placeholder="0" keyboardType="number-pad" />
            </View>
          </View>

          {loadingRooms && (
            <View style={styles.roomLoadBox}>
              <ActivityIndicator size="small" color={primary} />
              <Text style={styles.roomLoadText}>Loading available rooms…</Text>
            </View>
          )}

          {!loadingRooms && rooms.length > 0 && (
            <RoomPicker rooms={rooms} selectedId={selectedRoom?.id} onSelect={setSelectedRoom} />
          )}

          {!loadingRooms && form.check_in_date && form.check_out_date && rooms.length === 0 && (
            <Text style={styles.noRooms}>No rooms available for selected dates.</Text>
          )}

          {selectedRoom && (
            <View style={[styles.selectedRoomBox, { borderColor: primary }]}>
              <Text style={[styles.selectedRoomText, { color: primary }]}>
                ✅ Room {selectedRoom.room_number} — {selectedRoom.category_name} — Floor {selectedRoom.floor || '—'}
              </Text>
              {selectedRoom.base_price ? (
                <Text style={styles.selectedRoomPrice}>
                  {hotelInfo?.currency_symbol || '$'}{selectedRoom.base_price}/night
                </Text>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>Payment</Text>
          <Field label="Payment Method" value={form.payment_method} onChangeText={v => set('payment_method', v)} placeholder="cash / card / qr_transfer / bank_transfer" />
          <Field label="Amount Paid"    value={form.amount_paid}    onChangeText={v => set('amount_paid', v)}    placeholder="0" keyboardType="decimal-pad" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>Special Requests</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.special_requests}
            onChangeText={v => set('special_requests', v)}
            placeholder="Any special requests or notes…"
            placeholderTextColor={C.gray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: primary }, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Create Walk-in Booking</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: C.bg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1e293b',
    borderWidth: 1, borderColor: C.border,
  },
  textarea: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  roomLoadBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  roomLoadText: { color: C.gray, fontSize: 13 },
  roomChip: {
    borderRadius: 10, padding: 10, marginRight: 8,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    minWidth: 80, alignItems: 'center',
  },
  roomChipActive: { backgroundColor: '#1a3c2e', borderColor: '#1a3c2e' },
  roomChipNum: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  roomChipType: { fontSize: 10, color: C.gray, marginTop: 2 },
  roomChipPrice: { fontSize: 10, color: C.gray, marginTop: 2 },
  noRooms: { color: '#dc2626', fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  selectedRoomBox: {
    marginTop: 8, borderRadius: 10, padding: 12,
    borderWidth: 1.5, backgroundColor: '#f0fdf4',
  },
  selectedRoomText: { fontSize: 13, fontWeight: '700' },
  selectedRoomPrice: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
