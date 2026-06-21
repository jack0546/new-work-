
"use client"

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const ALL_PRODUCTS = [
  { id: '1', name: 'Seraphina Leather Tote', category: 'Handbags', price: 450, images: [PlaceHolderImages[0].imageUrl], rating: 4.8 },
  { id: '2', name: 'Starlight Satin Heels', category: 'High Heels', price: 290, images: [PlaceHolderImages[1].imageUrl], rating: 5 },
  { id: '3', name: 'Midnight Velvet Clutch', category: 'Clutch Bags', price: 180, images: [PlaceHolderImages[2].imageUrl], rating: 4.5 },
  { id: '4', name: 'Azure Shoulder Bag', category: 'Shoulder Bags', price: 320, images: [PlaceHolderImages[3].imageUrl], rating: 4.7 },
  { id: '5', name: 'Pearl Embellished Sandals', category: 'Sandals', price: 210, images: [PlaceHolderImages[4].imageUrl], rating: 4.9 },
  { id: '6', name: 'Crocodile Pattern Purse', category: 'Handbags', price: 380, images: [PlaceHolderImages[5].imageUrl], rating: 4.6 },
  { id: '7', name: 'Golden Chain Clutch', category: 'Clutch Bags', price: 150, images: [PlaceHolderImages[0].imageUrl], rating: 4.2 },
  { id: '8', name: 'Suede Ankle Strap Heels', category: 'High Heels', price: 260, images: [PlaceHolderImages[1].imageUrl], rating: 4.4 },
] as any[];

const CATEGORIES = ['Handbags', 'Tote Bags', 'Clutch Bags', 'Shoulder Bags', 'High Heels', 'Sandals'];

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 space-y-4">
            <h1 className="font-headline text-4xl font-bold">Shop Collection</h1>
            <p className="text-muted-foreground">Discover the latest in premium accessories and footwear.</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-8 border-b">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-11 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 h-11 border-primary/20 bg-white">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider">Categories</h4>
                      <div className="space-y-3">
                        {CATEGORIES.map((cat) => (
                          <div key={cat} className="flex items-center space-x-2">
                            <Checkbox id={cat} />
                            <Label htmlFor={cat} className="text-base font-normal cursor-pointer">{cat}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider">Price Range</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="p1" />
                          <Label htmlFor="p1" className="text-base font-normal cursor-pointer">Under $100</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="p2" />
                          <Label htmlFor="p2" className="text-base font-normal cursor-pointer">$100 - $300</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="p3" />
                          <Label htmlFor="p3" className="text-base font-normal cursor-pointer">Over $300</Label>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-4 h-12 text-lg">Apply Filters</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-11 border-primary/20 bg-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Best Selling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {ALL_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex justify-center">
            <Button variant="outline" size="lg" className="rounded-full px-12 h-14 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
              Load More Products
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
