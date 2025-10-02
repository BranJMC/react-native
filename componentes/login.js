import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import Popup from './popup';

// URL de fondo aleatoria
const RANDOM_BG = 'https://picsum.photos/800/1600';

export default function Login({ onLoginSuccess, onIrRegistro }) {
  const [email, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Función para mostrar un mensaje en el popup
  const mostrar = (msg) => {
    setMensaje(msg);
    setVisible(true);
  };

  const handleLogin = async () => {
    try {
      // Petición POST a la API de login
      const res = await axios.post('http://localhost:3000/auth/login', { email, clave });
      if (res.data.token) {
        // Almacenamos el token y llamamos al callback onLoginSuccess
        onLoginSuccess(res.data.token);
      } else {
        mostrar('Credenciales incorrectas');
      }
    } catch {
      mostrar('Error al conectar con el servidor');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={{ uri: RANDOM_BG }} style={styles.fondo}>
        <View style={styles.overlay}>
          <Text style={styles.titulo}>Iniciar Sesión</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={email}
            onChangeText={setCorreo}
            placeholderTextColor="#fff"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Clave"
            value={clave}
            onChangeText={setClave}
            placeholderTextColor="#fff"
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.textoBoton}>Ingresar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.boton, { backgroundColor: '#6c757d', marginTop: 10 }]} onPress={onIrRegistro}>
            <Text style={styles.textoBoton}>Registrarse</Text>
          </TouchableOpacity>
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
  input: { borderWidth: 1, borderColor: '#fff', marginBottom: 15, padding: 10, borderRadius: 5, color: '#fff' },
  boton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5 },
  textoBoton: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
