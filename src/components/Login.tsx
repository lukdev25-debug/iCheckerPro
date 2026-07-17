import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const onLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Usuario logueado:', user);
      // Aquí puedes enviar el token al backend o guardar en el estado global
      alert(`Hola ${user.displayName} (${user.email})`);
    } catch (err) {
      console.error('Error en login con Google', err);
      alert('Error en login con Google');
    }
  };

  return (
    <button onClick={onLogin}>Ingresar con Google</button>
  );
}
