'use client';

import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button"

interface ScanResult {
  success: boolean;
  message: string;
  details?: {
    Ticket?: string;
    Titular?: string;
    ID?: number;
  }
}

const QRScanner = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    try {
      // Primero intentamos con la cámara trasera
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      try {
        // Solo verificamos que podemos acceder a la cámara
        await navigator.mediaDevices.getUserMedia(constraints);
        // No detenemos el stream aquí, lo dejamos activo
        setHasPermission(true);
        setIsScanning(true);
      } catch {
        await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (error) {
      setHasPermission(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('Acceso a la cámara denegado. Por favor, permite el acceso cuando el navegador lo solicite.');
        } else if (error.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara. Asegúrate de que tu dispositivo tiene una cámara disponible.');
        } else {
          setError(`Error al acceder a la cámara: ${error.message}`);
        }
      } else {
        setError('Error desconocido al acceder a la cámara');
      }
    }
  };

  useEffect(() => {
    if (!hasPermission || !isScanning) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          // Éxito en el escaneo
          html5QrCode.pause();
          await validateQRCode(decodedText);
        },
        (errorMessage) => {
          // Solo logueamos errores críticos
          if (!errorMessage.includes('NotFound')) {
            console.warn(errorMessage);
          }
        }
      ).catch((err) => {
        console.error("Error al iniciar el scanner:", err);
        setError("No se pudo iniciar el scanner de QR");
      });

    } catch (error) {
      console.error("Error al crear el scanner:", error);
      setError("Error al inicializar el scanner");
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [hasPermission, isScanning]);

  const validateQRCode = async (qrCode: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbwZMaaig2z4YUimzQweMhLIKSeco-ZcaSeKYVIu8qvZcCZfdIHJPGY-9b-i8K4JyggG/exec?code=${encodeURIComponent(qrCode)}`
      );
      const data: ScanResult = await response.json();
      setScanResult(data);
      setIsScanning(false);
    } catch {
      setScanResult({
        success: false,
        message: "Error al validar el código QR"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (scannerRef.current) {
      try {
        // Pausar y limpiar el scanner
        scannerRef.current.pause();
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanResult(null);
        setIsScanning(true);
      } catch (error) {
        console.error('Error al resetear el scanner:', error);
        // Intentar limpiar el estado aunque falle el scanner
        scannerRef.current = null;
        setScanResult(null);
        setIsScanning(true);
      }
    } else {
      setScanResult(null);
      setIsScanning(true);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <h1 className="heading-h1 mb-8 text-center">
          Validación de Invitaciones
        </h1>
        <div className="border-2 border-pink-500 shadow-lg shadow-pink-500/90 bg-gradient-to-t from-[#f9adcd] 0% to-[#ffffff] 100% rounded-xl p-4 shadow-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="body-base-alt text-center">Validando código QR...</p>
            </div>
          ) : !hasPermission ? (
            <div className="text-center p-4">
              <p className="body-base-alt mb-4">
                Para escanear códigos QR, necesitamos acceso a tu cámara.
                {error && <span className="text-red-500 block mt-2">{error}</span>}
              </p>
              <Button
                onClick={requestCameraPermission}
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Solicitando acceso...' : 'Permitir acceso'}
              </Button>
            </div>
          ) : isScanning ? (
            <>
              <p className="body-base-alt text-center mb-4">
                Escanea el código QR de la invitación
              </p>
              <div 
                id="reader" 
                className="mx-auto max-w-xl min-h-[300px] rounded-lg overflow-hidden"
                style={{ width: '100%' }}
              />
            </>
          ) : (
            <>
              {scanResult && (
                <div className={`rounded-xl p-6 ${
                  scanResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200 text-center' 
                    : 'bg-red-50 text-red-800 border border-red-200 text-center'
                }`}>
                  <h3 className="heading-h2-alt mb-4 text-center">
                    {scanResult.success ? '✅ Invitación válida' : '⛔️ Invitación no válida'}
                  </h3>
                  <p className="body-base-alt text-center mb-4">
                    {scanResult.message}
                  </p>
                  {scanResult.details && (
                    <div className="space-y-2">
                      {scanResult.details.ID && (
                        <p className="body-base-alt text-center"><strong>ID:</strong> {scanResult.details.ID}</p>
                      )}
                      {scanResult.details.Titular && (
                        <p className="body-base-alt text-center"><strong>Titular:</strong> {scanResult.details.Titular}</p>
                      )}
                      {scanResult.details.Ticket && (
                        <p className="body-base-alt text-center"><strong>Ticket:</strong> {scanResult.details.Ticket}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <Button 
                onClick={handleReset}
                variant="primary"
                className="w-full mt-4"
              >
                Escanear otro código
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;