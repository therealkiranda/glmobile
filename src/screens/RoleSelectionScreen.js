// src/screens/RoleSelectionScreen.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const ROLE_CONFIG = {
  admin: {
    icon: '⚙️', label: 'Admin Panel',
    desc: 'Full hotel management & settings',
    screen: 'AdminDashboard',
  },
  hr: {
    icon: '👥', label: 'HR Management',
    desc: 'Staff, payroll & leave management',
    screen: 'HRDashboard',
  },
  reception: {
    icon: '🏨', label: 'Reception',
    desc: 'Check-in, check-out & bookings',
    screen: 'ReceptionDashboard',
  },
};

export default function RoleSelectionScreen({ navigation }) {
  const { user, logout, hotelInfo, theme } = useContext(AuthContext);

  const primary = theme?.primary_color || '#1a3c2e';
  const gold    = theme?.secondary_color || '#c9a96e';
  const bg      = theme?.background_color || '#f4f1eb';

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || user.email
    : 'Staff';

  const getAvailableRoles = () => {
    if (!user) return [];
    const r = user.role || '';
    const roles = [];
    if (['super_admin', 'admin'].includes(r)) roles.push('admin');
    if (['super_admin', 'admin', 'hr_manager'].includes(r)) roles.push('hr');
    if (['super_admin', 'admin', 'receptionist', 'front_desk'].includes(r)) roles.push('reception');
    if (roles.length === 0) roles.push('admin', 'hr', 'reception');
    return roles;
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const availableRoles = getAvailableRoles();

  if (availableRoles.length === 1) {
    const cfg = ROLE_CONFIG[availableRoles[0]];
    if (cfg) {
      navigation.replace(cfg.screen);
      return null;
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={bg} />

      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: primary }]}>
          <Text style={[styles.avatarText, { color: gold }]}>
            {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') || '?'}
          </Text>
        </View>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={[styles.name, { color: primary }]}>{displayName}</Text>
        <View style={[styles.roleBadge, { backgroundColor: gold + '25' }]}>
          <Text style={[styles.roleBadgeText, { color: gold }]}>{(user?.role || 'staff').replace(/_/g, ' ').toUpperCase()}</Text>
        </View>
        {hotelInfo?.name ? (
          <Text style={[styles.hotelName, { color: primary }]}>{hotelInfo.name}</Text>
        ) : null}
      </View>

      <Text style={[styles.sectionLabel, { color: primary }]}>SELECT YOUR WORKSPACE</Text>

      {availableRoles.map(role => {
        const cfg = ROLE_CONFIG[role];
        if (!cfg) return null;
        return (
          <TouchableOpacity
            key={role}
            style={styles.roleCard}
            onPress={() => navigation.replace(cfg.screen)}
            activeOpacity={0.85}
          >
            <View style={[styles.roleIcon, { backgroundColor: primary + '15' }]}>
              <Text style={styles.roleEmoji}>{cfg.icon}</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={[styles.roleLabel, { color: primary }]}>{cfg.label}</Text>
              <Text style={styles.roleDesc}>{cfg.desc}</Text>
            </View>
            <Text style={[styles.arrow, { color: primary }]}>›</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  avatarText: { fontSize: 24, fontWeight: '700' },
  welcome: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  roleBadge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 6 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  hotelName: { fontSize: 12, fontWeight: '600', marginTop: 4, opacity: 0.7 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 2, marginBottom: 16,
  },
  roleCard: {
    backgroundColor: '#fff',
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
  roleLabel: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  roleDesc: { fontSize: 12, color: '#6b7280' },
  arrow: { fontSize: 28, fontWeight: '300', marginLeft: 8 },
  logoutBtn: {
    marginTop: 24, alignItems: 'center',
    padding: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
});
