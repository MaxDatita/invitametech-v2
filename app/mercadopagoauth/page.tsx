'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
export default function MercadoPagoAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthorize = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mercadopago/auth')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Redirigir a la URL de autorización de MercadoPago
      window.location.href = data.url
    } catch (err) {
      setError('Error al conectar con MercadoPago')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <Card className="w-full max-w-md rounded-xl border-2 border-pink-500 shadow-lg shadow-pink-500/90 bg-gradient-to-t from-[#f9adcd] 0% to-[#ffffff] 100% p-8">
        <div className="text-center space-y-6">
          <h1 className="heading-h1-alt">Conectar con MercadoPago</h1>
          
          <p className="body-base-alt">
            Para poder vender tickets a través de nuestra plataforma, necesitamos que autorices
            tu cuenta de MercadoPago. Esto nos permitirá procesar los pagos en tu nombre.
          </p>

          <div className="space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleAuthorize}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar con MercadoPago'
              )}
            </Button>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          <p className="text-sm opacity-70">
            Al conectar tu cuenta, aceptas nuestros términos y condiciones para el procesamiento
            de pagos y la gestión de tickets. Puedes revisar nuestros términos y condiciones <a href="https://www.eventechy.com/terminos" target="_blank" rel="noopener noreferrer" className="text-sm underline font-bold opacity-80">
              aquí
            </a>.
          </p>
        </div>
        <div className="mt-8 flex justify-center absolute bottom-0 left-0 right-0 mb-4">
          <a 
            href="https://eventechy.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo-fondo-oscuro.png"
              alt="Eventechy"
              width={155}
              height={55}
              className="rounded-lg eventechy-logo"
            />
          </a>
        </div>
      </Card>
    </div>
  )
} 