
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Heart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-2",
      isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            Elegance <span className="text-foreground">Boutique</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">Shop</Link>
          <Link href="/shop?category=Handbags" className="text-sm font-medium hover:text-primary transition-colors">Handbags</Link>
          <Link href="/shop?category=High Heels" className="text-sm font-medium hover:text-primary transition-colors">High Heels</Link>
          <Link href="/shop?category=Clutch Bags" className="text-sm font-medium hover:text-primary transition-colors">Clutches</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="w-5 h-5" />
          </Button>
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-background z-[60] transition-transform duration-300 md:hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex justify-between items-center border-b">
          <span className="font-headline text-xl font-bold">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <div className="flex flex-col p-6 space-y-6">
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">All Collections</Link>
          <Link href="/shop?category=Handbags" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Handbags</Link>
          <Link href="/shop?category=Clutch Bags" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Clutch Bags</Link>
          <Link href="/shop?category=Tote Bags" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Tote Bags</Link>
          <Link href="/shop?category=High Heels" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">High Heels</Link>
          <Link href="/shop?category=Sandals" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Sandals</Link>
          <hr />
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="text-lg text-muted-foreground">My Account</Link>
          <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-lg text-muted-foreground">Wishlist</Link>
        </div>
      </div>
    </header>
  );
}
