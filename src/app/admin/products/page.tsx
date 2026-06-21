
"use client"

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/admin-product-description-generator';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Handbags',
    material: '',
    color: '',
    style: '',
    features: '',
    price: '',
    description: ''
  });

  const handleAIInvite = async () => {
    if (!formData.name || !formData.material) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a product name and material for the AI to work with.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({
        productName: formData.name,
        category: formData.category,
        material: formData.material,
        color: formData.color || 'Standard',
        style: formData.style || 'Elegant',
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      });
      
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({
        title: "Description Generated",
        description: "AI has successfully crafted a luxurious description for your product.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-headline text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your luxury inventory and descriptions.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6">
                <Plus className="w-5 h-5" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Create New Product</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Seraphina Leather Tote" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      placeholder="e.g. Handbags" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input 
                      id="material" 
                      placeholder="e.g. Italian Calfskin Leather" 
                      value={formData.material}
                      onChange={(e) => setFormData({...formData, material: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input 
                      id="color" 
                      placeholder="e.g. Obsidian Black" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Input 
                      id="style" 
                      placeholder="e.g. Minimalist" 
                      value={formData.style}
                      onChange={(e) => setFormData({...formData, style: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Features (comma separated)</Label>
                    <Input 
                      id="features" 
                      placeholder="e.g. Gold hardware, Adjustable strap" 
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Product Description</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary gap-1.5 h-7 px-2 hover:bg-primary/10"
                        onClick={handleAIInvite}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        AI Generate
                      </Button>
                    </div>
                    <Textarea 
                      id="description" 
                      className="min-h-[150px] bg-slate-50 border-slate-200" 
                      placeholder="A luxurious description of your item..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white px-8">Save Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Luxury Leather Handbag {i}</TableCell>
                  <TableCell>Handbags</TableCell>
                  <TableCell>$299.00</TableCell>
                  <TableCell>14</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
