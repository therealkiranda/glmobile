import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function RoleSelectionScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleRoleSelect = (role) => {
    if (role === 'admin') navigation.replace('AdminDashboard');
    else if (role === 'hr') navigation.replace('HRDashboard');
    else if (role === 'reception') navigation.replace('ReceptionDashboard');
  };

  const getAvailableRoles = () => {
    const roles = [];
    if (['super_admin', 'admin'].includes(user.role)) roles.push('admin');
    if (user.role === 'hr_manager') roles.push('hr');
    if (user.role === 'receptionist') roles.push('reception');
    return roles;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.subtitle}>Select your role:</Text>
      {getAvailableRoles().map(role => (
        <TouchableOpacity key={role} style={styles.button} onPress={() => handleRoleSelect(role)}>
          <Text style={styles.buttonText}>
            {role === 'admin' ? 'Admin Panel' : role === 'hr' ? 'HR Management' : 'Reception'}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 16,
  },
});