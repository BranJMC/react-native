import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { logout } from './logout';

const windowWidth = Dimensions.get('window').width;

export default function Dashboard({ onVerTickets, onSalir }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

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
    if (onSalir) onSalir();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎫 Ticketrik</Text>
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navBtn} onPress={onVerTickets}>
            <Text style={styles.navBtnText}>Ver reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Cerrar sesión</Text>
          </TouchableOpacity>
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
            <Text style={styles.infoText}>
              Tienes <Text style={styles.infoNumber}>{Array.isArray(data.tickets) ? data.tickets.length : 0}</Text> reportes registrados.
            </Text>
            <Text style={styles.userInfo}>Usuario: <Text style={styles.userHighlight}>{data.username}</Text></Text>
            <Text style={styles.userInfo}>Email: <Text style={styles.userHighlight}>{data.email}</Text></Text>
            <Text style={styles.sectionTitle}>Tus reportes:</Text>
            {Array.isArray(data.tickets) && data.tickets.length > 0 ? (
              data.tickets.map((t, idx) => (
                <View key={t._id || idx} style={styles.ticketItem}>
                  <Text style={styles.ticketTitle}>{t.title}</Text>
                  <Text style={styles.ticketDetails}>
                    <Text style={styles.ticketLabel}>Prioridad:</Text> {t.priority}{"   "}
                    <Text style={styles.ticketLabel}>Estado:</Text> {t.status}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noTickets}>No tienes reportes registrados.</Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#f6f8fa',
    minHeight: '100%',
    alignItems: 'center'
  },
  header: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 10,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  navBtn: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  navBtnText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  dashboardBox: {
    width: 360,
    alignSelf: 'center',
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
    textAlign: 'center'
  },
  infoNumber: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 18
  },
  userInfo: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
    textAlign: 'center'
  },
  userHighlight: {
    color: '#007AFF',
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    color: '#222',
    textAlign: 'center'
  },
  ticketItem: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  ticketTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2
  },
  ticketDetails: {
    fontSize: 14,
    color: '#444'
  },
  ticketLabel: {
    fontWeight: 'bold',
    color: '#007AFF'
  },
  noTickets: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8
  }
});