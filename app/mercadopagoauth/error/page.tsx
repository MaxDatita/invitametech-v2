'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from 'lucide-react'

export default function MercadoPagoAuthErrorPage() {
  const router = useRouter()

  return (
    <Card className="auth-card">
      <div className="auth-card-content">
        <AlertTriangle className="auth-card-icon auth-card-icon-error" />
        <h1 className="auth-card-title">Error de Configuración</h1>
        
        <p className="auth-card-text">
          Ha ocurrido un error al conectar tu cuenta...
        </p>

        <Button variant="primary" className="w-full">
          Volver al Inicio
        </Button>
      </div>
    </Card>
  )
} 