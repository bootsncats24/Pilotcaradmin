import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getViewStats } from '@/lib/viewAnalytics';

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get('admin_session');
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getViewStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}
