import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// AI Tutor Chat Endpoint
export async function POST(request: Request) {
  try {
    const { message, context, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = `You are an AI Learning Assistant for NextGen Global LMS. You are an expert tutor specialized in:
- Web Development (React, Next.js, TypeScript, Node.js)
- AI & Machine Learning
- System Design & Architecture
- Data Science & Analytics
- UI/UX Design

Your role is to:
1. Help students understand complex concepts with clear, practical explanations
2. Provide code examples when relevant
3. Suggest learning paths and resources
4. Answer questions about course content accurately
5. Encourage students and celebrate their progress

${context ? `Course Context: ${context}` : ''}

Guidelines:
- Be concise but thorough
- Use markdown formatting for code blocks and emphasis
- Provide real-world examples
- If you don't know something, say so honestly
- Never make up information about specific course content`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: message },
      ],
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      response,
      sessionId: sessionId || `session-${Date.now()}`,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
