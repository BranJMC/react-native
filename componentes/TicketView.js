import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { logout } from './logout';

const windowWidth = Dimensions.get('window').width;

function escapeHtml(s) {
  return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

export default function TicketView({ ticketId, onVolverLista, onSalir }) {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/tickets/${ticketId}`, { credentials: 'include' });
        if (!res.ok) {
          const e = await res.json().catch(() => ({ error: 'Error' }));
          setError(e.error || 'No se pudo cargar');
          setTicket(null);
          setLoading(false);
          return;
        }
        const t = await res.json();
        setTicket(t);
        setError('');
      } catch {
        setError('Error de conexión');
        setTicket(null);
      }
      setLoading(false);
    }
    if (ticketId) load();
  }, [ticketId]);

  const handleDelete = async () => {
    Alert.alert('Confirmar', '¿Eliminar ticket?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          const resp = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const j = await resp.json().catch(() => ({ error: 'Error' }));
          if (resp.ok) {
            Alert.alert('Eliminado', j.message || 'Eliminado');
            if (onVolverLista) onVolverLista();
          } else {
            Alert.alert('Error', j.error || 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  const handleLogout = async () => {
    await logout();
    if (onSalir) onSalir();
  };

  if (!ticketId) return <View style={styles.center}><Text>Ticket ID requerido</Text></View>;
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Cargando...</Text></View>;
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;
  if (!ticket) return <View style={styles.center}><Text>No se encontró el ticket</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎫 Ticketrik</Text>
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navBtn} onPress={onVolverLista}>
            <Text style={styles.navBtnText}>Volver a lista</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.ticketBox}>
        <Text style={styles.ticketTitle}>{ticket.title}</Text>
        <Text style={styles.ticketDetails}>
          <Text style={styles.ticketLabel}>Estado:</Text> {ticket.status}{"   "}
          <Text style={styles.ticketLabel}>Prioridad:</Text> {ticket.priority}
        </Text>
        <Text style={styles.ticketDetails}>
          <Text style={styles.ticketLabel}>Creado:</Text> {new Date(ticket.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.ticketDetails}>
          <Text style={styles.ticketLabel}>Por:</Text> {ticket.createdBy && ticket.createdBy.name ? escapeHtml(ticket.createdBy.name) : (ticket.createdBy || '')}
        </Text>
        <Text style={styles.description}>{ticket.description}</Text>
        <Text style={styles.sectionTitle}>Comentarios</Text>
        {(ticket.comments || []).length === 0 ? (
          <Text style={styles.noTickets}>No hay comentarios.</Text>
        ) : (
          (ticket.comments || []).map((c, idx) => {
            const author = c.author && c.author.name ? c.author.name : (c.author || '');
            return (
              <View key={idx} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>{escapeHtml(author)}</Text>
                <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</Text>
                <Text>{escapeHtml(c.message)}</Text>
              </View>
            );
          })
        )}
        <View style={{ marginTop: 20 }}>
          <Button title="Eliminar ticket" color="#e74c3c" onPress={handleDelete} />
        </View>
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
  ticketBox: {
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
  ticketTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
    marginBottom: 6,
    textAlign: 'center'
  },
  ticketDetails: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
    textAlign: 'center'
  },
  ticketLabel: {
    fontWeight: 'bold',
    color: '#007AFF'
  },
  description: {
    marginVertical: 12,
    fontSize: 15,
    color: '#333',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    color: '#222',
    textAlign: 'center'
  },
  commentItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#007AFF'
  },
  commentDate: {
    fontSize: 12,
    color: '#888'
  },
  noTickets: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});