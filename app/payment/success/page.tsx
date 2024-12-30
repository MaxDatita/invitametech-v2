'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const saveInvitado = async () => {
      try {
        const quantity = parseInt(searchParams.get('quantity') || '1');
        const response = await fetch('/api/payment/success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: searchParams.get('name'),
            email: searchParams.get('email'),
            tipoTicket: searchParams.get('ticketType'),
            quantity: quantity,
          }),
        });

        if (!response.ok) throw new Error('Error saving invitado');
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } catch (error) {
        console.error('Error:', error)
      }
    };

    if (searchParams.get('status') === 'approved') {
      saveInvitado();
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <Card className="auth-card rounded-xl">
        <div className="auth-card-content">
          <CheckCircle className="auth-card-icon auth-card-icon-success" />
          <h1 className="auth-card-title">Pago Exitoso</h1>
          
          <p className="auth-card-text">
            Tu pago ha sido procesado correctamente. En breve recibirás un email con tus tickets.
          </p>
          
          <p className="auth-card-text text-sm text-gray-600">
            Serás redirigido automáticamente...
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
        <Card className="auth-card">
          <div className="text-center">Procesando pago...</div>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 