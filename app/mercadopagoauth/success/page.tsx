'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    console.log('Token received:', token)

    if (token) {
      fetch('/api/mercadopago/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Token saved:', data)
      })
      .catch(error => {
        console.error('Error saving token:', error)
      })
    }
  }, [searchParams])

  return (
    <Card className="w-full max-w-md rounded-xl backdrop-blur-sm bg-white/30 p-8">
      <div className="text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="heading-h1">¡Configuración Exitosa!</h1>
        
        <p className="body-base">
          Tu cuenta de MercadoPago ha sido conectada correctamente. Ya puedes comenzar a vender tickets.
        </p>

        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push('/')}
        >
          Ir a la Aplicación
        </Button>
      </div>
    </Card>
  )
}

export default function MercadoPagoAuthSuccessPage() {
  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <Suspense fallback={
        <Card className="w-full max-w-md rounded-xl backdrop-blur-sm bg-white/30 p-8">
          <div className="text-center">Cargando...</div>
        </Card>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
} 