import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';

const windowWidth = Dimensions.get('window').width;

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function TicketsList({ onVerTicket, onSalir, onVolverDashboard }) {
  const [tickets, setTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

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

  function openModal(ticket = null) {
    if (ticket) {
      setEditingId(ticket._id);
      setForm({
        title: ticket.title || '',
        description: ticket.description || '',
        priority: ticket.priority || 'medium'
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        priority: 'medium'
      });
    }
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      priority: 'medium'
    });
  }

  async function handleSave() {
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority
    };
    try {
      let resp;
      if (editingId) {
        resp = await fetch(`http://localhost:3000/tickets/${editingId}`, {
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
        Alert.alert('Guardado correctamente');
        closeModal();
        load();
      } else {
        Alert.alert(j.error || 'Error al guardar');
      }
    } catch (err) {
      Alert.alert('Error de conexión');
    }
  }

  async function handleDeleteFromModal() {
    Alert.alert('Confirmar', '¿Eliminar ticket?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          const resp = await fetch(`http://localhost:3000/tickets/${editingId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const j = await resp.json().catch(() => ({ error: 'Error' }));
          if (resp.ok) {
            Alert.alert('Eliminado', j.message || 'Eliminado');
            closeModal();
            load();
          } else {
            Alert.alert('Error', j.error || 'No se pudo eliminar');
          }
        }
      }
    ]);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎫 Ticketrik</Text>
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navBtn} onPress={onVolverDashboard}>
            <Text style={styles.navBtnText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.logoutBtn]} onPress={onSalir}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.listBox}>
        <Text style={styles.sectionTitle}>Tickets</Text>
        <View style={{ marginBottom: 16 }}>
          <Button title="Nuevo ticket" onPress={() => openModal()} />
        </View>
        <FlatList
          data={tickets}
          keyExtractor={t => t._id}
          ListEmptyComponent={<Text style={styles.noTickets}>No hay tickets.</Text>}
          renderItem={({ item: t }) => {
            const creator = (t.createdBy && t.createdBy.name) ? escapeHtml(t.createdBy.name) : (t.createdBy || 'n/a');
            return (
              <View style={styles.ticketItem}>
                <Text style={styles.ticketTitle}>{escapeHtml(t.title)}</Text>
                <Text style={styles.ticketDetails}>
                  <Text style={styles.ticketLabel}>Prioridad:</Text> {t.priority}{"   "}
                  <Text style={styles.ticketLabel}>Estado:</Text> {t.status}
                </Text>
                <Text style={styles.ticketDetails}>
                  <Text style={styles.ticketLabel}>Creado por:</Text> {creator}
                </Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => onVerTicket(t._id)}>
                    <Text style={styles.actionLink}>Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openModal(t)}>
                    <Text style={styles.actionLink}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(t._id)}>
                    <Text style={styles.actionLink}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
      {/* Modal para crear/editar ticket */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar ticket' : 'Crear ticket'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={form.title}
              onChangeText={text => setForm({ ...form, title: text })}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descripción"
              value={form.description}
              onChangeText={text => setForm({ ...form, description: text })}
              multiline
            />
            <View style={styles.pickerRow}>
              <Text style={{ marginRight: 8 }}>Prioridad:</Text>
              <TouchableOpacity
                style={[styles.priorityBtn, form.priority === 'low' && styles.prioritySelected]}
                onPress={() => setForm({ ...form, priority: 'low' })}
              >
                <Text>Baja</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priorityBtn, form.priority === 'medium' && styles.prioritySelected]}
                onPress={() => setForm({ ...form, priority: 'medium' })}
              >
                <Text>Media</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priorityBtn, form.priority === 'high' && styles.prioritySelected]}
                onPress={() => setForm({ ...form, priority: 'high' })}
              >
                <Text>Alta</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <Button title="Guardar" onPress={handleSave} />
              <Button title="Cancelar" color="#6c757d" onPress={closeModal} />
            </View>
            {editingId ? (
              <View style={{ marginTop: 20 }}>
                <Button
                  title="Eliminar Ticket"
                  color="#e74c3c"
                  onPress={handleDeleteFromModal}
                />
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
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
  listBox: {
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
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
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12
  },
  actionLink: {
    color: '#007AFF',
    marginRight: 16,
    fontWeight: 'bold'
  },
  noTickets: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  priorityBtn: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4
  },
  prioritySelected: {
    backgroundColor: '#d0eaff',
    borderColor: '#007aff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
});