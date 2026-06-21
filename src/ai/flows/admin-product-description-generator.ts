'use server';
/**
 * @fileOverview An AI agent for generating luxurious and concise product descriptions for the Admin Dashboard.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - ProductDescriptionGeneratorInput - The input type for the generateProductDescription function.
 * - ProductDescriptionGeneratorOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDescriptionGeneratorInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product (e.g., Handbags, High Heels).'),
  material: z.string().describe('The primary material of the product (e.g., Italian leather, silk, sterling silver).'),
  color: z.string().describe('The color of the product (e.g., Obsidian Black, Rose Gold, Emerald Green).'),
  style: z.string().describe('The style or design of the product (e.g., minimalist, bohemian, classic, modern, avant-garde).'),
  features: z.array(z.string()).describe('A list of key features or unique selling points of the product.'),
});
export type ProductDescriptionGeneratorInput = z.infer<typeof ProductDescriptionGeneratorInputSchema>;

const ProductDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('A luxurious and concise product description.'),
});
export type ProductDescriptionGeneratorOutput = z.infer<typeof ProductDescriptionGeneratorOutputSchema>;

export async function generateProductDescription(input: ProductDescriptionGeneratorInput): Promise<ProductDescriptionGeneratorOutput> {
  return adminProductDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminProductDescriptionGeneratorPrompt',
  input: {schema: ProductDescriptionGeneratorInputSchema},
  output: {schema: ProductDescriptionGeneratorOutputSchema},
  prompt: `You are an expert copywriter for a luxury women's fashion brand called "Elegance Boutique".
Your task is to generate a concise, luxurious, and highly appealing product description based on the provided product attributes.
Emphasize elegance, sophistication, and desirability. Keep the description under 60 words.

Product Name: {{{productName}}}
Category: {{{category}}}
Material: {{{material}}}
Color: {{{color}}}
Style: {{{style}}}
Features:
{{#each features}} - {{{this}}}
{{/each}}

Generate the description now:`,
});

const adminProductDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'adminProductDescriptionGeneratorFlow',
    inputSchema: ProductDescriptionGeneratorInputSchema,
    outputSchema: ProductDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
