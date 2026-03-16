import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Get password from env, removing quotes if present
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_PASSWORD = ADMIN_PASSWORD_RAW.replace(/^["']|["']$/g, ''); // Remove surrounding quotes if present

// Log on module load to verify env var is loaded (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Admin password loaded:', ADMIN_PASSWORD ? 'Yes (length: ' + ADMIN_PASSWORD.length + ')' : 'No - using default');
}

// Simple session token generation
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Login attempt - Password received length:', password?.length);
      console.log('Expected password length:', ADMIN_PASSWORD?.length);
      console.log('Admin password from env:', ADMIN_PASSWORD ? 'Set' : 'NOT SET - using default');
      console.log('Passwords match:', password === ADMIN_PASSWORD);
    }

    // Compare password (in production, use bcrypt for hashing)
    if (password === ADMIN_PASSWORD) {
      const sessionToken = generateSessionToken();
      const cookieStore = await cookies();
      
      // Set session cookie (expires in 24 hours)
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return NextResponse.json({ success: true });
    } else {
      // In development, provide more info
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Invalid password. Expected length: ${ADMIN_PASSWORD?.length}, Received length: ${password?.length}. Make sure ADMIN_PASSWORD is set in .env.local and the server is restarted.`
        : 'Invalid password';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (session) {
    return NextResponse.json({ authenticated: true });
  } else {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  // Logout - clear session
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
