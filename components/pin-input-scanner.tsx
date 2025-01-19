'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Image from 'next/image'

interface PinInputProps {
  onValidPin: () => void
}

export default function PinInput({ onValidPin }: PinInputProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/verify-pin-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        onValidPin()
      } else {
        setError('PIN incorrecto')
        setPin('')
      }
    } catch (error) {
      setError('Error al verificar el PIN')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen pt-6 pb-6 pl-6 pr-6 bg-gradient-animation flex flex-col items-center justify-center">
      <div>
        <h1 className="heading-h1 text-center mb-4"> Scanner</h1>
        <p className="body-base text-center mb-4">
          Coloca el PIN proporcionado para acceder.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <Input
          type="tel"
          maxLength={4}
          placeholder="Ingrese el PIN"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
            setError('')
          }}
          className="text-center text-2xl"
          inputMode="numeric"
        />
        <Button type="submit" className="w-full" disabled={pin.length !== 4}>
          Verificar
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
      <div className="mt-8 flex justify-center absolute bottom-0 left-0 right-0 mb-8">
          <a 
            href="https://eventechy.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo-fondo-oscuro.png"
              alt="Eventechy"
              width={155}
              height={55}
              className="rounded-lg eventechy-logo"
            />
          </a>
        </div>
    </div>
  )
} 