import { NextRequest, NextResponse } from 'next/server';
import { ALL_PRODUCTS, getProductByName } from '@/lib/products';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = item.name 
        ? getProductByName(item.name) 
        : (item.productId ? ALL_PRODUCTS.find((p) => p.id === item.productId) : null);
      
      if (product) {
        const price = product.discountPrice || product.price;
        const itemTotal = price * (item.quantity || 1);
        total += itemTotal;
        validatedItems.push({
          ...item,
          price: product.discountPrice || null,
          finalPrice: price,
          itemTotal,
        });
      } else if (item.price) {
        total += item.price * (item.quantity || 1);
        validatedItems.push(item);
      } else {
        return NextResponse.json({ error: `Product not found` }, { status: 404 });
      }
    }

    return NextResponse.json({ 
      total, 
      validatedItems,
      currency: 'GHS'
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 });
  }
}