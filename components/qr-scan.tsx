'use client';

import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
import { useEffect, useState } from 'react';
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
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    }, false);

    const validateQRCode = async (qrCode: string) => {
      try {
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbwZMaaig2z4YUimzQweMhLIKSeco-ZcaSeKYVIu8qvZcCZfdIHJPGY-9b-i8K4JyggG/exec?code=${encodeURIComponent(qrCode)}`
        );
        const data: ScanResult = await response.json();
        setScanResult(data);
        setIsScanning(false);
      } catch (error) {
        setScanResult({
          success: false,
          message: "Error al validar el código QR"
        });
      }
    };

    const onScanSuccess = (decodedText: string) => {
      validateQRCode(decodedText);
      scanner.clear();
    };

    const onScanError = (errorMessage: string) => {
      console.warn(errorMessage);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear();
    };
  }, [hasPermission]);

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation">
      <div className="w-full max-w-md mx-auto rounded-xl">
        <h1 className="heading-h1 mb-8">
          Validación de Invitaciones
        </h1>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-6">
          {!hasPermission ? (
            <div className="text-center p-4">
              <p className="body-base mb-4">Se requiere acceso a la cámara para permitir escanear el código QR</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Permitir acceso
              </Button>
            </div>
          ) : isScanning ? (
            <>
              <p className="body-large text-center mb-4">
                Escanea el código QR de la invitación
              </p>
              <div id="reader" className="mx-auto max-w-xl min-h-[400px] rounded-lg overflow-hidden" />
            </>
          ) : (
            <>
              {scanResult && (
                <div className={`rounded-lg p-6 ${
                  scanResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <h3 className="heading-h2 mb-4">
                    {scanResult.success ? '✅ Invitación válida' : '❌ Invitación no válida'}
                  </h3>
                  <p className="body-base mb-4">{scanResult.message}</p>
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
              )}
              <button 
                onClick={handleReset}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white rounded-lg font-semibold shadow-md hover:from-purple-600 
                         hover:to-pink-600 transition-all duration-200 focus:outline-none 
                         focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Escanear otro código
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;