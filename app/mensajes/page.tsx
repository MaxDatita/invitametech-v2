'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { theme } from '@/config/theme'
import Image from 'next/image'

interface CarouselMessage {
  id: number;
  nombre: string;
  mensaje: string;
}

interface ApiMessage {
  nombre: string
  mensaje: string
}

export default function MensajesPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  const carouselMessages = carouselQuery.data?.messages || [];

  // Efecto para el carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev === carouselMessages.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [carouselMessages.length]);

  return (
    <div className="min-h-screen bg-gradient-animation flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl mx-auto">
       
        {/* Título */}
        <h1 className="heading-h2 text-center mb-8  text-cyan-200">
          Mensajes de los invitados
        </h1>

        {/* Carrusel de mensajes */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl min-h-[300px] flex items-center justify-center">
          {carouselMessages.map((message: CarouselMessage, index: number) => (
            <div
              key={index}
              className={`absolute w-full transition-opacity duration-1000 text-center ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-3xl font-light mb-4 text-white">
                &ldquo;{message.mensaje}&rdquo;
              </p>
              <p className="text-xl font-medium text-white/80">
                - {message.nombre}
              </p>
            </div>
          ))}
        </div>

        {/* Indicadores */}
        <div className="flex justify-center gap-2 mt-4">
          {carouselMessages.map((_: CarouselMessage, index: number) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-4' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
         {/* Logo */}
         <div className="mt-8 flex justify-center">
          <Image
            src="/logo-fondo-oscuro.png"
            alt="Eventechy"
            width={200}
            height={71}
            className="rounded-lg eventechy-logo"
          />
        </div>

      </div>
    </div>
  );
} 