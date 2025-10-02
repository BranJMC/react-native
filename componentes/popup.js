import React from 'react';
import { Modal, View, Text, StyleSheet, Button } from 'react-native';

export default function Popup({ visible, msg, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Aviso</Text>
          <Text style={styles.description}>{msg}</Text>
          <Button title="OK" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  dialog: { width: 280, padding: 20, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, marginBottom: 20, textAlign: 'center' }
});