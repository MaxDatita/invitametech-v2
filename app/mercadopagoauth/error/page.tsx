'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from 'lucide-react'

export default function MercadoPagoAuthErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <Card className="w-full max-w-md rounded-xl backdrop-blur-sm bg-white/30 p-8">
        <div className="text-center space-y-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="heading-h1">Error de Configuración</h1>
          
          <p className="body-base">
            Ha ocurrido un error al conectar tu cuenta de MercadoPago. 
            Por favor, contacta al administrador del proyecto para resolver este problema.
          </p>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push('/')}
          >
            Volver al Inicio
          </Button>
        </div>
      </Card>
    </div>
  )
} 