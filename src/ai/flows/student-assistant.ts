
'use server';

/**
 * @fileOverview This file defines a Genkit flow for a student AI assistant
 * that can understand natural language queries to find and suggest resources.
 *
 * - studentAssistantFlow - A function that takes a student's query and
 *   returns a helpful response.
 * - StudentAssistantInput - The input type for the flow.
 * - StudentAssistantOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { allResources } from '@/lib/data';
import type { Resource } from '@/lib/types';
import { z } from 'genkit';

const StudentAssistantInputSchema = z.object({
  query: z.string().describe('The natural language query from the student.'),
  userId: z.string().describe('The ID of the user asking the query.'),
  userRole: z.string().describe('The role of the user (e.g., student, faculty).'),
});

export type StudentAssistantInput = z.infer<typeof StudentAssistantInputSchema>;

const StudentAssistantOutputSchema = z.object({
  response: z.string().describe('A helpful, conversational response to the student\'s query.'),
});

export type StudentAssistantOutput = z.infer<typeof StudentAssistantOutputSchema>;

export async function studentAssistant(
  input: StudentAssistantInput
): Promise<StudentAssistantOutput> {
  return studentAssistantFlow(input);
}

// Define a "tool" that the AI can use to get a list of available resources.
// This is better than just passing all resources in the prompt, as it allows
// the AI to decide when it needs this information.
const getAvailableResources = ai.defineTool(
  {
    name: 'getAvailableResources',
    description: 'Get a list of all campus resources available to the user.',
    output: { schema: z.array(z.any()) },
  },
  async () => {
    // In a real app, this might also check real-time availability.
    // For now, it just returns all student resources.
    return allResources.filter(r => r.resourceFor === 'student');
  }
);


const prompt = ai.definePrompt({
  name: 'studentAssistantPrompt',
  input: { schema: StudentAssistantInputSchema },
  output: { schema: StudentAssistantOutputSchema },
  tools: [getAvailableResources],
  prompt: `You are a friendly and helpful AI assistant for the CampusFlow platform. Your job is to help students find resources on campus.

  The student's query is: "{{query}}"

  If the student's query is a simple greeting or off-topic, provide a friendly, general response.

  If the query is about finding a resource (e.g., "find me a study room", "where can I practice basketball?"), you MUST use the 'getAvailableResources' tool to see the list of available campus resources.

  Once you have the list of resources, analyze the student's query to identify their needs (e.g., resource type, capacity, keywords like 'quiet' or 'group').
  
  Based on your analysis, provide a helpful response. Recommend 1-3 specific resources from the tool's output that best match their query.
  
  Your response should be conversational and clear. Always include the name of the recommended resource(s).
  
  Example:
  Student Query: "I need a quiet place to study for me and a friend."
  Your thought process: The user needs a 'quiet' place for 2 people. I will call getAvailableResources. From the list, 'Quiet Study Room 101' has a capacity of 4 and matches 'quiet'. This is a good fit.
  Your Response: "Of course! The 'Quiet Study Room 101' would be a great choice. It has a capacity of 4 and is perfect for focused study. You can view its schedule to book a time."
  `,
});

const studentAssistantFlow = ai.defineFlow(
  {
    name: 'studentAssistantFlow',
    inputSchema: StudentAssistantInputSchema,
    outputSchema: StudentAssistantOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
