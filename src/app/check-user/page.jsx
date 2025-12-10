"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // <-- ruta corregida

export default function CheckUser() {
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      console.log(user); // aquí ves la info del usuario en la consola
    }

    fetchUser();
  }, []);

  return <div>Revisa la consola para ver tu usuario</div>;
}
