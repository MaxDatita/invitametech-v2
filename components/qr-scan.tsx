'use client';

import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (!hasPermission || !isScanning) return;

    const styleId = "qr-scanner-styles";
    let existingStyle = document.getElementById(styleId);

    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        /* Reset y estilos base */
        #reader__dashboard,
        #reader__dashboard_section,
        #reader__dashboard_section_csr,
        #reader__status_text,
        #reader__filescan_input,
        #reader__dashboard_section_swaplink,
        select {
          display: none !important;
        }

        #reader {
          border: none !important;
          background: transparent !important;
        }

        #reader__scan_region {
          background: transparent !important;
          border: 2px solid rgba(147, 51, 234, 0.3) !important;
          border-radius: 0.75rem !important;
          overflow: hidden !important;
        }

        #reader__scan_region > img {
          display: none !important;
        }

        /* Botón de flash */
        #reader__torch_button {
          position: fixed !important;
          z-index: 9999 !important;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem !important;
          background: #bf90ee !important;
          color: white !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          position: absolute !important;
          bottom: 1rem !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 1000 !important;
          transition: all 0.2s ease !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }

        #reader__torch_button:hover {
          background: rgb(126 34 206) !important;
          transform: translateX(-50%) translateY(-2px) !important;
        }

        #reader__torch_button:active {
          transform: translateX(-50%) translateY(0) !important;
        }
      `;
      document.head.appendChild(style);
      existingStyle = style;
    }

    const config = {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: false,
      defaultZoomValueIfSupported: 2,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: false
      },
      verbose: false,
      rememberLastUsedCamera: true,
      uiStrings: {
        selectCamera: "Seleccionar Cámara",
        scanningInProgress: "Escaneando...",
        scanButtonStopScanningText: "Detener",
        scanButtonStartScanningText: "Comenzar",
        torchOnButton: "Encender Flash",
        torchOffButton: "Apagar Flash",
        toggleFlashlight: "Alternar Flash",
        chooseImage: "Elegir imagen",
        dropImageHere: "Arrastrar imagen aquí",
        zoom: "Zoom"
      },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      defaultVideoConstraints: {
        facingMode: { exact: "environment" }
      }
    };

    scannerRef.current = new Html5QrcodeScanner("reader", config, false);

    const validateQRCode = async (qrCode: string) => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    const onScanSuccess = (decodedText: string) => {
      if (scannerRef.current) {
        scannerRef.current.pause();
        validateQRCode(decodedText);
      }
    };

    const onScanError = (errorMessage: string) => {
      console.warn(errorMessage);
    };

    scannerRef.current.render(onScanSuccess, onScanError);

    return () => {
      if (existingStyle && document.head.contains(existingStyle)) {
        document.head.removeChild(existingStyle);
      }
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [hasPermission, isScanning]);

  const handleReset = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanResult(null);
    setIsScanning(true);
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
              <p className="body-base-alt mb-4">Para escanear códigos QR, necesitamos acceso a tu cámara</p>
              <Button
                onClick={requestCameraPermission}
                variant="primary"
              >
                Permitir acceso
              </Button>
            </div>
          ) : isScanning ? (
            <>
              <p className="body-base-alt text-center mb-4">
                Escanea el código QR de la invitación
              </p>
              <div id="reader" className="mx-auto max-w-xl min-h-[300px] rounded-lg overflow-hidden" />
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
                    {scanResult.success ? '✅ Invitación válida' : '❌ Invitación no válida'}
                  </h3>
                  <p className="body-base-alt mb-4 text-center">{scanResult.message}</p>
                  {scanResult.details && (
                    <div className="space-y-2">
                      {scanResult.details.nombre && (
                        <p className="body-base-alt">Nombre: {scanResult.details.nombre}</p>
                      )}
                      {scanResult.details.mesa && (
                        <p className="body-base-alt">Mesa: {scanResult.details.mesa}</p>
                      )}
                      {scanResult.details.invitados && (
                        <p className="body-base-alt">Invitados: {scanResult.details.invitados}</p>
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