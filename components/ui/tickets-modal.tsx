'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StyledDialog } from "@/components/ui/styled-dialog"
import { Ticket, Plus, Minus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { checkTicketAvailability } from '@/lib/google-sheets-registros'
import { theme } from '@/config/theme'

interface TicketType {
  id: string
  name: string
  price: number
  description?: string
}

const ticketTypes: TicketType[] = [
  {
    id: 'Regular',
    name: 'Regular',
    price: 1000,
    description: 'Acceso general al evento'
  },
  {
    id: 'VIP',
    name: 'VIP',
    price: 2000,
    description: 'Acceso VIP con beneficios exclusivos'
  }
]

export function TicketsModal({ onClose }: { onClose: () => void }) {
  const [selectedTicket, setSelectedTicket] = useState<string>('Regular')
  const [quantity, setQuantity] = useState<number>(1)
  const [remainingTickets, setRemainingTickets] = useState<number | null>(null)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true)
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedTicketType = ticketTypes.find(t => t.id === selectedTicket)
  const total = (selectedTicketType?.price || 0) * quantity

  useEffect(() => {
    const checkAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const result = await checkTicketAvailability(selectedTicket, 1);
        setRemainingTickets(result.remainingTickets);
        if (result.remainingTickets !== -1 && quantity > result.remainingTickets) {
          setQuantity(result.remainingTickets);
        }
      } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        toast.error('Error al verificar disponibilidad');
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedTicket]);

  const validateQuantity = (newQuantity: number) => {
    if (remainingTickets !== null && remainingTickets !== -1) {
      return Math.min(newQuantity, remainingTickets);
    }
    return newQuantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerInfo.name || !buyerInfo.email) {
      toast.error('Por favor completa todos los campos')
      return
    }


    setIsSubmitting(true)
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketType: selectedTicket,
          quantity,
          unitPrice: selectedTicketType?.price || 0,
          name: buyerInfo.name,
          email: buyerInfo.email,
          title: selectedTicketType?.name,
        }),
      });

      if (!response.ok) throw new Error('Error creating payment');
      
      const data = await response.json();
      
      // Redirigir al checkout de MercadoPago
      window.location.href = data.init_point;
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Ticket</label>
        <div className="grid grid-cols-2 gap-2">
          {ticketTypes.map((ticket) => (
            <Button
              key={ticket.id}
              type="button"
              variant={selectedTicket === ticket.id ? "primary" : "secondary"}
              onClick={() => setSelectedTicket(ticket.id)}
              className="w-full"
            >
              <div className="text-left">
                <div>{ticket.name}</div>
                <div className="text-sm opacity-70">${ticket.price}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cantidad</label>
        {remainingTickets !== null && remainingTickets <= 10 && remainingTickets > 0 && (
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">¡Quedan solo {remainingTickets} tickets disponibles!</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max={remainingTickets !== null && remainingTickets !== -1 ? remainingTickets : undefined}
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                setQuantity(validateQuantity(value));
              }
            }}
            className="text-center"
            disabled={isLoadingAvailability}
          />
          <div className="flex">
            <Button
              type="button"
              variant="primary"
              onClick={() => setQuantity(prev => validateQuantity(Math.max(1, prev - 1)))}
              className="h-10 w-10 flex items-center justify-center rounded-r-none p-0"
              disabled={quantity <= 1 || isLoadingAvailability}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => setQuantity(prev => validateQuantity(prev + 1))}
              className="h-10 w-10 flex items-center justify-center rounded-l-none border-l border-white/20 p-0"
              disabled={remainingTickets !== null && remainingTickets !== -1 && quantity >= remainingTickets || isLoadingAvailability}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre</label>
        <Input
          placeholder="Tu nombre completo"
          value={buyerInfo.name}
          onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="tu@email.com"
          value={buyerInfo.email}
          onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div>
        <p className="text-sm text-justify">
          <span>
            <span className="font-bold">Nota:</span> Asegúrate de que los datos sean correctos para recibir tus tickets. Pago administrado por <span className="text-gray-400 font-bold">MercadoPago</span>.
          </span>
        </p>
      </div>

      <div className="py-2 text-lg font-semibold border-t">
        Total a pagar: ${total}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Procesando...' : 'Comprar'}
      </Button>
    </form>
  )
} 