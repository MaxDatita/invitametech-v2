'use client'

import QRScanner from '@/components/qr-scan'
import { useState, useEffect } from 'react'

export default function ScannerPage() {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solicitar permisos de cámara explícitamente
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Liberar la cámara después de obtener permiso
        setHasPermission(true);
        setError(null);
      } catch (err) {
        console.error('Error al solicitar permisos de cámara:', err);
        setHasPermission(false);
        setError('No se pudo acceder a la cámara. Por favor, verifica los permisos en tu navegador.');
      }
    };

    requestCameraPermission();
  }, []);

  if (!hasPermission && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-600 text-xl font-semibold mb-4">Error de Cámara</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <QRScanner />
} 