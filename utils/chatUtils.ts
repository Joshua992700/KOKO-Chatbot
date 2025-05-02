export const generateResponse = (userMessage: string): string => {
    // This is a simple response generator for demo purposes
    // In a real app, this would connect to an actual AI service
    
    const lowercasedMessage = userMessage.toLowerCase();
    
    // Common greetings
    if (lowercasedMessage.includes('hello') || 
        lowercasedMessage.includes('hi') || 
        lowercasedMessage.includes('hey')) {
      return "Hello there! How can I assist you today?";
    }
    
    // Asking about the assistant
    if (lowercasedMessage.includes('who are you') || 
        lowercasedMessage.includes('what are you') ||
        lowercasedMessage.includes('tell me about yourself')) {
      return "I'm KOKO, your AI assistant designed to help answer questions and provide information. I was created to offer a friendly, conversational interface for accessing knowledge and getting things done.";
    }
    
    // Questions about capabilities
    if (lowercasedMessage.includes('what can you do') || 
        lowercasedMessage.includes('help me with')) {
      return "I can help you with information on various topics, answer questions, provide suggestions, assist with creative tasks like writing or brainstorming, and much more. Feel free to ask me anything!";
    }
    
    // Thank you responses
    if (lowercasedMessage.includes('thank') || 
        lowercasedMessage.includes('thanks')) {
      return "You're welcome! I'm happy to help. Is there anything else you'd like to know?";
    }
    
    // Default responses for unknown inputs
    const defaultResponses = [
      "That's an interesting question. Let me think about how to address that...",
      "I understand you're asking about that. Here's what I can tell you...",
      "Thanks for your question. I'd approach this by considering multiple perspectives...",
      "That's a thoughtful inquiry. Here's my response based on what I know...",
      "I appreciate your curiosity. Let me share some information on that topic..."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };