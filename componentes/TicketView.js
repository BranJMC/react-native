import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { logout } from './logout.js';

function escapeHtml(s) {
  return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

// Recibe ticketId y funciones de navegación como props
export default function TicketView({ ticketId, onVolverLista, onSalir }) {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
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
        setStatus(t.status || 'open');
        setAssignedTo(t.assignedTo || '');
        setError('');
      } catch {
        setError('Error de conexión');
        setTicket(null);
      }
      setLoading(false);
    }
    if (ticketId) load();
  }, [ticketId]);

  const handleComment = async () => {
    if (!comment.trim()) return;
    const resp = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: comment })
    });
    const j = await resp.json().catch(() => ({ error: 'Error' }));
    if (resp.ok) {
      setComment('');
      const res = await fetch(`http://localhost:3000/tickets/${ticketId}`, { credentials: 'include' });
      setTicket(await res.json());
    } else {
      Alert.alert('Error', j.error || 'No se pudo agregar comentario');
    }
  };

  const handleAction = async () => {
    const resp = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignedTo: assignedTo || undefined })
    });
    const j = await resp.json().catch(() => ({ error: 'Error' }));
    if (resp.ok) {
      const res = await fetch(`http://localhost:3000/tickets/${ticketId}`, { credentials: 'include' });
      setTicket(await res.json());
    } else {
      Alert.alert('Error', j.error || 'No se pudo actualizar');
    }
  };

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
        <Text style={styles.title}>Ticketrik</Text>
        <View style={styles.nav}>
          <Button title="Volver a lista" onPress={onVolverLista} />
          <Button title="Cerrar sesión" onPress={handleLogout} />
        </View>
      </View>
      <Text style={styles.ticketTitle}>{ticket.title}</Text>
      <Text>
        Status: {ticket.status} | Prioridad: {ticket.priority} | Creado: {new Date(ticket.createdAt).toLocaleString()} | Por: {ticket.createdBy && ticket.createdBy.name ? escapeHtml(ticket.createdBy.name) : (ticket.createdBy || '')}
      </Text>
      <Text style={styles.description}>{ticket.description}</Text>

      <Text style={styles.sectionTitle}>Comentarios</Text>
      {(ticket.comments || []).length === 0 ? (
        <Text>No hay comentarios.</Text>
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

      <Text style={styles.sectionTitle}>Añadir comentario</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Escribe tu comentario"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title="Enviar comentario" onPress={handleComment} />

      <Text style={styles.sectionTitle}>Acciones (status / asignar)</Text>
      <View style={styles.formRow}>
        <Text>Status:</Text>
        <View style={styles.statusRow}>
          {['open', 'in_progress', 'resolved', 'closed'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, status === s && styles.statusSelected]}
              onPress={() => setStatus(s)}
            >
              <Text>{s.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formRow}>
        <Text>Asignar a (userId):</Text>
        <TextInput
          style={styles.input}
          placeholder="ObjectId del técnico (opcional)"
          value={assignedTo}
          onChangeText={setAssignedTo}
        />
      </View>
      <Button title="Actualizar" onPress={handleAction} />

      <View style={{ marginTop: 20 }}>
        <Button title="Eliminar ticket" color="#e74c3c" onPress={handleDelete} />
        <Button title="Volver a lista" onPress={onVolverLista} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  ticketTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  commentItem: { marginBottom: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6 },
  commentAuthor: { fontWeight: 'bold' },
  commentDate: { fontSize: 12, color: '#888' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 10 },
  textarea: { height: 60, textAlignVertical: 'top' },
  formRow: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statusBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 4 },
  statusSelected: { backgroundColor: '#d0eaff', borderColor: '#007aff' },
});