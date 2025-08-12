# 💳 Production Payment Setup Guide

## 🚀 **Complete Stripe Integration for Real Payments**

### 1. **Stripe Account Setup**

1. **Create Stripe Account**: https://dashboard.stripe.com/register
2. **Business Information**: Complete your business profile
3. **Bank Account**: Add your bank account for payouts
4. **Tax Information**: Complete tax forms (W-9 for US businesses)

### 2. **Create Products & Pricing**

In your Stripe Dashboard:

1. **Go to Products** → Create Product
2. **Standard Plan**:
   - Name: "Standard Plan"
   - Description: "Up to 10 goals, basic analytics"
   - Price: $9.99 USD, Monthly recurring
   - Copy the Price ID (starts with `price_`)

3. **Premium Plan**:
   - Name: "Premium Plan"  
   - Description: "Unlimited goals, advanced analytics, priority support"
   - Price: $19.99 USD, Monthly recurring
   - Copy the Price ID (starts with `price_`)

### 3. **Environment Variables**

Create `.env.local` file with:

```bash
# Stripe Keys (from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_live_... # Use sk_test_ for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Use pk_test_ for testing

# Product Price IDs (from Products section)
STRIPE_STANDARD_PRICE_ID=price_1234567890abcdef
STRIPE_PREMIUM_PRICE_ID=price_0987654321fedcba
NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID=price_1234567890abcdef
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_0987654321fedcba

# Webhook Secret (created in step 4)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your existing Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. **Webhook Configuration**

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add Endpoint**: `https://yourdomain.com/api/stripe-webhook`
3. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy Webhook Secret** and add to `.env.local`

### 5. **Deploy to Production**

#### **Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

#### **Option B: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
ntl deploy --prod

# Add environment variables in Netlify dashboard
```

### 6. **Testing Payments**

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 7. **Go Live Checklist**

- [ ] Business profile completed in Stripe
- [ ] Bank account verified
- [ ] Tax information submitted
- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test complete payment flow
- [ ] Set up monitoring (Stripe Dashboard → Logs)

### 8. **Legal Requirements**

- [ ] Terms of Service (include subscription terms)
- [ ] Privacy Policy (mention payment processing)
- [ ] Refund Policy
- [ ] PCI Compliance (Stripe handles this)

### 9. **Additional Features to Implement**

**Customer Portal Integration:**
- Manage subscriptions
- Update payment methods
- Download invoices
- View billing history

**Proration Handling:**
- Upgrade/downgrade mid-cycle
- Prorated charges/credits

**Failed Payment Handling:**
- Retry logic
- Email notifications
- Dunning management

**Analytics & Monitoring:**
- Revenue tracking
- Churn analysis
- Failed payment alerts

### 10. **Revenue Optimization**

**A/B Testing:**
- Pricing strategies
- Checkout flow variations
- Feature positioning

**Retention Features:**
- Pause subscription option
- Win-back campaigns
- Usage-based alerts

---

## 📊 **Expected Revenue Flow**

### **Payment Processing:**
1. User clicks "Upgrade" → Stripe Checkout
2. Payment succeeds → Webhook triggers
3. User tier updated in Firebase
4. App features unlock immediately

### **Monthly Billing:**
- Automatic recurring charges
- Failed payment handling
- Customer portal access
- Invoice generation

### **Subscription Management:**
- Users can upgrade/downgrade anytime
- Proration calculations automatic
- Customer portal for self-service

---

## 🔧 **Technical Implementation**

Your app now includes:
- ✅ Stripe Checkout integration
- ✅ Webhook handling for subscription events
- ✅ Customer Portal for subscription management
- ✅ Firebase user tier synchronization
- ✅ Real-time feature access control

**Next Steps:**
1. Set up your Stripe account
2. Configure environment variables
3. Deploy to production
4. Test with real payments (use test mode first!)

**Revenue Potential:**
- Standard Plan: $9.99/month × subscribers
- Premium Plan: $19.99/month × subscribers
- Average SaaS conversion: 2-5% of free users upgrade
- Target: $1,000+ MRR with 100+ premium subscribers

Ready to start collecting real revenue! 🚀
