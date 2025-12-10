import React from 'react';

export default function WorkshopCard({ workshop, onEnroll }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '10px', maxWidth: '400px' }}>
      <img src={workshop.image} alt={workshop.title} style={{ width: '100%', borderRadius: '6px' }} />
      <h2>{workshop.title}</h2>
      <p>{workshop.description}</p>
      <p><strong>Instructor:</strong> {workshop.instructor} ({workshop.instructor_reputation}⭐)</p>
      <p><strong>Fecha:</strong> {workshop.date} <strong>Hora:</strong> {workshop.time}</p>
      <p><strong>Lugar:</strong> {workshop.university_name} - {workshop.room_name}</p>
      <p><strong>Capacidad:</strong> {workshop.enrolled}/{workshop.capacity}</p>
      {onEnroll && (
        <button onClick={() => onEnroll(workshop.id)} style={{ padding: '8px 12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Inscribirse
        </button>
      )}
    </div>
  );
}
