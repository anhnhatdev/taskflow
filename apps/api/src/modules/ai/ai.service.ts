import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function suggestTaskCategorization(title: string, description: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert project manager. Given the following task title and description, 
      suggest the best priority, status, and tag labels.
      
      Task Title: ${title}
      Task Description: ${description}
      
      Valid Priorities: URGENT, HIGH, MEDIUM, LOW, NO_PRIORITY
      Valid Statuses: BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE
      
      Return ONLY a JSON object with keys: priority, status, suggestedLabels (array of strings).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse AI suggestion');
  } catch (err) {
    console.error('[AI Service] Failed to get suggestions', err);
    return null;
  }
}
