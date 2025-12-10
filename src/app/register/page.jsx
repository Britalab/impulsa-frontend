// src/app/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();

  // Campos del formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [rut, setRut] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [carrera, setCarrera] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // --- RUT validation (Chile) ---
  function cleanRut(v) {
    return v.replace(/[^0-9kK]/g, '').toUpperCase();
  }

  function validateRut(rutRaw) {
    const r = cleanRut(rutRaw);
    if (r.length < 2) return false;
    const body = r.slice(0, -1);
    const dv = r.slice(-1);

    let sum = 0;
    let mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    const res = 11 - (sum % 11);
    const dvExpected = res === 11 ? '0' : res === 10 ? 'K' : String(res);
    return dvExpected === dv;
  }

  // --- Handler del registro ---
  const handleRegister = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!nombres.trim() || !apellidos.trim()) {
      return alert('Por favor ingresa nombres y apellidos.');
    }

    if (!validateRut(rut)) {
      return alert('RUT inválido. Revisa el formato y dígitos.');
    }

    if (!email || !password) {
      return alert('Ingresa email y contraseña.');
    }

    setLoading(true);

    try {
      // 1) Crear cuenta en Supabase Auth
      const { data: signData, error: signError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signError) {
        throw new Error(signError.message);
      }

      // signUp puede no devolver session (si se requiere confirmación por email),
      // pero la cuenta fue creada en auth. Seguimos creando profile localmente.

      // 2) Insertar fila en tabla profiles
      const profilePayload = {
        full_name: `${nombres.trim()} ${apellidos.trim()}`,
        email: email.trim().toLowerCase(),
        role: 'student' /* por defecto */,
        created_at: new Date().toISOString()
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            full_name: profilePayload.full_name,
            email: profilePayload.email,
            role: profilePayload.role
          }
        ])
        .select()
        .single();

      if (profileError) {
        // Si la creación del profile falla, informamos (no borramos el user auth automáticamente)
        throw new Error('No se pudo crear el perfil: ' + profileError.message);
      }

    

      alert('Registro exitoso. Revisa tu correo si corresponde. Ahora puedes ingresar.');

      // Redirigir a login
      router.push('/login');
    } catch (err) {
      alert('Error durante registro: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <h1 style={{ fontSize: 28 }}>Crear cuenta</h1>

      <form onSubmit={handleRegister} style={form}>
        <input
          type="text"
          placeholder="Nombres"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          required
          style={input}
        />

        <input
          type="text"
          placeholder="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          required
          style={input}
        />

        <input
          type="text"
          placeholder="RUT (ej: 12345678K)"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          required
          style={input}
        />

        <input
          type="text"
          placeholder="Nacionalidad"
          value={nacionalidad}
          onChange={(e) => setNacionalidad(e.target.value)}
          style={input}
        />

        <input
          type="text"
          placeholder="Institución"
          value={institucion}
          onChange={(e) => setInstitucion(e.target.value)}
          style={input}
        />

        <input
          type="text"
          placeholder="Carrera"
          value={carrera}
          onChange={(e) => setCarrera(e.target.value)}
          style={input}
        />

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={input}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={input}
        />

        <button type="submit" style={btn} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}

const container = {
  maxWidth: 640,
  margin: '40px auto',
  padding: 24,
  borderRadius: 12,
  border: '1px solid #e6e6e6',
  textAlign: 'center',
  background: 'white'
};

const form = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginTop: 16
};

const input = {
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
  width: '100%',
  boxSizing: 'border-box'
};

const btn = {
  gridColumn: '1 / -1',
  padding: 12,
  borderRadius: 9999,
  background: '#4f46e5',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold'
};


