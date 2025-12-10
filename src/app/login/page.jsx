'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabaseClient';



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const router = useRouter(); // ⚠️ Aquí inicializamos el router

  // Paso 1: Enviar código OTP al correo
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithOtp({
      email
    });

    if (error) {
      alert('Error al enviar OTP: ' + error.message);
    } else {
      alert('Revisa tu correo: te enviamos un código de acceso.');
      setShowTokenInput(true);
    }
  };

  // Paso 2: Verificar OTP (código numérico)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      alert('Código inválido: ' + error.message);
    } else {
      alert('¡Bienvenido! Ya estás logueado.');
      console.log('Sesión:', data.session);

      // Redirige automáticamente al marketplace
      router.push('/marketplace');
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Login con OTP</h1>
      {!showTokenInput && (
        <form onSubmit={handleSendOtp} style={formStyle}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" style={buttonStyle}>Enviar código</button>
        </form>
      )}

      {showTokenInput && (
        <form onSubmit={handleVerifyOtp} style={formStyle}>
          <input
            type="text"
            placeholder="Código de acceso"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
          />
          <button type="submit" style={buttonStyle}>Verificar y Entrar</button>
        </form>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: 400,
  margin: '50px auto',
  padding: 24,
  border: '1px solid #ccc',
  borderRadius: 12,
  textAlign: 'center'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 20
};

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: 9999,
  background: '#4f46e5',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold'
};

