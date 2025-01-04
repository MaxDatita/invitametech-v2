import { NextResponse } from 'next/server';
import { getEventData, getUnsentTickets, markTicketsAsSent } from '@/services/googleSheet';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const eventData = await getEventData();
    const tickets = await getUnsentTickets(email);
    return NextResponse.json({ eventData, tickets });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { rowIndexes } = await request.json();

  try {
    await markTicketsAsSent(rowIndexes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 