import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const config = {
      method: 'post',
      url: 'https://api.envialosimple.email/api/v1/mail/send',
      headers: { 
        'Authorization': `Bearer ${process.env.ENVIALO_SIMPLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        from: "tickets@eventechy.com",
        ...body
      }
    };

    const response = await axios(config);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error sending email:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: 'Error sending email', details: errorMessage },
      { status: 500 }
    );
  }
} 