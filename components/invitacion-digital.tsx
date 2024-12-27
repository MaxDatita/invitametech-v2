'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, MailPlus, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { theme } from '@/config/theme';
import { StyledDialog } from "@/components/ui/styled-dialog"
import { MenuModal } from "@/components/ui/menu-modal"
import { LogisticsModal } from "@/components/ui/logistics-modal"
import { TicketsModal } from "@/components/ui/tickets-modal"


const gradientColors = [
  'from-red-400 to-pink-600',
  'from-orange-400 to-red-600',
  'from-yellow-400 to-orange-600',
  'from-green-400 to-emerald-600',
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-indigo-600',
  'from-indigo-400 to-purple-600',
  'from-purple-400 to-pink-600',
]

const getConsistentGradient = (name: string) => {
  if (!name) return gradientColors[0];
  
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return gradientColors[hash % gradientColors.length];
}

const InitialsCircle = ({ name }: { name: string }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : ''
  const gradient = getConsistentGradient(name)
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 bg-gradient-to-br ${gradient}`}>
      {initials}
    </div>
  )
}

interface MessageCardProps {
  message: {
    id: number;
    nombre: string;
    mensaje: string;
  };
  onClick: () => void;
}

// Componente para mostrar un mensaje en el carrusel
const MessageCard: React.FC<MessageCardProps> = ({ message, onClick }) => {
  return (
    <div 
      className="message-card"
      onClick={onClick}
    >
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0">
          <InitialsCircle name={message.nombre} />
        </div>
        <span className="font-semibold truncate overflow-hidden flex-1">
          {message.nombre}
        </span>
      </div>
      <p className="message-card-content">
        {message.mensaje}
      </p>
    </div>
  )
}

interface ApiMessage {
  nombre: string;
  mensaje: string;
}

interface CarouselMessage {
  id: number;
  nombre: string;
  mensaje: string;
}


export function InvitacionDigitalComponent() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventStarted, setEventStarted] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ApiMessage | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState({
    nombre: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const pageSize = 20;
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'bebidas' | 'comidas'>('bebidas');
  const [showLive, setShowLive] = useState(false)

  const eventDate = useMemo(() => new Date(theme.dates.event), []);
  const contentActivationDate = new Date(theme.dates.contentActivation);
  const rsvpDeadline = new Date(theme.dates.rsvpDeadline);
  const liveEndDate = useMemo(() => new Date(theme.dates.liveEnd), []);

  // Query para el carrusel (aleatoria)
  const carouselQuery = useQuery({
    queryKey: ['messages', 'carousel'],
    queryFn: async () => {
      const response = await fetch('/api/messages?random=true');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });

  // Query para todos los mensajes (paginada)
  const { 
    data: allMessagesData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch: refetchAllMessages
  } = useInfiniteQuery({
    queryKey: ['messages', 'all'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/messages?page=${pageParam}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return {
        messages: data.messages,
        hasMore: data.hasMore,
        nextPage: pageParam + 1
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1
  });

  const carouselMessages = carouselQuery.data?.messages || [];
  const allMessages = allMessagesData?.pages.flatMap(page => page.messages) || [];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentDate(now)
      const difference = eventDate.getTime() - now.getTime()
      const liveEndDifference = liveEndDate.getTime() - now.getTime()

      if (difference <= 0 && liveEndDifference > 0) {
        setEventStarted(true)
        setShowLive(true)
      } else if (liveEndDifference <= 0) {
        setShowLive(false)
      }

      if (difference <= 0) {
        setEventStarted(true)
        setShowUpdateButton(true)
        clearInterval(interval)
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24))
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const m = Math.floor((difference / 1000 / 60) % 60)
        const s = Math.floor((difference / 1000) % 60)
        setCountdown({ days: d, hours: h, minutes: m, seconds: s })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [eventDate, liveEndDate])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (eventStarted && carouselRef.current) {
      const scrollWidth = carouselMessages.length * 272
      let scrollPosition = 0

      const scroll = () => {
        if (!carouselRef.current) return;
        scrollPosition += 1
        if (scrollPosition >= scrollWidth) {
          scrollPosition = 0
        }
        carouselRef.current.scrollLeft = scrollPosition
      }

      const intervalId = setInterval(scroll, 50)
      return () => clearInterval(intervalId)
    }
  }, [eventStarted, carouselMessages.length])

  const isContentActive = currentDate >= contentActivationDate
  const isRsvpActive = currentDate < rsvpDeadline

  const handleMessageClick = useCallback((message: { id: number; nombre: string; mensaje: string }) => {
    setSelectedMessage({
      nombre: message.nombre,
      mensaje: message.mensaje
    })
  }, [])

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.nombre || !newMessage.mensaje) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const fecha = now.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha,
          nombre: newMessage.nombre,
          mensaje: newMessage.mensaje
        }),
      });

      if (!response.ok) throw new Error('Error al enviar el mensaje');

      setNewMessage({ nombre: '', mensaje: '' });
      setIsMessageDialogOpen(false);
      await carouselQuery.refetch();
      await refetchAllMessages();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = () => {
    setShowUpdateButton(false);
    window.location.reload();
  };

  //Comienzo la invitacion digital
  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation">
      {eventStarted && showLive && (
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span className="text-sm font-bold">LIVE</span>
        </div>
      )}
      
      <div className="w-full max-w-md mx-auto rounded-xl">
        <video
          className="w-full h-64 object-cover rounded-lg shadow-lg mb-4 rounded-xl"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={theme.resources.images.video} type="video/mp4" />
          Tu navegador no soporta el tag de video.
        </video>

        <div className="title-image-container">
          <Image
            src={theme.resources.images.title}
            alt="Eventest"
            width={300}
            height={100}
            className="title-image"
            priority
          />
        </div>

        {/* <h1 className="heading-h1">
          Celebremos Juntos
        </h1> */}

        <div className="relative w-full h-[50vh] mb-4 rounded-xl overflow-hidden">
          {['/img1.webp', '/img2.webp', '/img3.webp'].map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`Imagen de celebración ${index + 1}`}
              fill
              className={`object-cover rounded-lg shadow-lg transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        <p className="heading-h2 mt-4 mb-4">
          {eventStarted ? 'El evento ya comenzó, disfrutá la fiesta!' : 'Te invitamos a pasar una noche unica'}
        </p>

        {eventStarted ? (
          <div className="mb-6">
            {carouselQuery.isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
              </div>
            ) : carouselQuery.error ? (
              <p className='text-center mt-12 mb-12'>Error al cargar mensajes</p>
            ) : carouselMessages.length === 0 ? (
              <p className='text-center mt-12 mb-12'>Sé el primero en dejar un mensaje</p>
            ) : (
              <>
                <div ref={carouselRef} className="overflow-x-hidden whitespace-nowrap">
                  <div className="inline-flex gap-4" style={{ width: `${carouselMessages.length * 272 * 2}px` }}>
                    {carouselMessages.map((message: CarouselMessage) => (
                      <MessageCard key={message.id} message={message} onClick={() => handleMessageClick(message)} />
                    ))}
                    {carouselMessages.map((message: CarouselMessage) => (
                      <MessageCard key={`duplicate-${message.id}`} message={message} onClick={() => handleMessageClick(message)} />
                    ))}
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  className="flex mt-4 w-full items-center justify-center" 
                  onClick={() => setSelectedMessage({ 
                    nombre: 'Todos los mensajes', 
                    mensaje: '' 
                  })}
                >
                  <MailPlus className="mr-2 h-4 w-4"/> Ver todos los mensajes
                </Button>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className='countdown-message'>
              Te esperamos este {eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
              a las {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} para pasar una noche inolvidable.
            </div>
            <div className='body-base text-center mb-2'> Faltan: </div>
            <div className="countdown-container">
              <div className="countdown-item">
                <span className="countdown-number">{countdown.days}</span>
                <p className="countdown-label">Días</p>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.hours}</span>
                <p className="countdown-label">Horas</p>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.minutes}</span>
                <p className="countdown-label">Minutos</p>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{countdown.seconds}</span>
                <p className="countdown-label">Segundos</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <LogisticsModal />
          <MenuModal />
          <StyledDialog 
            title="Contenido del Evento"
            trigger={
              <Button 
                variant="primary" 
                className="flex items-center justify-center"
              >
                <ImageIcon className="mr-2 h-4 w-4" /> Contenido
              </Button>
            }
          >
            <div className="grid gap-4">
              {isContentActive ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-center">
                    Mirá todo el contenido multimedia del evento en un solo lugar. Fotos, videos, reels para Instagram y mucho más 🤳🏼📸😉
                  </p>
                  <Button
                    variant="primary"
                    className="w-full button-with-icon"
                    onClick={() => window.open(theme.resources.contentLink, "_blank")}
                  >
                    <ImageIcon className="button-icon" />
                    <span>Acceder al contenido</span>
                  </Button>
                </div>
              ) : (
                <p>El contenido del evento estará disponible más cerca de la fecha del evento. Quedá atento a las actualizaciones ⏳.</p>
              )}
            </div>
          </StyledDialog>
          <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" className="flex items-center justify-center">
                <MessageSquare className="mr-2 h-4 w-4" /> Mensajes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Deja un mensaje</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitMessage} className="grid gap-4 py-4">
                {isContentActive ? (
                  <>
                    <Input 
                      id="name" 
                      placeholder="Tu nombre" 
                      value={newMessage.nombre}
                      onChange={(e) => setNewMessage(prev => ({
                        ...prev,
                        nombre: e.target.value
                      }))}
                      required
                    />
                    <Textarea 
                      placeholder="Tu mensaje" 
                      value={newMessage.mensaje}
                      onChange={(e) => setNewMessage(prev => ({
                        ...prev,
                        mensaje: e.target.value
                      }))}
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                    </Button>
                  </>
                ) : (
                  // DINAMICO:  Frase antes de fecha de activación.
                  <p>Podrás dejar mensajes para el agasajado más cerca de la fecha del evento.</p>
                )}
              </form>
            </DialogContent>
          </Dialog>
          {isRsvpActive && (
            <TicketsModal />
          )}
        </div>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedMessage?.nombre && selectedMessage.nombre !== 'Todos los mensajes' && (
                <InitialsCircle name={selectedMessage.nombre} />
              )}
              {selectedMessage?.nombre || 'Mensaje'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedMessage?.nombre === 'Todos los mensajes' ? (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {allMessages.map((message) => (
                  <div key={message.id} className="flex items-start p-2 bg-white rounded-lg shadow">
                    <div className="flex-shrink-0">
                      <InitialsCircle name={message.nombre} />
                    </div>
                    <div className="ml-3 flex-grow">
                      <h3 className="font-semibold">{message.nombre}</h3>
                      <p className="text-sm whitespace-normal break-words">{message.mensaje}</p>
                    </div>
                  </div>
                ))}
                {hasNextPage && (
                  <Button 
                    onClick={() => fetchNextPage()} 
                    variant="primary" 
                    className="w-full mt-4"
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Cargando más mensajes...' : 'Ver más mensajes'}
                  </Button>
                )}
              </div>
            ) : (
              <p>{selectedMessage?.mensaje}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}