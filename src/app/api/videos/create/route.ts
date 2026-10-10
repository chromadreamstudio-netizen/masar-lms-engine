import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    // 1. التحقق من أن المستخدم مسجل دخول (أمان)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 });
    }

    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;

    if (!libraryId || !apiKey) {
       return NextResponse.json({ error: 'مفاتيح Bunny.net غير متوفرة' }, { status: 500 });
    }

    // 2. الطلب من Bunny.net إنشاء مساحة للفيديو الجديد
    const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ title: title })
    });

    const data = await response.json();
    
    // 3. إعادة معرّف الفيديو (guid) ومفتاح الرفع المؤقت للمتصفح ليبدأ الرفع المباشر
    return NextResponse.json({ 
      videoId: data.guid,
      libraryId: libraryId,
      uploadKey: apiKey // نمرره للمدرس المسجل فقط ليتمكن متصفحه من الرفع المباشر
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}