import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: 'مرحباً بك! المعلم الذكي يعمل في الوضع التجريبي. للحصول على إجابات مباشرة مخصصة، يرجى تفعيل GOOGLE_API_KEY في ملف .env.local'
      });
    }

    // Direct Gemini API Call using gemini-1.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `أنت معلم ذكي وخبير في أكاديمية نماء التعليمية. أجب على السؤال التالي بأسلوب مشجع ومختصر باللغة العربية:\n\n${lastUserMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'لم أتمكن من معالجة السؤال، يرجى المحاولة مرة أخرى.';

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}