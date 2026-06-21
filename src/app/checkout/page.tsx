"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { getProductById } from '@/lib/products';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const amountParam = searchParams.get('amount');
  
  const product = productId ? getProductById(productId) : null;
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const price = product?.discountPrice || product?.price || (amountParam ? parseFloat(amountParam) : 0);
  const productName = product?.name || 'Product Order';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!email || !email.includes('@')) {
      setPaymentError('Please enter a valid email address');
      return;
    }

    if (!window.PaystackPop) {
      setPaymentError('Paystack failed to load. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const handler = window.PaystackPop.newTransaction({
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      amount: Math.round(price * 100), // Convert to kobo
      email: email,
      label: productName,
      onSuccess: (transaction: any) => {
        setIsProcessing(false);
        setPaymentSuccess(true);
      },
      onCancel: () => {
        setIsProcessing(false);
        setPaymentError('Payment was cancelled');
      },
      onError: (error: any) => {
        setIsProcessing(false);
        setPaymentError(error.message || 'Payment failed. Please try again.');
      }
    });

    handler.init(window);
    handler.openIframe({
      // Inline embed options
      style: {
        popup: true
      }
    });
  };

  if (!product && !amountParam) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="font-headline text-3xl font-bold">No Order Found</h1>
            <p className="text-muted-foreground">No product or amount specified for checkout.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        
        <main className="flex-grow pt-24 pb-20 bg-gradient-to-tr from-[#FAF8F5] via-white to-[#F5F8FA]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10 space-y-3">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl font-light">
                Complete your order by filling the form below
              </p>
              <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-2 md:p-4">
              <iframe 
                src="https://surveyheart.com/form/6a3747df3b653671dbb81f76" 
                className="w-full h-[750px] border-0 rounded-2xl" 
                title="SurveyHeart Order Form"
                allow="geolocation"
              >
                Loading form...
              </iframe>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex p-3 bg-primary/10 text-primary rounded-full mb-2">
              <CreditCard className="w-8 h-8" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Secure Checkout
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-light">
              Complete payment to proceed with your order
            </p>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-bold mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{productName}</span>
                <span className="font-bold text-2xl">${price.toFixed(2)}</span>
              </div>
            </div>

            {paymentError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {paymentError}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <button
                onClick={handlePayment}
                disabled={isProcessing || !email}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Pay $${price.toFixed(2)} with Paystack`}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Paystack encryption</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}