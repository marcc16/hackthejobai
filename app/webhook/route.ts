import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { adminDb } from "@/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import stripe from "@/lib/stripe";

export const dynamic = 'force-dynamic';

// Utilidad para logs más visibles
const log = {
  info: (msg: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', '🔵 INFO:', msg);
    if (data) console.log(data);
  },
  error: (msg: string, error?: any) => {
    console.log('\x1b[31m%s\x1b[0m', '🔴 ERROR:', msg);
    if (error) console.error(error);
  },
  success: (msg: string) => {
    console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS:', msg);
  }
};

export async function GET() {
  log.info('GET request received at /webhook');
  return new NextResponse('Webhook endpoint is active', { status: 200 });
}

export async function POST(request: Request) {
  log.info('=====================================');
  log.info('Webhook POST Request Received');
  log.info('=====================================');

  try {
    // Log request details
    const headersList = headers();
    log.info('Request Headers:', {
      'content-type': headersList.get('content-type'),
      'stripe-signature': headersList.get('stripe-signature')?.substring(0, 20) + '...',
    });

    // Get and log request body
    const body = await request.text();
    log.info('Request Body Preview:', body.substring(0, 100) + '...');

    // Verify webhook signature
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const sig = headersList.get('stripe-signature');
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      log.success(`Event verified: ${event.type}`);
    } catch (err) {
      log.error('Webhook signature verification failed', err);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        log.info(`Processing checkout session: ${session.id}`);
        
        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error('No userId found in session metadata');
        }

        const interviews = session.metadata.interviews === "1" ? 1 : 10;
        log.info(`Adding ${interviews} interviews for user ${userId}`);

        await adminDb.collection("users").doc(userId).update({
          availableInterviews: FieldValue.increment(interviews),
          totalInterviews: FieldValue.increment(interviews),
        });

        log.success(`Updated interviews for user ${userId}`);
        break;

      default:
        log.info(`Unhandled event type: ${event.type}`);
    }

    log.success('Webhook processed successfully');
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log.error('Error processing webhook', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    log.info('=====================================');
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};