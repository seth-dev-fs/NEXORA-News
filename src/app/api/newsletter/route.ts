import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 3; // 3 requests per window

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or fallback to a generic key
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         'anonymous';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return false;
  }

  // Reset if window expired
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return false;
  }

  // Increment count
  record.count++;
  rateLimitMap.set(key, record);

  return record.count > RATE_LIMIT_MAX;
}

function validateEmail(email: string): boolean {
  // RFC 5322 compliant email validation (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { message: 'Demasiados pedidos. Por favor, tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { message: 'Formato de pedido inválido.' },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate email presence
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email é obrigatório.' },
        { status: 400 }
      );
    }

    // Sanitize and validate email format
    const sanitizedEmail = email.trim().toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Formato de email inválido.' },
        { status: 400 }
      );
    }

    // Additional security: check for suspicious patterns
    if (sanitizedEmail.includes('..') || sanitizedEmail.startsWith('.')) {
      return NextResponse.json(
        { message: 'Formato de email inválido.' },
        { status: 400 }
      );
    }

    // In a real application, you would integrate with an email marketing service here
    // Examples: Mailchimp, SendGrid, ConvertKit, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log(`Newsletter signup: ${sanitizedEmail}`);
    }

    // Clean up old rate limit records periodically
    if (Math.random() < 0.1) { // 10% chance on each request
      const now = Date.now();
      for (const [key, record] of rateLimitMap.entries()) {
        if (now - record.timestamp > RATE_LIMIT_WINDOW) {
          rateLimitMap.delete(key);
        }
      }
    }

    return NextResponse.json(
      { message: 'Subscrito com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { message: 'Ocorreu um erro. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
