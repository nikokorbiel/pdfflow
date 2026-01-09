import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  sendWelcomeEmail,
  sendUsageLimitEmail,
  sendProWelcomeEmail,
  sendCancellationEmail,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only allow authenticated users or internal calls with secret
    const authHeader = request.headers.get('authorization');
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const isInternalCall = internalSecret && authHeader === `Bearer ${internalSecret}`;

    if (!user && !isInternalCall) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, email, name, endDate } = body;

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type, email' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(email, name);
        break;
      case 'usage_limit':
        result = await sendUsageLimitEmail(email, name);
        break;
      case 'pro_welcome':
        result = await sendProWelcomeEmail(email, name);
        break;
      case 'cancellation':
        result = await sendCancellationEmail(email, name, endDate);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
