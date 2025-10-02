import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logout } from './logout.js';

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const navigation = useNavigation();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch('http://localhost:3000/tickets', { credentials: 'include' });
    if (!res.ok) {
      const e = await res.json().catch(() => ({ error: 'Error' }));
      Alert.alert('Error', e.error || 'Error al cargar tickets');
      return;
    }
    setTickets(await res.json());
  }

  function openModal(ticket) {
    setModalOpen(true);
    if (ticket) {
      setEditing(ticket._id);
      setForm({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'medium'
      });
    } else {
      setEditing(null);
      setForm({ title: '', description: '', priority: 'medium' });
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ title: '', description: '', priority: 'medium' });
  }

  async function handleSubmit() {
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority
    };
    let resp;
    if (editing) {
      resp = await fetch(`http://localhost:3000/tickets/${editing}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      resp = await fetch('http://localhost:3000/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    const j = await resp.json().catch(() => ({ error: 'Error' }));
    if (resp.ok) {
      Alert.alert('Éxito', 'Guardado correctamente');
      closeModal();
      load();
    } else {
      Alert.alert('Error', j.error || 'Error al guardar');
    }
  }

  async function handleDelete(id) {
    Alert.alert('Confirmar', '¿Eliminar ticket?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          const resp = await fetch(`http://localhost:3000/tickets/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const j = await resp.json().catch(() => ({ error: 'Error' }));
          if (resp.ok) {
            Alert.alert('Eliminado', j.message || 'Eliminado');
            load();
          } else {
            Alert.alert('Error', j.error || 'No se pudo eliminar');
          }
        }
      }
    ]);
  }

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticketrik</Text>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.link}>Dashboard</Text>
          </TouchableOpacity>
          <Button title="Cerrar sesión" onPress={handleLogout} />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Tickets</Text>
      <View style={styles.btnBox}>
        <Button title="Nuevo ticket" onPress={() => openModal()} />
      </View>
      <FlatList
        data={tickets}
        keyExtractor={t => t._id}
        ListEmptyComponent={<Text>No hay tickets.</Text>}
        renderItem={({ item: t }) => {
          const creator = (t.createdBy && t.createdBy.name) ? escapeHtml(t.createdBy.name) : (t.createdBy || 'n/a');
          return (
            <View style={styles.ticketItem}>
              <Text style={styles.ticketTitle}>{escapeHtml(t.title)}</Text>
              <Text>{escapeHtml(t.description).slice(0, 150)}{t.description && t.description.length > 150 ? '...' : ''}</Text>
              <Text>
                <Text style={styles.bold}>Prioridad:</Text> {t.priority} | <Text style={styles.bold}>Creado por:</Text> {creator}
              </Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => openModal(t)}>
                  <Text style={styles.actionLink}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(t._id)}>
                  <Text style={styles.actionLink}>Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('TicketDetail', { id: t._id })}>
                  <Text style={styles.actionLink}>Ver</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Modal para crear/editar ticket */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Editar ticket' : 'Crear ticket'}</Text>
            <Text>Título:</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={text => setForm({ ...form, title: text })}
              placeholder="Título"
            />
            <Text>Descripción:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.description}
              onChangeText={text => setForm({ ...form, description: text })}
              placeholder="Descripción"
              multiline
            />
            <Text>Prioridad:</Text>
            <View style={styles.priorityRow}>
              {['low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    form.priority === p && styles.prioritySelected
                  ]}
                  onPress={() => setForm({ ...form, priority: p })}
                >
                  <Text>{p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button title="Guardar" onPress={handleSubmit} />
              <Button title="Cancelar" color="#888" onPress={closeModal} />
            </View>
            {editing && (
              <View style={{ marginTop: 20 }}>
                <Button
                  title="Eliminar Ticket"
                  color="#e74c3c"
                  onPress={() => handleDelete(editing)}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  link: { color: 'blue', marginRight: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  btnBox: { marginBottom: 12 },
  ticketItem: { marginBottom: 12, padding: 10, backgroundColor: '#e9e9e9', borderRadius: 6 },
  ticketTitle: { fontWeight: 'bold', fontSize: 16 },
  bold: { fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', marginTop: 8, gap: 12 },
  actionLink: { color: 'blue', marginRight: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modal: { width: '90%', backgroundColor: '#fff', borderRadius: 8, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 10 },
  textarea: { height: 80, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priorityBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginHorizontal: 4 },
  prioritySelected: { backgroundColor: '#d0eaff', borderColor: '#007aff' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});