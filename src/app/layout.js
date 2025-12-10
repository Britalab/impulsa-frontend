import './globals.css';

export const metadata = {
  title: 'IMPULSA - Educación Colaborativa Universitaria',
  description: 'Plataforma de aprendizaje colaborativo para estudiantes universitarios',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
