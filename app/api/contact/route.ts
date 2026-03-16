import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type RateEntry = {
  count: number;
  lastReset: number;
};

// Simple in-memory rate limiting (per IP)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitMap = new Map<string, RateEntry>();

function getClientIp(req: NextRequest): string {
  const forwarded =
    req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    // reset window
    entry.count = 1;
    entry.lastReset = now;
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'Email transport is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();
    const company =
      body.company !== undefined && body.company !== null
        ? String(body.company).trim()
        : '';
    const phone =
      body.phone !== undefined && body.phone !== null
        ? String(body.phone).trim()
        : '';
    const topic = String(body.topic || 'general').trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const to =
      process.env.CONTACT_EMAIL_TO?.trim() || 'siteopsstudio@gmail.com';
    const from =
      process.env.CONTACT_EMAIL_FROM?.trim() ||
      process.env.SMTP_USER ||
      'no-reply@pilotcaradmin.local';

    const subject = `New contact form submission from ${name} (${topic})`;

    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      `Topic: ${topic}`,
      '',
      'Message:',
      message,
      '',
      `IP: ${ip}`,
      `Sent at: ${new Date().toISOString()}`,
    ].filter(Boolean);

    const textBody = lines.join('\n');

    const transporter = getTransport();

    await transporter.sendMail({
      to,
      from,
      replyTo: email,
      subject,
      text: textBody,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling contact form submission:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    });

    const errorMessage = error?.message || String(error);
    const isConfigError =
      typeof errorMessage === 'string' &&
      (errorMessage.includes('Email transport is not configured') ||
        errorMessage.includes('SMTP_HOST') ||
        errorMessage.includes('SMTP_USER') ||
        errorMessage.includes('SMTP_PASS'));

    // Check for common SMTP errors
    const isSmtpError =
      typeof errorMessage === 'string' &&
      (errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('EAUTH') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('Invalid login'));

    let userMessage = 'Failed to send message. Please try again later.';
    if (isConfigError) {
      userMessage =
        'Contact form email is not configured on this server. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.';
    } else if (isSmtpError) {
      userMessage =
        'Email server authentication failed. Please check your SMTP credentials.';
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        // Include detailed error in development only
        ...(process.env.NODE_ENV === 'development' && {
          debug: errorMessage,
        }),
      },
      { status: 500 }
    );
  }
}

