// src/screens/LoginScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { AuthContext, api } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [primary, setPrimary]     = useState('#1a3c2e');
  const [gold, setGold]           = useState('#c9a96e');
  const [initials, setInitials]   = useState('H');
  const { login } = useContext(AuthContext);

  useEffect(() => {
    api.get('/public/settings').then(res => {
      const h = res.data?.hotel || res.data;
      const t = res.data?.theme || {};
      if (h?.name) {
        setHotelName(h.name);
        const words = h.name.trim().split(/\s+/);
        setInitials(words.length >= 2
          ? (words[0][0] + words[1][0]).toUpperCase()
          : h.name.slice(0, 2).toUpperCase());
      }
      if (t?.primary_color) setPrimary(t.primary_color);
      if (t?.secondary_color) setGold(t.secondary_color);
    }).catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.success) {
      navigation.replace('RoleSelection');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={primary} />

      <View style={styles.brandSection}>
        <View style={[styles.logoCircle, { backgroundColor: gold }]}>
          <Text style={[styles.logoText, { color: primary }]}>{initials}</Text>
        </View>
        <Text style={styles.hotelName}>{hotelName || 'Hotel'}</Text>
        <View style={[styles.divider, { backgroundColor: gold }]} />
        <Text style={styles.panelLabel}>Staff Portal</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: primary }]}>Sign In</Text>
        <Text style={styles.cardSub}>Access your hotel management panel</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: primary }]}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="staff@hotel.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: primary }]}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
              <Text style={styles.eyeText}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: gold }, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={primary} />
            : <Text style={[styles.loginBtnText, { color: primary }]}>SIGN IN</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          For staff use only{hotelName ? ` · ${hotelName}` : ''}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  brandSection: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingBottom: 20,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  logoText: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  hotelName: {
    fontSize: 26, fontWeight: '700', color: '#fff',
    letterSpacing: 1, marginBottom: 4, textAlign: 'center', paddingHorizontal: 20,
  },
  divider: { width: 40, height: 1, marginVertical: 16, opacity: 0.6 },
  panelLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fffef9',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 32, paddingBottom: 48,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#6b7280', marginBottom: 28 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#e5e0d5',
    borderRadius: 10, padding: 14,
    fontSize: 15, color: '#1a1a1a',
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 12 },
  eyeText: { fontSize: 18 },
  loginBtn: {
    borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  footerNote: {
    textAlign: 'center', color: '#6b7280',
    fontSize: 11, marginTop: 24, letterSpacing: 0.5,
  },
});
