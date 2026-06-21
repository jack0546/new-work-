"use client"

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ALL_PRODUCTS } from '@/lib/products';

export default function HandbagsPage() {
  // Filter for all kinds of bags
  const handbagProducts = ALL_PRODUCTS.filter(p => 
    ['Handbags', 'Tote Bags', 'Shoulder Bags'].includes(p.category)
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Category Banner */}
          <div className="mb-12 py-12 px-8 rounded-3xl bg-gradient-to-r from-[#FAF6F0] to-[#F3EFE9] border border-primary/5 space-y-3">
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Collection</span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Premium Handbags</h1>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg font-light">
              Meticulously crafted leather handbags, shoulder bags, and spacious totes designed for modern elegance and functionality.
            </p>
          </div>

          {/* Grid */}
          {handbagProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No handbags found in the collection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {handbagProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
