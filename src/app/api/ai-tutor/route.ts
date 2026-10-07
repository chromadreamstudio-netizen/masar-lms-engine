import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, lessonTitle } = await req.json();

    // هنا نضع الاستجابة التفاعلية الفورية مع إمكانية ربط OpenAI/Gemini API مستقبلاً
    const aiResponse = `بناءً على الشرح الموجود في درس "${lessonTitle}":
    
${message.includes('API') 
  ? 'واجهات الـ API تتيح للمنصة التفاعل المباشر مع نماذج الذكاء الاصطناعي مثل OpenAI و Gemini لإرجاع الإجابات فورياً للطالب مع الحفاظ على سياق الدرس.' 
  : 'سؤال ممتاز! هذا المفهوم يعتمد على هيكلة البيانات المعرفية وتدفق الكود بشكل نظامي لضمان سرعة الاستجابة.'}`;

    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}