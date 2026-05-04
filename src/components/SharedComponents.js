// src/components/SharedComponents.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';

export const C = {
  primary: '#1a3c2e', gold: '#c9a96e', bg: '#f4f1eb',
  white: '#ffffff', gray: '#6b7280', lightBg: '#fffef9',
  border: '#e5e0d5', danger: '#dc2626', success: '#065f46',
  blue: '#0284c7', purple: '#7c3aed',
};

export function ScreenHeader({ title, subtitle, color = C.primary, onBack, right }) {
  return (
    <View style={[hStyles.header, { backgroundColor: color }]}>
      <View style={hStyles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={hStyles.backBtn}>
            <Text style={hStyles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <View>
          {subtitle ? <Text style={hStyles.subtitle}>{subtitle}</Text> : null}
          <Text style={hStyles.title}>{title}</Text>
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

const hStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
});

export function Card({ children, style }) {
  return <View style={[cStyles.card, style]}>{children}</View>;
}
const cStyles = StyleSheet.create({
  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    marginBottom: 12,
  },
});

export function StatusBadge({ label, color, bg }) {
  return (
    <View style={[bStyles.badge, { backgroundColor: bg || color + '20' }]}>
      <Text style={[bStyles.text, { color }]}>{label}</Text>
    </View>
  );
}
const bStyles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: '700' },
});

export function SearchBar({ value, onChangeText, placeholder = 'Search…' }) {
  return (
    <View style={sStyles.container}>
      <Text style={sStyles.icon}>🔍</Text>
      <TextInput
        style={sStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.gray}
      />
    </View>
  );
}
const sStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    margin: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  icon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#1e293b' },
});

export function EmptyState({ icon = '📭', message = 'No data found' }) {
  return (
    <View style={eStyles.container}>
      <Text style={eStyles.icon}>{icon}</Text>
      <Text style={eStyles.text}>{message}</Text>
    </View>
  );
}
const eStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48 },
  icon: { fontSize: 40, marginBottom: 12 },
  text: { fontSize: 14, color: C.gray },
});

export function LoadingView({ color = C.gold }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 80 }}>
      <ActivityIndicator size="large" color={color} />
      <Text style={{ color: C.gray, marginTop: 12 }}>Loading…</Text>
    </View>
  );
}

export function SectionHeader({ title }) {
  return <Text style={shStyles.title}>{title}</Text>;
}
const shStyles = StyleSheet.create({
  title: {
    fontSize: 10, fontWeight: '700', color: C.gray,
    letterSpacing: 2, paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },
});
