// src/screens/reception/NewBookingScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Modal, FlatList, Platform,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader } from '../../components/SharedComponents';

const ID_TYPES     = ['Passport', 'Citizenship', 'Driving Licence', 'Voter ID', 'Other'];
const PAY_METHODS  = ['cash', 'card', 'qr_transfer', 'bank_transfer'];
const PAY_LABELS   = { cash: '💵 Cash', card: '💳 Card', qr_transfer: '📱 QR Transfer', bank_transfer: '🏦 Bank Transfer' };
const NATIONALITIES = ['Nepali', 'Indian', 'Chinese', 'American', 'British', 'Australian', 'German', 'French', 'Japanese', 'Korean', 'Other'];

function DatePicker({ label, value, onChange, minDate, required }) {
  const [show, setShow] = useState(false);
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const toStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isDisabled = (d) => {
    if (!d) return true;
    const s = toStr(year, month, d);
    if (minDate && s < minDate) return true;
    return false;
  };

  const isSelected = (d) => d && value === toStr(year, month, d);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShow(true)}>
        <Text style={[styles.pickerBtnText, !value && { color: C.gray }]}>
          {value || 'Select date'}
        </Text>
        <Text style={styles.pickerIcon}>📅</Text>
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setShow(false)} />
          <View style={styles.calendarCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNav}>
                <Text style={styles.calNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calTitle}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNav}>
                <Text style={styles.calNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calDayRow}>
              {DAYS.map(d => <Text key={d} style={styles.calDayLabel}>{d}</Text>)}
            </View>

            <View style={styles.calGrid}>
              {cells.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.calCell,
                    isSelected(d) && styles.calCellSelected,
                    isDisabled(d) && styles.calCellDisabled,
                  ]}
                  onPress={() => {
                    if (!d || isDisabled(d)) return;
                    onChange(toStr(year, month, d));
                    setShow(false);
                  }}
                  disabled={isDisabled(d)}
                >
                  <Text style={[
                    styles.calCellText,
                    isSelected(d) && styles.calCellTextSelected,
                    isDisabled(d) && styles.calCellTextDisabled,
                  ]}>{d || ''}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.calCancelBtn} onPress={() => setShow(false)}>
              <Text style={styles.calCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Dropdown({ label, value, options, optionLabels, onChange, required }) {
  const [show, setShow] = useState(false);
  const display = optionLabels ? (optionLabels[value] || value) : value;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShow(true)}>
        <Text style={[styles.pickerBtnText, !value && { color: C.gray }]}>{display || 'Select…'}</Text>
        <Text style={styles.pickerIcon}>▾</Text>
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setShow(false)} />
          <View style={styles.dropCard}>
            <Text style={styles.dropTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropItem, item === value && styles.dropItemActive]}
                  onPress={() => { onChange(item); setShow(false); }}
                >
                  <Text style={[styles.dropItemText, item === value && styles.dropItemTextActive]}>
                    {optionLabels ? optionLabels[item] : item}
                  </Text>
                  {item === value && <Text style={styles.dropCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  );
}

