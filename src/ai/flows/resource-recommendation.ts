'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending alternative resources
 * (e.g., study rooms) if the initially selected resource is unavailable.
 *
 * - recommendAlternativeResources - A function that takes resource criteria and
 *   availability and suggests suitable alternatives.
 * - RecommendAlternativeResourcesInput - The input type for the
 *   recommendAlternativeResources function.
 * - RecommendAlternativeResourcesOutput - The return type for the
 *   recommendAlternativeResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendAlternativeResourcesInputSchema = z.object({
  unavailableResource: z.string().describe('The name of the resource that is unavailable.'),
  preferredCapacity: z.number().describe('The preferred capacity of the resource.'),
  locationPreferences: z.string().describe('The preferred location (e.g., floor) of the resource.'),
  availableTimeSlot: z.string().describe('The time slot for which the resource is needed.'),
  purpose: z.string().describe('The intended purpose of the resource (e.g., group study).'),
});

export type RecommendAlternativeResourcesInput = z.infer<
  typeof RecommendAlternativeResourcesInputSchema
>;

const RecommendAlternativeResourcesOutputSchema = z.object({
  alternativeResources: z
    .array(z.string())
    .describe('A list of recommended alternative resources.'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these resources are recommended, considering availability, capacity, location, and stated purpose.'
    ),
});

export type RecommendAlternativeResourcesOutput = z.infer<
  typeof RecommendAlternativeResourcesOutputSchema
>;

export async function recommendAlternativeResources(
  input: RecommendAlternativeResourcesInput
): Promise<RecommendAlternativeResourcesOutput> {
  return recommendAlternativeResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendAlternativeResourcesPrompt',
  input: {schema: RecommendAlternativeResourcesInputSchema},
  output: {schema: RecommendAlternativeResourcesOutputSchema},
  prompt: `You are a helpful AI assistant designed to suggest alternative resources, such as study rooms, when a user's first choice is unavailable.

  The user's preferred resource, {{unavailableResource}}, is not available during the timeslot: {{availableTimeSlot}}.

  Consider the following requirements when suggesting alternatives:
  - The alternative resources should have a similar capacity to the preferred capacity ({{preferredCapacity}}).
  - The alternative resources should be located in the preferred location ({{locationPreferences}}), if possible.
  - The alternative resources should be suitable for the intended purpose ({{purpose}}).
  - Only suggest resources that are available during the same time slot.

  Provide a list of alternative resource names and a brief explanation of why each resource is recommended. 
  The reasoning should clearly state how each recommended resource meets the stated requirement, or justify cases when a requirement is not perfectly met.
  `,
});

const recommendAlternativeResourcesFlow = ai.defineFlow(
  {
    name: 'recommendAlternativeResourcesFlow',
    inputSchema: RecommendAlternativeResourcesInputSchema,
    outputSchema: RecommendAlternativeResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
