
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

import { ALL_PRODUCTS } from '@/lib/products';

const FEATURED_CATEGORIES = [
  { name: 'Handbags', img: PlaceHolderImages.find(p => p.id === 'cat-handbags')?.imageUrl },
  { name: 'High Heels', img: PlaceHolderImages.find(p => p.id === 'cat-heels')?.imageUrl },
  { name: 'Clutch Bags', img: PlaceHolderImages.find(p => p.id === 'product-1')?.imageUrl },
  { name: 'Tote Bags', img: PlaceHolderImages.find(p => p.id === 'product-2')?.imageUrl },
];

const MOCK_TRENDING_PRODUCTS = ALL_PRODUCTS.filter(p => p.isTrending).slice(0, 4);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src={PlaceHolderImages.find(p => p.id === 'hero-1')?.imageUrl || ''} 
              alt="Luxury Fashion" 
              fill
              priority
              className="object-cover brightness-75 scale-105 animate-pulse-slow"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl text-white space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              <span className="bg-accent px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full">New Season Arrival</span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg">
                The Essence of <br />
                <span className="text-accent italic">Sophistication</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-light max-w-lg drop-shadow">
                Discover our exclusive collection of premium handbags and couture footwear designed for the modern woman who values timeless elegance.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/shop">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-14 rounded-full text-lg shadow-xl">
                    Shop Collection
                  </Button>
                </Link>
                <Link href="/shop?category=Handbags">
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20 px-8 h-14 rounded-full text-lg shadow-xl">
                    New Handbags
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline text-4xl font-bold">Curated Categories</h2>
              <div className="w-24 h-1 bg-accent mx-auto"></div>
              <p className="text-muted-foreground max-w-xl mx-auto">Explore our range of meticulously crafted fashion essentials, categorized to suit your every style need.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURED_CATEGORIES.map((cat, idx) => (
                <Link key={idx} href={`/shop?category=${cat.name}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-md">
                  <Image 
                    src={cat.img || ''} 
                    alt={cat.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.85]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-white font-headline text-2xl font-bold mb-2">{cat.name}</h3>
                    <span className="text-white/80 text-sm flex items-center gap-2 group-hover:text-accent transition-colors">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-accent/10 flex items-center justify-center rounded-full mx-auto">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold">Fast Delivery</h3>
                <p className="text-muted-foreground">Reliable delivery across Ghana.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-accent/10 flex items-center justify-center rounded-full mx-auto">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold">Secure Payment</h3>
                <p className="text-muted-foreground">Your transactions are secured with military-grade encryption via Paystack.</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-accent/10 flex items-center justify-center rounded-full mx-auto">
                  <RotateCcw className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold">14-Day Returns</h3>
                <p className="text-muted-foreground">Not satisfied? Return your purchase within 14 days for a full refund.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="py-24 bg-[#FCF7F9]">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-2">
                <span className="text-primary font-bold uppercase tracking-widest text-xs">Selection</span>
                <h2 className="font-headline text-4xl font-bold">Trending Now</h2>
              </div>
              <Link href="/shop">
                <Button variant="link" className="text-primary text-lg">
                  View All Collection <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {MOCK_TRENDING_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Banner */}
        <section className="relative h-[60vh] bg-black overflow-hidden flex items-center">
          <div className="absolute inset-0 opacity-60">
            <Image 
              src={PlaceHolderImages.find(p => p.id === 'hero-1')?.imageUrl || ''} 
              alt="Exclusive" 
              fill 
              className="object-cover object-top"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
              <h2 className="font-headline text-4xl md:text-6xl text-white font-bold">Exclusive Luxury Experience</h2>
              <p className="text-xl text-white/80 font-light">Join the Elegance Club and enjoy early access to seasonal sales, members-only collections, and complimentary styling sessions.</p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-14 rounded-full text-lg shadow-2xl">
                Join Membership Now
              </Button>
            </div>
          </div>
        </section>
        
        {/* Instagram style gallery */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-2">
              <h2 className="font-headline text-4xl font-bold">Follow @EleganceBoutique</h2>
              <p className="text-muted-foreground">Share your look with #EleganceStyle to be featured.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
               {[
                 '/images/bags/bag 5.jpg',
                 '/images/foot/w 4.jpg',
                 '/images/bags/bag 6.jpg',
                 '/images/foot/w 5.jpg',
                 '/images/bags/bag 7.jpg',
                 '/images/foot/w 6.jpg'
               ].map((imgUrl, i) => (
                 <div key={i} className="aspect-square relative group overflow-hidden bg-muted">
                    <Image 
                      src={imgUrl} 
                      alt={`Social Gallery Image ${i + 1}`} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
