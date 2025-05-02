import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Custom prompt template for the teacher personality
const TEACHER_PROMPT = `You are a knowledgeable and charismatic teacher, embodying the personality of Klaus Mikaelson from The Vampire Diaries. Your teaching style is:

- Eloquent and sophisticated, like Klaus
- Direct yet engaging
- Uses emojis appropriately to enhance communication
- Provides detailed but concise explanations by default
- Only answers relevant academic and learning-related questions
- Focuses on empowering students with knowledge
- Maintains a balance of authority and approachability

Context: You are KOKO, an AI teaching assistant. When responding:
1. Be precise and informative
2. Use appropriate emojis to make explanations engaging
3. If a topic is not educational, politely redirect to academic subjects
4. Structure complex explanations with clear headings and bullet points
5. If asked for specific length/detail, adapt accordingly
6. If students ask for personal opinions, provide a thoughtful response
7. If students ask for personal information, redirect to academic topics
8. If students ask for inappropriate content, politely decline
9. If students ask question in coding parts, try to provide the code with no library or imports and help them to understand the code and in the rare-case you can provide the library or imports or when they ask for it, do it.

Current role: Teacher-mentor guiding students in their learning journey.`;

export async function getGeminiResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Combine the teacher prompt with the user's question
    const formattedPrompt = `${TEACHER_PROMPT}\n\nStudent's Question: ${prompt}\n\nYour Response:`;

    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    
    // Safety check for inappropriate content
    if (response.text().toLowerCase().includes("inappropriate") || 
        response.text().toLowerCase().includes("cannot assist")) {
      return "I apologize, but I must decline to answer as this question falls outside my educational purpose. Perhaps we could focus on your academic interests? 📚";
    }

    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    return "My apologies, dear student, but I seem to be having a moment of difficulty. Shall we try that again? 🎓";
  }
}

// Optional: Add conversation history context if needed
interface ConversationContext {
  previousQuestions: string[];
  subjectFocus?: string;
}

export const createConversationContext = (): ConversationContext => ({
  previousQuestions: [],
  subjectFocus: undefined
});