import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logout } from './logout.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('http://localhost:3000/dashboard/data', { credentials: 'include' });
        if (!res.ok) {
          setError('Error: No autenticado');
          setData(null);
          return;
        }
        const json = await res.json();
        setData(json);
        setError('');
      } catch {
        setError('Error de conexión');
        setData(null);
      }
    }
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticketrik</Text>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.navigate('Tickets')}>
            <Text style={styles.link}>Ver reportes</Text>
          </TouchableOpacity>
          <Button title="Cerrar sesión" onPress={handleLogout} />
        </View>
      </View>

      <View style={styles.dashboardBox}>
        <Text style={styles.welcome}>
          {error
            ? error
            : data
            ? `Bienvenido ${data.username} 👋`
            : 'Cargando...'}
        </Text>
        {data && !error && (
          <>
            <Text>Tienes {Array.isArray(data.tickets) ? data.tickets.length : 0} reportes registrados.</Text>
            <Text>Usuario: {data.username} | Email: {data.email}</Text>
          </>
        )}
      </View>

      <View style={styles.ticketsBox}>
        <Text style={styles.sectionTitle}>Mis Reportes</Text>
        <FlatList
          data={data && Array.isArray(data.tickets) ? data.tickets : []}
          keyExtractor={(_, idx) => idx.toString()}
          ListEmptyComponent={
            <Text>
              {error
                ? 'Error al cargar los tickets.'
                : 'No tienes tickets registrados.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.ticketItem}>
              <Text style={styles.ticketTitle}>{item.title || 'Sin título'}</Text>
              <Text>Descripción: {item.description || 'Sin descripción'}</Text>
              <Text>
                Prioridad: <Text style={styles[`priority_${item.priority || 'low'}`]}>{item.priority || 'low'}</Text>
              </Text>
              <Text>
                Creado por: {item.createdBy && item.createdBy.name ? item.createdBy.name : data.username}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.sectionTitle}>Información</Text>
        <Text>
          Aquí puedes ver todos tus tickets registrados, su prioridad y quién los creó.{"\n"}
          Si tienes dudas, contacta al soporte técnico.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  link: { color: 'blue', marginRight: 16 },
  dashboardBox: { marginBottom: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 },
  welcome: { fontSize: 18, fontWeight: 'bold' },
  ticketsBox: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  ticketItem: { marginBottom: 12, padding: 10, backgroundColor: '#e9e9e9', borderRadius: 6 },
  ticketTitle: { fontWeight: 'bold', fontSize: 16 },
  priority_low: { color: 'green' },
  priority_medium: { color: 'orange' },
  priority_high: { color: 'red' },
  infoBox: { padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8 },
});