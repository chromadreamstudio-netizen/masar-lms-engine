import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PRO_PLAN_ID = '1436897';
const PYTHON_COURSE_ID = '1436914';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || ''; 

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customerEmail = payload.data.attributes.user_email.toLowerCase().trim(); // تنظيف الإيميل

    console.log(`[Webhook Radar] Received: ${eventName} from ${customerEmail}`);

    if (eventName === 'order_created') {
      const productId = payload.data.attributes.first_order_item.product_id.toString();
      
      if (productId === PYTHON_COURSE_ID) {
        // 🚀 البحث الذكي: نبحث في جدول profiles مباشرة (أسرع وأدق)
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (profile) {
          const { data: course } = await supabaseAdmin.from('courses').select('id').eq('title', 'تعليم البرمجة').single(); // ملاحظة: عدلت الاسم بناء على صورتك
          
          if (course) {
            await supabaseAdmin.from('enrollments').upsert({
              student_id: profile.id, // نستخدم ID من الـ profile
              course_id: course.id,
              progress: 0
            }, { onConflict: 'student_id, course_id' });
            console.log(`🎓 SUCCESS: Student ${customerEmail} is now enrolled!`);
          } else {
            console.log(`⚠️ ERROR: Course not found in database.`);
          }
        } else {
           console.log(`⚠️ ERROR: No profile found for email ${customerEmail}. They need to sign up first.`);
        }
      }
    } 
    
    // إرسال رد ناجح
    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ message: 'Webhook failed' }, { status: 200 });
  }
}