'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'
import { sendTicketEmail } from '@/services/email'
import { registrarTickets } from '@/lib/google-sheets-registros'

interface PaymentData {
  nombre: string;
  email: string;
  tipoTicket: string;
  cantidad: number;
}

async function handleSuccessfulPayment(paymentData: PaymentData) {
  try {
    const { nombre, email, tipoTicket, cantidad } = paymentData;
    
    console.log('Registrando tickets con datos:', {
      nombre,
      email,
      tipoTicket,
      cantidad
    });

    // Registrar los tickets en Google Sheets
    const registroResponse = await fetch('/api/google-sheets/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        email,
        tipoTicket,
        cantidad: Number(cantidad)
      })
    });

    if (!registroResponse.ok) {
      throw new Error('Error registrando tickets');
    }

    // Enviar email con los tickets
    await sendTicketEmail({
      nombre,
      email,
      tipoTicket,
      quantity: Number(cantidad)
    });

  } catch (error) {
    console.error('Error en el proceso de pago exitoso:', error);
    throw error;
  }
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const saveInvitadoAndSendEmail = async () => {
      try {
        const quantity = parseInt(searchParams.get('quantity') || '1');
        const nombre = searchParams.get('name') || '';
        const email = searchParams.get('email') || '';
        const tipoTicket = searchParams.get('ticketType') || '';

        // Primero guardamos el invitado
        const response = await fetch('/api/payment/success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre,
            email,
            tipoTicket,
            quantity,
          }),
        });

        if (!response.ok) throw new Error('Error guardando la información del ticket');

        // Iniciamos la redirección
        router.push('/');

        // El proceso de email continúa en segundo plano después de la redirección
        // Esperamos un tiempo prudente para que Google Sheets se actualice
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Enviamos el email con todos los tickets no enviados para este email
        await handleSuccessfulPayment({
          nombre,
          email,
          tipoTicket,
          cantidad: quantity
        });

      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      }
    };

    if (searchParams.get('status') === 'approved') {
      saveInvitadoAndSendEmail();
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
        <Card className="auth-card rounded-xl">
          <div className="text-center">Procesando pago...</div>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 