// src/screens/LoginScreen.js — Grand Lumière branded login
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  StatusBar, Dimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const C = {
  primary:  '#1a3c2e',
  gold:     '#c9a96e',
  goldDark: '#a07a45',
  bg:       '#f4f1eb',
  white:    '#ffffff',
  gray:     '#6b7280',
  lightBg:  '#fffef9',
  border:   '#e5e0d5',
  error:    '#dc2626',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useContext(AuthContext);

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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Top brand section */}
      <View style={styles.brandSection}>
        {/* Hotel icon — using text-based logo */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>GL</Text>
        </View>
        <Text style={styles.hotelName}>Grand Lumière</Text>
        <Text style={styles.hotelSub}>HOTEL & SUITES</Text>
        <View style={styles.divider} />
        <Text style={styles.panelLabel}>Staff Portal</Text>
      </View>

      {/* Login card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>
        <Text style={styles.cardSub}>Access your hotel management panel</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@grandlumiere.com"
            placeholderTextColor={C.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor={C.gray}
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
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.primary} />
            : <Text style={styles.loginBtnText}>SIGN IN</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          For staff use only · Grand Lumière Hotel
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.primary },

  brandSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  logoText: {
    fontSize: 28, fontWeight: '800', color: C.white, letterSpacing: 2,
  },
  hotelName: {
    fontSize: 26, fontWeight: '700', color: C.white,
    letterSpacing: 1, marginBottom: 4,
  },
  hotelSub: {
    fontSize: 10, color: C.gold, letterSpacing: 5,
    fontWeight: '500',
  },
  divider: {
    width: 40, height: 1, backgroundColor: C.gold,
    marginVertical: 16, opacity: 0.6,
  },
  panelLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3, textTransform: 'uppercase',
  },

  card: {
    backgroundColor: C.lightBg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 32, paddingBottom: 48,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  cardTitle: {
    fontSize: 22, fontWeight: '700', color: C.primary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13, color: C.gray, marginBottom: 28,
  },

  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 10, fontWeight: '700', color: C.primary,
    letterSpacing: 1.5, marginBottom: 8,
  },
  input: {
    backgroundColor: C.white,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10, padding: 14,
    fontSize: 15, color: '#1a1a1a',
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: 'absolute', right: 14, top: 12,
  },
  eyeText: { fontSize: 18 },

  loginBtn: {
    backgroundColor: C.gold,
    borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: C.primary, fontSize: 14,
    fontWeight: '800', letterSpacing: 2,
  },

  footerNote: {
    textAlign: 'center', color: C.gray,
    fontSize: 11, marginTop: 24, letterSpacing: 0.5,
  },
});
