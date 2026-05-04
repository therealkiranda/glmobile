// App.js — Grand Lumière Hotel Staff App

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Core screens
import LoginScreen            from './src/screens/LoginScreen';
import RoleSelectionScreen    from './src/screens/RoleSelectionScreen';
import AdminDashboard         from './src/screens/AdminDashboard';
import HRDashboard            from './src/screens/HRDashboard';
import ReceptionDashboard     from './src/screens/ReceptionDashboard';

// Admin sub-screens
import BookingsScreen         from './src/screens/admin/BookingsScreen';
import RoomsScreen            from './src/screens/admin/RoomsScreen';
import CustomersScreen        from './src/screens/admin/CustomersScreen';
import StaffScreen            from './src/screens/admin/StaffScreen';
import PaymentsScreen         from './src/screens/admin/PaymentsScreen';
import ReportsScreen          from './src/screens/admin/ReportsScreen';
import SettingsScreen         from './src/screens/admin/SettingsScreen';

// HR sub-screens
import EmployeesScreen        from './src/screens/hr/EmployeesScreen';
import DepartmentsScreen      from './src/screens/hr/DepartmentsScreen';
import LeaveScreen            from './src/screens/hr/LeaveScreen';
import PayrollScreen          from './src/screens/hr/PayrollScreen';
import AttendanceScreen       from './src/screens/hr/AttendanceScreen';

// Reception sub-screens
import NewBookingScreen       from './src/screens/reception/NewBookingScreen';
import CheckInScreen          from './src/screens/reception/CheckInScreen';
import CheckOutScreen         from './src/screens/reception/CheckOutScreen';
import RoomGridScreen         from './src/screens/reception/RoomGridScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a3c2e' }}>
        <ActivityIndicator size="large" color="#c9a96e" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'RoleSelection' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      {/* Auth */}
      <Stack.Screen name="Login"               component={LoginScreen} />
      <Stack.Screen name="RoleSelection"       component={RoleSelectionScreen} />

      {/* Admin */}
      <Stack.Screen name="AdminDashboard"      component={AdminDashboard} />
      <Stack.Screen name="AdminBookings"       component={BookingsScreen} />
      <Stack.Screen name="AdminRooms"          component={RoomsScreen} />
      <Stack.Screen name="AdminCustomers"      component={CustomersScreen} />
      <Stack.Screen name="AdminStaff"          component={StaffScreen} />
      <Stack.Screen name="AdminPayments"       component={PaymentsScreen} />
      <Stack.Screen name="AdminReports"        component={ReportsScreen} />
      <Stack.Screen name="AdminSettings"       component={SettingsScreen} />

      {/* HR */}
      <Stack.Screen name="HRDashboard"         component={HRDashboard} />
      <Stack.Screen name="HREmployees"         component={EmployeesScreen} />
      <Stack.Screen name="HRDepartments"       component={DepartmentsScreen} />
      <Stack.Screen name="HRLeave"             component={LeaveScreen} />
      <Stack.Screen name="HRPayroll"           component={PayrollScreen} />
      <Stack.Screen name="HRAttendance"        component={AttendanceScreen} />

      {/* Reception */}
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
