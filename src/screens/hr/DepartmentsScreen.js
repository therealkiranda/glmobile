// src/screens/hr/DepartmentsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { C, ScreenHeader, Card, EmptyState, LoadingView } from '../../components/SharedComponents';

const DEPT_ICONS = {
  'Front Desk': '🏨', 'Housekeeping': '🧹', 'F&B': '🍽', 'Maintenance': '🔧',
  'HR': '👥', 'Management': '💼', 'Security': '🔒', 'Finance': '💰',
};

function DepartmentCard({ dept }) {
  const icon = DEPT_ICONS[dept.name] || '🏢';
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{dept.name}</Text>
          {dept.head_name && <Text style={styles.head}>Head: {dept.head_name}</Text>}
        </View>
        <View style={styles.countBox}>
          <Text style={styles.count}>{dept.employee_count || dept.staff_count || 0}</Text>
          <Text style={styles.countLabel}>Staff</Text>
        </View>
      </View>
    </Card>
  );
}

export default function DepartmentsScreen({ navigation }) {
  const { api } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDepts = async () => {
    try {
      const res = await api.get('/hr/departments');
      setDepartments(res.data?.departments || res.data || []);
    } catch (e) {
      console.error('Departments error:', e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDepts(); }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Departments" subtitle={`${departments.length} departments`} onBack={() => navigation.goBack()} color={C.blue} />
      {loading ? <LoadingView color={C.blue} /> : (
        <FlatList
          data={departments}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <DepartmentCard dept={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="🏢" message="No departments found" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDepts(); }} tintColor={C.blue} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.blue + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  head: { fontSize: 12, color: C.gray, marginTop: 3 },
  countBox: { alignItems: 'center' },
  count: { fontSize: 22, fontWeight: '800', color: C.blue },
  countLabel: { fontSize: 10, color: C.gray },
});
