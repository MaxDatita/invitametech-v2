'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processingRef = useRef(false)

  useEffect(() => {
    const saveInvitado = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

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
        
        toast.success('¡Pago exitoso! Revisa tu email para ver los tickets')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al procesar el registro')
        processingRef.current = false;
      }
    };

    if (searchParams.get('status') === 'approved') {
      saveInvitado();
    }
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md rounded-xl backdrop-blur-sm bg-white/30 p-8 text-center">
      <h1 className="heading-h1 mb-4">¡Pago Exitoso!</h1>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin heading-h1 h-12 w-12" />
        <p className="body-base">Procesando tu compra...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex items-center justify-center">
      <Suspense 
        fallback={
          <div className="w-full max-w-md rounded-xl backdrop-blur-sm bg-white/30 p-8 text-center">
            <Loader2 className="animate-spin heading-h1 h-12 w-12 mx-auto" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  )
} 