function Counter({ label, value, onChange, min = 0 }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterVal}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(value + 1)}>
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NewBookingScreen({ navigation }) {
  const { api, theme, hotelInfo } = useContext(AuthContext);
  const [loading, setLoading]     = useState(false);
  const [rooms, setRooms]         = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const primary        = theme?.primary_color || C.primary;
  const gold           = theme?.secondary_color || '#c9a96e';
  const currencySymbol = hotelInfo?.currency_symbol || 'Rs';

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const tomorrowStr = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const [form, setForm] = useState({
    guest_first_name: '',
    guest_last_name: '',
    guest_email: '',
    guest_phone: '',
    guest_nationality: 'Nepali',
    guest_id_type: 'Citizenship',
    guest_id_number: '',
    check_in_date: todayStr(),
    check_out_date: tomorrowStr(),
    adults: 1,
    children: 0,
    payment_method: 'cash',
    amount_paid: '0',
    special_requests: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const fetchAvailableRooms = async (ci, co) => {
    if (!ci || !co || ci >= co) return;
    setLoadingRooms(true);
    setSelectedRoom(null);
    setRooms([]);
    try {
      const res = await api.get('/frontdesk/available-rooms', {
        params: { check_in: ci, check_out: co },
      });
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Available rooms:', e.response?.data || e.message);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms(form.check_in_date, form.check_out_date);
  }, [form.check_in_date, form.check_out_date]);

  const nights = form.check_in_date && form.check_out_date
    ? Math.max(0, Math.ceil((new Date(form.check_out_date) - new Date(form.check_in_date)) / 86400000))
    : 0;

  const estimatedTotal = selectedRoom && nights
    ? (() => {
        const sub  = selectedRoom.base_price * nights;
        const tax  = sub * 0.13;
        const sc   = sub * 0.10;
        return (sub + tax + sc).toFixed(2);
      })()
    : null;

  const handleSubmit = async () => {
    if (!form.guest_first_name || !form.guest_last_name) {
      Alert.alert('Missing Fields', 'Guest first and last name are required.'); return;
    }
    if (!selectedRoom) {
      Alert.alert('No Room Selected', 'Please select check-in/check-out dates and choose a room.'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/frontdesk/walk-in', {
        room_id:            selectedRoom.id,
        check_in_date:      form.check_in_date,
        check_out_date:     form.check_out_date,
        guest_first_name:   form.guest_first_name,
        guest_last_name:    form.guest_last_name,
        guest_email:        form.guest_email || undefined,
        guest_phone:        form.guest_phone || undefined,
        guest_nationality:  form.guest_nationality || undefined,
        guest_id_type:      form.guest_id_type || undefined,
        guest_id_number:    form.guest_id_number || undefined,
        adults:             form.adults,
        children:           form.children,
        payment_method:     form.payment_method,
        amount_paid:        parseFloat(form.amount_paid) || 0,
        special_requests:   form.special_requests || undefined,
      });
      const ref   = res.data?.booking_reference || '';
      const total = res.data?.total_amount || '';
      Alert.alert(
        '✅ Booking Created',
        `Reference: ${ref}\nRoom: ${selectedRoom.room_number}\nTotal: ${currencySymbol}${total}\n\nGuest is checked in.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Walk-in Booking" onBack={() => navigation.goBack()} color={primary} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>👤 Guest Information</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="First Name" value={form.guest_first_name} onChangeText={v => set('guest_first_name', v)} placeholder="First name" required />
            </View>
            <View style={styles.half}>
              <Field label="Last Name" value={form.guest_last_name} onChangeText={v => set('guest_last_name', v)} placeholder="Last name" required />
            </View>
          </View>
          <Field label="Phone" value={form.guest_phone} onChangeText={v => set('guest_phone', v)} placeholder="+977 98XXXXXXXX" keyboardType="phone-pad" />
          <Field label="Email" value={form.guest_email} onChangeText={v => set('guest_email', v)} placeholder="guest@email.com" keyboardType="email-address" />
          <Dropdown label="Nationality" value={form.guest_nationality} options={NATIONALITIES} onChange={v => set('guest_nationality', v)} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>🪪 ID Verification</Text>
          <Dropdown label="ID Type" value={form.guest_id_type} options={ID_TYPES} onChange={v => set('guest_id_type', v)} />
          <Field label="ID Number" value={form.guest_id_number} onChangeText={v => set('guest_id_number', v)} placeholder="Enter ID number" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>📅 Stay Dates</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <DatePicker
                label="Check-In"
                value={form.check_in_date}
                onChange={v => set('check_in_date', v)}
                required
              />
            </View>
            <View style={styles.half}>
              <DatePicker
                label="Check-Out"
                value={form.check_out_date}
                onChange={v => set('check_out_date', v)}
                minDate={form.check_in_date}
                required
              />
            </View>
          </View>

          {nights > 0 && (
            <View style={[styles.nightsBadge, { backgroundColor: primary + '15' }]}>
              <Text style={[styles.nightsText, { color: primary }]}>🌙 {nights} night{nights !== 1 ? 's' : ''}</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.half}>
              <Counter label="Adults" value={form.adults} onChange={v => set('adults', v)} min={1} />
            </View>
            <View style={styles.half}>
              <Counter label="Children" value={form.children} onChange={v => set('children', v)} min={0} />
            </View>
          </View>

          {loadingRooms && (
            <View style={styles.roomLoadBox}>
              <ActivityIndicator size="small" color={primary} />
              <Text style={styles.roomLoadText}>Loading available rooms…</Text>
            </View>
          )}

          {!loadingRooms && form.check_in_date && form.check_out_date && form.check_in_date < form.check_out_date && rooms.length === 0 && (
            <View style={styles.noRoomsBox}>
              <Text style={styles.noRoomsText}>⚠️ No rooms available for selected dates</Text>
            </View>
          )}

          {!loadingRooms && rooms.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Select Room *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {rooms.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.roomChip, selectedRoom?.id === r.id && { backgroundColor: primary, borderColor: primary }]}
                    onPress={() => setSelectedRoom(r)}
                  >
                    <Text style={[styles.roomChipNum, selectedRoom?.id === r.id && { color: '#fff' }]}>{r.room_number}</Text>
                    <Text style={[styles.roomChipType, selectedRoom?.id === r.id && { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>{r.category_name}</Text>
                    <Text style={[styles.roomChipPrice, selectedRoom?.id === r.id && { color: '#fff' }]}>{currencySymbol}{r.base_price}/night</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedRoom && (
            <View style={[styles.selectedBox, { borderColor: primary, backgroundColor: primary + '10' }]}>
              <Text style={[styles.selectedTitle, { color: primary }]}>✅ Room {selectedRoom.room_number} — {selectedRoom.category_name}</Text>
              <Text style={styles.selectedMeta}>Floor {selectedRoom.floor || '—'} · {currencySymbol}{selectedRoom.base_price}/night</Text>
              {estimatedTotal && (
                <Text style={[styles.selectedTotal, { color: primary }]}>
                  Estimated Total ({nights} night{nights !== 1 ? 's' : ''}): {currencySymbol}{estimatedTotal}
                  {'\n'}<Text style={styles.taxNote}>Includes 13% VAT + 10% service charge</Text>
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>💳 Payment</Text>
          <Dropdown
            label="Payment Method"
            value={form.payment_method}
            options={PAY_METHODS}
            optionLabels={PAY_LABELS}
            onChange={v => set('payment_method', v)}
          />
          <Field
            label="Amount Paid Now"
            value={String(form.amount_paid)}
            onChangeText={v => set('amount_paid', v)}
            placeholder="0"
            keyboardType="decimal-pad"
          />
          {estimatedTotal && (
            <Text style={styles.balanceNote}>
              Balance due: {currencySymbol}{Math.max(0, estimatedTotal - (parseFloat(form.amount_paid) || 0)).toFixed(2)}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primary }]}>📝 Special Requests</Text>
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
            : <Text style={styles.submitText}>✅ Create Walk-in Booking</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16 },
  section: {
    backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: C.bg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1e293b',
    borderWidth: 1, borderColor: C.border,
  },
  textarea: { minHeight: 80, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },

  pickerBtn: {
    backgroundColor: C.bg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerBtnText: { fontSize: 14, color: '#1e293b', flex: 1 },
  pickerIcon: { fontSize: 16, marginLeft: 8 },

  nightsBadge: {
    borderRadius: 8, padding: 8, marginBottom: 14, alignItems: 'center',
  },
  nightsText: { fontSize: 13, fontWeight: '700' },

  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  counterBtnText: { fontSize: 20, fontWeight: '600', color: '#374151' },
  counterVal: { fontSize: 18, fontWeight: '700', color: '#1e293b', minWidth: 30, textAlign: 'center' },

  roomLoadBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  roomLoadText: { color: C.gray, fontSize: 13 },
  noRoomsBox: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 12, marginTop: 4 },
  noRoomsText: { color: '#92400e', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  roomChip: {
    borderRadius: 12, padding: 12, marginRight: 10,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    minWidth: 90, alignItems: 'center',
  },
  roomChipNum: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  roomChipType: { fontSize: 10, color: C.gray, marginTop: 2, textAlign: 'center' },
  roomChipPrice: { fontSize: 10, color: C.gray, marginTop: 2 },

  selectedBox: { marginTop: 10, borderRadius: 12, padding: 14, borderWidth: 1.5 },
  selectedTitle: { fontSize: 13, fontWeight: '700' },
  selectedMeta: { fontSize: 12, color: C.gray, marginTop: 3 },
  selectedTotal: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  taxNote: { fontSize: 11, fontWeight: '400', color: C.gray },

  balanceNote: { fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: '600' },

  submitBtn: {
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },

  calendarCard: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  calNav: { padding: 8 },
  calNavText: { fontSize: 24, color: '#374151', fontWeight: '300' },
  calTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  calDayRow: { flexDirection: 'row', marginBottom: 8 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: C.gray },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100/7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center', borderRadius: 999,
  },
  calCellSelected: { backgroundColor: '#1a3c2e' },
  calCellDisabled: { opacity: 0.3 },
  calCellText: { fontSize: 14, color: '#1e293b' },
  calCellTextSelected: { color: '#fff', fontWeight: '700' },
  calCellTextDisabled: { color: C.gray },
  calCancelBtn: { marginTop: 16, padding: 14, alignItems: 'center', backgroundColor: C.bg, borderRadius: 12 },
  calCancelText: { color: '#374151', fontWeight: '600', fontSize: 14 },

  dropCard: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '60%', paddingTop: 20,
  },
  dropTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, marginBottom: 8 },
  dropItem: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dropItemActive: { backgroundColor: '#f0fdf4' },
  dropItemText: { fontSize: 15, color: '#374151' },
  dropItemTextActive: { color: '#1a3c2e', fontWeight: '700' },
  dropCheck: { fontSize: 16, color: '#1a3c2e', fontWeight: '700' },
});
