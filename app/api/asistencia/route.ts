import { guardarAsistencia } from '@/lib/google-sheets';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const success = await guardarAsistencia(body);
    
    if (!success) {
      throw new Error('Error al guardar la asistencia');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/asistencia:', error);
    return NextResponse.json(
      { error: 'Error al guardar la asistencia' },
      { status: 500 }
    );
  }
} 