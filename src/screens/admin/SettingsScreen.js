// src/screens/admin/SettingsScreen.js
import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card } from '../../components/SharedComponents';

function SettingRow({ icon, label, value, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, danger && { color: C.danger }]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'Admin';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      {/* Profile card */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{(user?.role || 'staff').replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow icon="👤" label="Full Name" value={displayName} />
          <SettingRow icon="✉️" label="Email" value={user?.email || '—'} />
          <SettingRow icon="🔑" label="Role" value={(user?.role || '—').replace('_', ' ')} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Hotel</Text>
          <SettingRow icon="🏨" label="Property" value="Grand Lumière" />
          <SettingRow icon="🌐" label="API" value="hotel.primelogic.com.np" />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Session</Text>
          <SettingRow
            icon="🚪"
            label="Sign Out"
            danger
            onPress={handleLogout}
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  profileBox: {
    backgroundColor: C.primary,
    alignItems: 'center', paddingBottom: 28, paddingTop: 8,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.gold + '30',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: C.gold },
  profileName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  roleBadge: {
    marginTop: 10, backgroundColor: C.gold + '25',
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 999,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.gray, marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  icon: { fontSize: 18, width: 30 },
  label: { flex: 1, fontSize: 14, color: '#1e293b', fontWeight: '500' },
  value: { fontSize: 13, color: C.gray, maxWidth: 160, textAlign: 'right' },
  arrow: { fontSize: 20, color: C.gray },
});
