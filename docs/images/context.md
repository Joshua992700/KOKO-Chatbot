# Chatbot Web Application Blueprint

## 1. Project Breakdown

**App Name:** ChatGenius  
**Platform:** Web application (responsive design)  
**Summary:** ChatGenius is a ChatGPT-like web application that provides conversational AI capabilities through a clean, intuitive interface. The app will feature user authentication, conversation history storage, and real-time chat interactions powered by GPT. Built with Next.js for full-stack capabilities and Supabase for backend services, it aims to deliver a seamless chat experience with persistent user data.  

**Primary Use Case:**  
- Users sign up/log in to access the chat interface  
- Engage in natural language conversations with AI  
- View and manage their conversation history  
- Access premium features (future expansion)  

**Authentication Requirements:**  
- Email/password authentication via Supabase Auth  
- Social login options (Google, GitHub)  
- Session management  
- Protected routes for authenticated users only  

## 2. Tech Stack Overview

**Frontend Framework:**  
- Next.js 14 (App Router)  
- React 18 with TypeScript  

**UI Components:**  
- Tailwind CSS for utility-first styling  
- ShadCN UI for accessible, customizable components  
- Radix UI primitives (via ShadCN)  

**Backend Services:**  
- Supabase for:  
  - PostgreSQL database (conversation history)  
  - Authentication (Auth.js/Supabase integration)  
  - Storage (future file attachments)  

**Deployment:**  
- Vercel for Next.js optimized hosting  
- Supabase project hosted on Supabase cloud  

## 3. Core Features

**1. User Authentication System**  
- Sign up with email/password or OAuth providers  
- Password reset functionality  
- Profile management  

**2. Chat Interface**  
- Real-time message streaming from GPT  
- Markdown support in responses  
- Code syntax highlighting  
- Responsive layout for all devices  

**3. Conversation Management**  
- Save full conversation history  
- Organize chats into folders/categories  
- Search past conversations  
- Delete/archive chats  

**4. Settings & Preferences**  
- Customize chat appearance (dark/light mode)  
- Set default GPT parameters (temperature, etc.)  
- Manage API connection settings  

**5. Admin Dashboard (Future)**  
- User management for admins  
- Usage analytics  
- Content moderation tools  

## 4. User Flow

1. **Landing Page**  
   - Public view with app description and CTA  
   - Login/Signup buttons  

2. **Authentication**  
   - User selects login method (email or OAuth)  
   - New users complete registration flow  
   - Redirect to chat dashboard after auth  

3. **Main Chat Interface**  
   - Default view shows new chat prompt  
   - Left sidebar with conversation history  
   - Central chat panel with message list  
   - Bottom input area with send button  

4. **Conversation Interaction**  
   - User types message and hits send  
   - System shows typing indicator  
   - Response streams in real-time  
   - Conversation automatically saved  

5. **History Management**  
   - User can view past conversations  
   - Filter/search through history  
   - Create folders to organize chats  

6. **Settings**  
   - Accessible via user avatar menu  
   - Appearance preferences  
   - Account management options  

## 5. Design & UI/UX Guidelines

**Layout Principles:**  
- Clean, minimalist interface focused on chat content  
- 3-column layout on desktop (sidebar-chat-settings)  
- Mobile: Collapsible sidebar with chat focus  

**Color Scheme:**  
- Primary: Indigo-600 (buttons, accents)  
- Backgrounds: Slate-50 (light), Slate-900 (dark)  
- Text: High contrast for readability  
- AI messages: Subtle blue tint  
- User messages: Neutral white/gray  

**Typography:**  
- Primary font: Inter (clean, readable sans-serif)  
- Code blocks: JetBrains Mono  
- Base size: 16px with responsive scaling  

**Interactive Elements:**  
- Buttons: Clear visual hierarchy with subtle animations  
- Input field: Persistent at bottom with rounded corners  
- Message bubbles: Distinct styling for user vs AI  

**Accessibility:**  
- WCAG AA compliance  
- Keyboard navigation support  
- ARIA labels for screen readers  
- Reduced motion preferences respected  

## 6. Technical Implementation

**Next.js App Structure:**  
```
/app
  /(auth) - Auth routes
  /(main) - Protected routes
    /chat - Main interface
    /history - Conversation list
    /settings - User preferences
  /api - Route handlers
```

**Supabase Integration:**  
1. Set up project with tables:  
   - `profiles` (user metadata)  
   - `conversations` (chat sessions)  
   - `messages` (individual messages)  

2. Implement Auth.js with Supabase adapter:  
```typescript
// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"

export const authConfig = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  // ...other config
}
```

**Chat Interface Components:**  
- `ChatWindow`: Main container with message list  
- `Message`: Individual message bubble component  
- `InputArea`: Text input with send button  
- `TypingIndicator`: Loading animation during AI response  

**API Route for Chat Completions:**  
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      stream: true
    })
  })

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream'
    }
  })
}
```

**Real-time Updates:**  
```typescript
// components/chat-window.tsx
const { data: subscription } = supabase
  .channel('conversation-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Update UI with new message
  })
  .subscribe()
```

## 7. Development Setup

**Prerequisites:**  
- Node.js 18+  
- Supabase account  
- OpenAI API key  

**Setup Instructions:**  
1. Clone repository:  
```bash
git clone https://github.com/your-repo/chatgenius.git
cd chatgenius
```

2. Install dependencies:  
```bash
npm install
```

3. Environment variables (.env.local):  
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
NEXTAUTH_SECRET=your-auth-secret
NEXTAUTH_URL=http://localhost:3000
```

4. Database setup:  
- Run SQL migrations in Supabase SQL editor  
- Enable Row Level Security with appropriate policies  

5. Run development server:  
```bash
npm run dev
```

**Deployment to Vercel:**  
1. Connect GitHub repository to Vercel  
2. Add same environment variables  
3. Set build command: `npm run build`  
4. Deploy!  

**Post-Deployment:**  
- Configure custom domain if needed  
- Set up Vercel analytics  
- Enable Supabase logging for monitoring
