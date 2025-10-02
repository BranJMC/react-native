import AsyncStorage from '@react-native-async-storage/async-storage';

export async function logout() {
  // Elimina el token guardado localmente
  await AsyncStorage.removeItem('token');
  // Si tu backend requiere cerrar sesión, puedes hacer una petición aquí
  await fetch('http://localhost:3000/logout', { method: 'POST', credentials: 'include' });
  return Promise.resolve();
}