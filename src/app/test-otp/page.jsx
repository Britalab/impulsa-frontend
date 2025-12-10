"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";



export default function TestOTP() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleOTP = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMessage("Error: " + error.message);
    else setMessage("Revisa tu correo para el magic link / OTP");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Prueba de OTP / Magic Link</h1>
      <input
        type="email"
        placeholder="Tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleOTP}>Enviar OTP</button>
      {message && <p>{message}</p>}
    </div>
  );
}
