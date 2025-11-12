
'use server';

import { recommendAlternativeResources, type RecommendAlternativeResourcesInput } from '@/ai/flows/resource-recommendation';
import { studentAssistant, type StudentAssistantInput } from '@/ai/flows/student-assistant';

export async function getAlternativeResources(input: RecommendAlternativeResourcesInput) {
  try {
    // Simulate a short delay for a better user experience
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await recommendAlternativeResources(input);
    return result;
  } catch (error) {
    console.error("AI recommendation error:", error);
    return {
      alternativeResources: ["Collaborative Space 204", "Media Viewing Room 310"],
      reasoning: "Sorry, we had trouble getting live recommendations. Based on your request, these are generally good alternatives for group work on the upper floors.",
    };
  }
}

export async function getAiAssistantResponse(input: StudentAssistantInput) {
  try {
    // No delay here, as Genkit flow will have its own latency
    const result = await studentAssistant(input);
    return result;
  } catch (error) {
    console.error("AI assistant error:", error);
    return {
      response: "I'm sorry, but I've encountered an unexpected issue. Please try rephrasing your request or try again later.",
    };
  }
}
