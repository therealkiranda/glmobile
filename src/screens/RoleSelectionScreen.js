// src/screens/RoleSelectionScreen.js
// Fixed: user.name → user.first_name + user.last_name, role logic
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const C = {
  primary: '#1a3c2e', gold: '#c9a96e', bg: '#f4f1eb',
  white: '#ffffff', gray: '#6b7280', lightBg: '#fffef9',
};

const ROLE_CONFIG = {
  admin: {
    icon: '⚙️', label: 'Admin Panel',
    desc: 'Full hotel management & settings',
    color: '#1a3c2e', screen: 'AdminDashboard',
  },
  hr: {
    icon: '👥', label: 'HR Management',
    desc: 'Staff, payroll & leave management',
    color: '#0284c7', screen: 'HRDashboard',
  },
  reception: {
    icon: '🏨', label: 'Reception',
    desc: 'Check-in, check-out & bookings',
    color: '#7c3aed', screen: 'ReceptionDashboard',
  },
};

export default function RoleSelectionScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  // Fixed: use first_name/last_name instead of name
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'Staff';

  const getAvailableRoles = () => {
    if (!user) return [];
    const r = user.role || '';
    const roles = [];
    if (['super_admin', 'admin'].includes(r)) roles.push('admin');
    if (['super_admin', 'admin', 'hr_manager'].includes(r)) roles.push('hr');
    if (['super_admin', 'admin', 'receptionist', 'front_desk'].includes(r)) roles.push('reception');
    // If no specific role matched, show all (super_admin fallback)
    if (roles.length === 0) roles.push('admin', 'hr', 'reception');
    return roles;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Welcome header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') || '?'}
          </Text>
        </View>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{(user?.role || 'staff').replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>SELECT YOUR WORKSPACE</Text>

      {getAvailableRoles().map(role => {
        const cfg = ROLE_CONFIG[role];
        return (
          <TouchableOpacity
            key={role}
            style={styles.roleCard}
            onPress={() => navigation.replace(cfg.screen)}
            activeOpacity={0.85}
          >
            <View style={[styles.roleIcon, { backgroundColor: cfg.color + '15' }]}>
              <Text style={styles.roleEmoji}>{cfg.icon}</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>{cfg.label}</Text>
              <Text style={styles.roleDesc}>{cfg.desc}</Text>
            </View>
            <Text style={[styles.arrow, { color: cfg.color }]}>›</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: C.gold },
  welcome: { fontSize: 14, color: C.gray, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '700', color: C.primary, marginBottom: 8 },
  roleBadge: {
    backgroundColor: C.gold + '25', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 1.5 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.gray,
    letterSpacing: 2, marginBottom: 16,
  },

  roleCard: {
    backgroundColor: C.white,
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  roleIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  roleEmoji: { fontSize: 24 },
  roleInfo: { flex: 1 },
  roleLabel: { fontSize: 16, fontWeight: '700', color: C.primary, marginBottom: 3 },
  roleDesc: { fontSize: 12, color: C.gray },
  arrow: { fontSize: 28, fontWeight: '300', marginLeft: 8 },

  logoutBtn: {
    marginTop: 24, alignItems: 'center',
    padding: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
});
