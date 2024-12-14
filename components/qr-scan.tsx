'use client';

import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button"

interface ScanResult {
  success: boolean;
  message: string;
  details?: {
    nombre?: string;
    mesa?: string;
    invitados?: number;
  }
}

const QRScanner = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const html5QrCode = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
          setHasPermission(true);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
        setHasPermission(false);
      }
    };

    initializeScanner();
    html5QrCode.current = new Html5Qrcode("reader");

    return () => {
      if (html5QrCode.current?.isScanning) {
        html5QrCode.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!html5QrCode.current || !selectedCamera) return;

    try {
      await html5QrCode.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await validateQRCode(decodedText);
        },
        (errorMessage) => {
          console.warn(errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
    }
  };

  const stopScanning = async () => {
    if (html5QrCode.current?.isScanning) {
      await html5QrCode.current.stop();
      setIsScanning(false);
    }
  };

  const validateQRCode = async (qrCode: string) => {
    await stopScanning();
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbwZMaaig2z4YUimzQweMhLIKSeco-ZcaSeKYVIu8qvZcCZfdIHJPGY-9b-i8K4JyggG/exec?code=${encodeURIComponent(qrCode)}`
      );
      const data: ScanResult = await response.json();
      setScanResult(data);
    } catch (error) {
      setScanResult({
        success: false,
        message: "Error al validar el código QR"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    startScanning();
  };

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <h1 className="heading-h1 mb-8 text-center">
          Validación de Invitaciones
        </h1>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="body-base text-center">Validando código QR...</p>
            </div>
          ) : !hasPermission ? (
            <div className="text-center p-4">
              <p className="body-base mb-4">Se requiere acceso a la cámara para escanear códigos QR</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Permitir acceso
              </Button>
            </div>
          ) : scanResult ? (
            <>
              <div className={`rounded-xl p-6 ${
                scanResult.success 
                  ? 'bg-green-50 text-green-800 border border-green-200 text-center' 
                  : 'bg-red-50 text-red-800 border border-red-200 text-center'
              }`}>
                <h3 className="heading-h2 mb-4 text-center">
                  {scanResult.success ? '✅ Invitación válida' : '❌ Invitación no válida'}
                </h3>
                <p className="body-base mb-4 text-center">{scanResult.message}</p>
                {scanResult.details && (
                  <div className="space-y-2">
                    {scanResult.details.nombre && (
                      <p className="body-base">Nombre: {scanResult.details.nombre}</p>
                    )}
                    {scanResult.details.mesa && (
                      <p className="body-base">Mesa: {scanResult.details.mesa}</p>
                    )}
                    {scanResult.details.invitados && (
                      <p className="body-base">Invitados: {scanResult.details.invitados}</p>
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleReset}
                variant="primary"
                className="w-full mt-4"
              >
                Escanear otro código
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="body-large text-center mb-4">
                Escanea el código QR de la invitación
              </p>
              <div className="space-y-4">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full p-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || 'Cámara principal'}
                    </option>
                  ))}
                </select>
                <div id="reader" className="w-full aspect-square rounded-lg overflow-hidden" />
                <Button
                  onClick={isScanning ? stopScanning : startScanning}
                  variant="primary"
                  className="w-full"
                >
                  {isScanning ? 'Detener escaneo' : 'Iniciar escaneo'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;