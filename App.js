// App.js — Hotel Staff App
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

import LoginScreen           from './src/screens/LoginScreen';
import RoleSelectionScreen   from './src/screens/RoleSelectionScreen';
import AdminDashboard        from './src/screens/AdminDashboard';
import HRDashboard           from './src/screens/HRDashboard';
import ReceptionDashboard    from './src/screens/ReceptionDashboard';

import BookingsScreen        from './src/screens/admin/BookingsScreen';
import RoomsScreen           from './src/screens/admin/RoomsScreen';
import CustomersScreen       from './src/screens/admin/CustomersScreen';
import StaffScreen           from './src/screens/admin/StaffScreen';
import PaymentsScreen        from './src/screens/admin/PaymentsScreen';
import ReportsScreen         from './src/screens/admin/ReportsScreen';
import SettingsScreen        from './src/screens/admin/SettingsScreen';

import EmployeesScreen       from './src/screens/hr/EmployeesScreen';
import DepartmentsScreen     from './src/screens/hr/DepartmentsScreen';
import LeaveScreen           from './src/screens/hr/LeaveScreen';
import PayrollScreen         from './src/screens/hr/PayrollScreen';
import AttendanceScreen      from './src/screens/hr/AttendanceScreen';

import NewBookingScreen      from './src/screens/reception/NewBookingScreen';
import CheckInScreen         from './src/screens/reception/CheckInScreen';
import CheckOutScreen        from './src/screens/reception/CheckOutScreen';
import RoomGridScreen        from './src/screens/reception/RoomGridScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading, theme } = useContext(AuthContext);
  const primary = theme?.primary_color || '#1a3c2e';
  const gold    = theme?.secondary_color || '#c9a96e';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: primary }}>
        <ActivityIndicator size="large" color={gold} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'RoleSelection' : 'Login'}
      screenOptions={{ headerShown: false, animationEnabled: true }}
    >
      <Stack.Screen name="Login"               component={LoginScreen} />
      <Stack.Screen name="RoleSelection"       component={RoleSelectionScreen} />

      <Stack.Screen name="AdminDashboard"      component={AdminDashboard} />
      <Stack.Screen name="AdminBookings"       component={BookingsScreen} />
      <Stack.Screen name="AdminRooms"          component={RoomsScreen} />
      <Stack.Screen name="AdminCustomers"      component={CustomersScreen} />
      <Stack.Screen name="AdminStaff"          component={StaffScreen} />
      <Stack.Screen name="AdminPayments"       component={PaymentsScreen} />
      <Stack.Screen name="AdminReports"        component={ReportsScreen} />
      <Stack.Screen name="AdminSettings"       component={SettingsScreen} />

      <Stack.Screen name="HRDashboard"         component={HRDashboard} />
      <Stack.Screen name="HREmployees"         component={EmployeesScreen} />
      <Stack.Screen name="HRDepartments"       component={DepartmentsScreen} />
      <Stack.Screen name="HRLeave"             component={LeaveScreen} />
      <Stack.Screen name="HRPayroll"           component={PayrollScreen} />
      <Stack.Screen name="HRAttendance"        component={AttendanceScreen} />

      <Stack.Screen name="ReceptionDashboard"  component={ReceptionDashboard} />
      <Stack.Screen name="ReceptionNewBooking" component={NewBookingScreen} />
      <Stack.Screen name="ReceptionCheckIn"    component={CheckInScreen} />
      <Stack.Screen name="ReceptionCheckOut"   component={CheckOutScreen} />
      <Stack.Screen name="ReceptionRoomGrid"   component={RoomGridScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
