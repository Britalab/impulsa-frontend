// src/app/api/enroll/route.js
import supabase from '../../lib/supabaseClient';

export async function POST(req) {
  try {
    const { workshop_id, user_id } = await req.json();

    if (!workshop_id || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_data' }),
        { status: 400 }
      );
    }

    // LLAMADA RPC: los nombres aquí deben coincidir con la firma de la función en Postgres
    const { error } = await supabase.rpc('enroll_user_atomic', {
      p_user_uuid: user_id,       // <- nombre correcto según la función que creaste
      p_workshop_id: workshop_id
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('/api/enroll error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400 }
    );
  }
}

