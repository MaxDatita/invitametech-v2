'use client'

import { useState } from 'react'
import QRScanner from '@/components/qr-scan'
import PinInput from '@/components/pin-input-scanner'

export default function ScannerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <PinInput onValidPin={() => setIsAuthenticated(true)} />
  }

  return <QRScanner />
} 