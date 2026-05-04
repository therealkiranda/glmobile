// src/screens/reception/NewBookingScreen.js
import React, { useState, useContext } from 'react';
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
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  );
}

export default function NewBookingScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    room_number: '',
    check_in_date: '',
    check_out_date: '',
    adults: '1',
    children: '0',
    special_requests: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.room_number || !form.check_in_date || !form.check_out_date) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/frontdesk/bookings', {
        ...form,
        adults: parseInt(form.adults) || 1,
        children: parseInt(form.children) || 0,
      });
      Alert.alert('Success', 'Booking created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.message || 'Failed to create booking';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="New Booking" onBack={() => navigation.goBack()} color={C.primary} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <Field label="First Name" value={form.first_name} onChangeText={v => set('first_name', v)} placeholder="John" required />
          <Field label="Last Name" value={form.last_name} onChangeText={v => set('last_name', v)} placeholder="Doe" required />
          <Field label="Email" value={form.email} onChangeText={v => set('email', v)} placeholder="john@email.com" keyboardType="email-address" />
          <Field label="Phone" value={form.phone} onChangeText={v => set('phone', v)} placeholder="+1 234 567 8900" keyboardType="phone-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <Field label="Room Number" value={form.room_number} onChangeText={v => set('room_number', v)} placeholder="101" required />
          <Field label="Check-In Date" value={form.check_in_date} onChangeText={v => set('check_in_date', v)} placeholder="YYYY-MM-DD" required />
          <Field label="Check-Out Date" value={form.check_out_date} onChangeText={v => set('check_out_date', v)} placeholder="YYYY-MM-DD" required />
          <View style={styles.row}>
            <View style={styles.half}>
              <Field label="Adults" value={form.adults} onChangeText={v => set('adults', v)} placeholder="1" keyboardType="number-pad" />
            </View>
            <View style={styles.half}>
              <Field label="Children" value={form.children} onChangeText={v => set('children', v)} placeholder="0" keyboardType="number-pad" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
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
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Create Booking</Text>
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
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.primary, marginBottom: 12 },
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
  submitBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: C.white, fontSize: 15, fontWeight: '700' },
});
