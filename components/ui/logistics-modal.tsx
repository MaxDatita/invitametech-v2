'use client'

import { useState } from 'react'
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { MapPin, Clock, Map, ArrowLeft, Route } from 'lucide-react'
import Image from 'next/image'
import { theme } from '@/config/theme'

interface Schedule {
  time: string
  activity: string
}

interface LogisticsData {
  googleMapsUrl: string
  venueMapUrl: string
  schedule: Schedule[]
}

const defaultLogisticsData: LogisticsData = {
  googleMapsUrl: "https://maps.google.com/...", // Tu URL de Google Maps
  venueMapUrl: "/map-event.webp", // La ruta a tu imagen del mapa del venue
  schedule: [
    { time: "20:00", activity: "Apertura de puertas" },
    { time: "21:00", activity: "Inicio de la ceremonia" },
    { time: "22:00", activity: "Cena" },
    { time: "23:30", activity: "Baile" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" },
    { time: "03:00", activity: "Cierre del evento" }
  ]
}

type ContentType = 'main' | 'schedule' | 'map'

interface LogisticsModalProps {
  data?: LogisticsData
}

export function LogisticsModal({ data = defaultLogisticsData }: LogisticsModalProps) {
  const [contentType, setContentType] = useState<ContentType>('main')
  const [isOpen, setIsOpen] = useState(false)
  const contentActivationDate = new Date(theme.dates.contentActivation)
  const isContentActive = new Date() >= contentActivationDate

  // Resetear el contentType cuando se cierra el modal
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setContentType('main')
    }
  }

  // Función para obtener la clase de altura según el contenido
  const getDialogHeight = () => {
    switch (contentType) {
      case 'schedule':
      case 'map':
        return 'h-[500px]'
      default:
        return 'h-auto min-h-[300px]'
    }
  }

  const renderContent = () => {
    switch (contentType) {
      case 'schedule':
        return isContentActive ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-4">
                <div className="grid gap-4 overflow-y-auto pr-2">
                  {data.schedule.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <span className="font-bold">{item.time}</span>
                      <span className="col-span-3">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => setContentType('main')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Logística
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-muted-foreground text-center">
                El cronograma estará disponible más cerca de la fecha del evento.
              </p>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => setContentType('main')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Logística
              </Button>
            </div>
          </div>
        )
      
      case 'map':
        return isContentActive ? (
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="p-4 space-y-4">
                <p className='text-center'>
                  Toca la imagen para verla en su tamaño original.
                </p>
                <div className="relative w-full h-[300px] rounded-xl overflow-hidden border">
                  <Image
                        src={data.venueMapUrl}
                        alt="Mapa del venue"
                        fill
                        style={{ objectFit: 'cover' }}
                        onClick={() => window.open(data.venueMapUrl, '_blank')}
                    />
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => setContentType('main')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Logística
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-muted-foreground text-center">
                El mapa del lugar estará disponible más cerca de la fecha del evento.
              </p>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => setContentType('main')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Logística
              </Button>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-4 p-4">
            <Button 
              variant="primary"
              className="w-full flex items-center justify-center"
              onClick={() => window.open(data.googleMapsUrl, '_blank')}
            >
              <MapPin className="mr-2 h-4 w-4" /> 
              Ver ubicación
            </Button>

            <Button 
              variant="secondary"
              className="w-full flex items-center justify-center"
              onClick={() => setContentType('schedule')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Cronograma del evento
            </Button>

            <Button 
              variant="secondary"
              className="w-full flex items-center justify-center"
              onClick={() => setContentType('map')}
            >
              <Map className="mr-2 h-4 w-4" />
              Mapa del lugar
            </Button>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (contentType) {
      case 'schedule':
        return "Cronograma del Evento"
      case 'map':
        return "Mapa del Lugar"
      default:
        return "Logística del Evento"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary" className="w-full flex items-center justify-center">
          <Route className="mr-2 h-4 w-4" /> Logística
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[425px] ${getDialogHeight()} flex flex-col`}>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
} 