// src/app/dashboard/page.js
import NavBar from '../../components/NavBar';

export default function Dashboard() {
  const user = { role: 'Estudiante' }; // simula usuario logueado
  return (
    <>
      <NavBar user={user} />
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Aquí se mostrarán tus talleres inscritos.</p>
      </main>
    </>
  );
}
