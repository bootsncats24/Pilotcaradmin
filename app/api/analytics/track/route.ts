import { NextRequest, NextResponse } from 'next/server';
import { recordPageView, VISITOR_COOKIE_NAME } from '@/lib/viewAnalytics';

export async function POST(request: NextRequest) {
  const visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  if (!visitorId) {
    return NextResponse.json({ ok: false, error: 'missing_visitor_cookie' }, { status: 400 });
  }

  try {
    const result = await recordPageView(visitorId);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
