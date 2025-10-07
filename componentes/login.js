import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import Popup from './popup';

const RANDOM_BG = 'https://picsum.photos/800/1600';

export default function Login({ onLoginSuccess, onIrRegistro }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const mostrar = (msg) => {
    setMensaje(msg);
    setVisible(true);
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      const j = await res.json().catch(() => ({ error: 'Error' }));
      if (res.ok) {
        setMensaje('');
        onLoginSuccess(j.token); // Llama al callback con el token
      } else {
        mostrar(j.error || 'Credenciales incorrectas');
      }
    } catch {
      mostrar('Error al conectar con el servidor');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={{ uri: RANDOM_BG }} style={styles.fondo}>
        <View style={styles.overlay}>
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.label}></Text>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={form.email}
            onChangeText={text => setForm({ ...form, email: text })}
            placeholderTextColor="#fff"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}></Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={form.password}
            onChangeText={text => setForm({ ...form, password: text })}
            placeholderTextColor="#fff"
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.textoBoton}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.boton, { backgroundColor: '#6c757d', marginTop: 10 }]} onPress={onIrRegistro}>
            <Text style={styles.textoBoton}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
          {mensaje ? <Text style={styles.errorMsg}>{mensaje}</Text> : null}
        </View>
        <Popup visible={visible} msg={mensaje} onClose={() => setVisible(false)} />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  titulo: { fontSize: 24, textAlign: 'center', marginBottom: 20, color: '#fff', fontWeight: 'bold' },
  label: { color: '#fff', marginBottom: 4, marginLeft: 2 },
  input: { borderWidth: 1, borderColor: '#fff', marginBottom: 15, padding: 10, borderRadius: 5, color: '#fff' },
  boton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5 },
  textoBoton: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  errorMsg: { color: '#e74c3c', marginTop: 10, textAlign: 'center' }
});