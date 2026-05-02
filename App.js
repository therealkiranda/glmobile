// App.js — Grand Lumière Hotel Staff App
import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen          from './src/screens/LoginScreen';
import RoleSelectionScreen  from './src/screens/RoleSelectionScreen';
import AdminDashboard       from './src/screens/AdminDashboard';
import HRDashboard          from './src/screens/HRDashboard';
import ReceptionDashboard   from './src/screens/ReceptionDashboard';

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
      <Stack.Screen name="Login"             component={LoginScreen} />
      <Stack.Screen name="RoleSelection"     component={RoleSelectionScreen} />
      <Stack.Screen name="AdminDashboard"    component={AdminDashboard} />
      <Stack.Screen name="HRDashboard"       component={HRDashboard} />
      <Stack.Screen name="ReceptionDashboard" component={ReceptionDashboard} />
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
