import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import HRDashboard from './src/screens/HRDashboard';
import ReceptionDashboard from './src/screens/ReceptionDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: 'Select Role' }} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Dashboard' }} />
          <Stack.Screen name="HRDashboard" component={HRDashboard} options={{ title: 'HR Dashboard' }} />
          <Stack.Screen name="ReceptionDashboard" component={ReceptionDashboard} options={{ title: 'Reception Dashboard' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
