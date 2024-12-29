'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { saveSellerToken } from '@/lib/google-sheets-registros'

export default function MercadoPagoAuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      saveSellerToken(token).then(() => {
        console.log('Token saved successfully')
      }).catch(error => {
        console.error('Error saving token:', error)
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
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
    </div>
  )
} 