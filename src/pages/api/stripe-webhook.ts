import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature']!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const priceId = subscription.items.data[0].price.id;
  
  // Determine tier based on price ID
  let tier = 'free';
  if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
    tier = 'standard';
  } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    tier = 'premium';
  }

  // Update user in Firebase
  await updateDoc(doc(db, 'users', userId), {
    subscription: tier,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: 'active',
    subscriptionUpdated: new Date(),
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Handle subscription changes (upgrades, downgrades, etc.)
  const userId = subscription.metadata.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0].price.id;
  let tier = 'free';
  if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
    tier = 'standard';
  } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    tier = 'premium';
  }

  await updateDoc(doc(db, 'users', userId), {
    subscription: tier,
    subscriptionStatus: subscription.status,
    subscriptionUpdated: new Date(),
  });
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await updateDoc(doc(db, 'users', userId), {
    subscription: 'free',
    subscriptionStatus: 'cancelled',
    subscriptionUpdated: new Date(),
  });
}
