import { getScannerPin } from '@/lib/google-sheets-registros'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()
    const correctPin = await getScannerPin()

    if (!correctPin) {
      return NextResponse.json({ error: 'Error al obtener el PIN' }, { status: 500 })
    }

    if (pin === correctPin) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
} 