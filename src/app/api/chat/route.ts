import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. فحص وجود المفتاح (ميزة ممتازة من كودك القديم)
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: 'مرحباً بك! المعلم الذكي يعمل في الوضع التجريبي. للحصول على إجابات مخصصة للكورس، يرجى تفعيل GOOGLE_API_KEY في إعدادات Vercel.'
      });
    }

    // 2. استقبال البيانات من قاعة درس الطالب
    const body = await req.json();
    const { message, systemInstruction, knowledge } = body;

    // 3. الاتصال بالمكتبة الرسمية لجوجل
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // 4. بناء العقل الذكي (هنا يكمن السحر الحقيقي للمنصة!)
    const fullPrompt = `
      التعليمات الصارمة لك من المحاضر: 
      ${systemInstruction || 'أنت مساعد تدريس ذكي في منصة مسار العالمية (MASAR). أجب على الطالب بأسلوب مشجع ومختصر باللغة العربية.'}
      
      المادة العلمية المرفقة للكورس (يجب أن تستند إجابتك على هذا المحتوى إن وجد): 
      ${knowledge || 'لا توجد مادة علمية مرفقة، اعتمد على خبرتك العامة ولكن بأسلوب أكاديمي مبسط.'}
      
      ---
      سؤال الطالب الحالي: ${message}
    `;

    // 5. توليد الرد
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الاتصال بالمعلم الذكي. يرجى المحاولة مرة أخرى.' }, { status: 500 });
  }
}