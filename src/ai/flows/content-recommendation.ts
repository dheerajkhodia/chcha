'use server';

/**
 * @fileOverview An AI agent for generating personalized content recommendations based on viewing history.
 *
 * - generateContentRecommendations - A function that generates content recommendations.
 * - ContentRecommendationsInput - The input type for the generateContentRecommendations function.
 * - ContentRecommendationsOutput - The return type for the generateContentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentRecommendationsInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of titles of previously watched content in the room.'),
  userPreferences: z
    .string()
    .optional()
    .describe('Optional user preferences to tailor recommendations.'),
});
export type ContentRecommendationsInput = z.infer<typeof ContentRecommendationsInputSchema>;

const ContentRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of recommended content titles.'),
});
export type ContentRecommendationsOutput = z.infer<typeof ContentRecommendationsOutputSchema>;

export async function generateContentRecommendations(input: ContentRecommendationsInput): Promise<ContentRecommendationsOutput> {
  return contentRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentRecommendationsPrompt',
  input: {schema: ContentRecommendationsInputSchema},
  output: {schema: ContentRecommendationsOutputSchema},
  prompt: `You are a content recommendation expert. Based on the viewing history and user preferences, suggest content that the users might enjoy watching together.  The output should be an array of content titles.

Viewing History: {{#each viewingHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

User Preferences: {{{userPreferences}}}

Recommendations: `,
});

const contentRecommendationsFlow = ai.defineFlow(
  {
    name: 'contentRecommendationsFlow',
    inputSchema: ContentRecommendationsInputSchema,
    outputSchema: ContentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
