import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// تعريف أرقام المنتجات (Product IDs) التي جلبناها من Lemon Squeezy
const PRO_PLAN_ID = '1434689';
const PYTHON_COURSE_ID = '1435168';

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
    const customerEmail = payload.data.attributes.user_email;

    console.log(`[Webhook Radar] Received: ${eventName} from ${customerEmail}`);

    // ==========================================
    // 🧠 العقل المدبر: تنفيذ العمليات في قاعدة البيانات
    // ==========================================

    if (eventName === 'order_created') {
      // 1️⃣ حالة شراء كورس (دفع لمرة واحدة)
      const productId = payload.data.attributes.first_order_item.product_id.toString();
      
      if (productId === PYTHON_COURSE_ID) {
        console.log(`✅ Success: Enrolling ${customerEmail} in Python Mastery Course`);
        
        // جلب معرف الطالب من قاعدة البيانات عبر إيميله
        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        const user = users?.users.find(u => u.email === customerEmail);

        if (user) {
          // جلب ID الكورس من جدول الكورسات
          const { data: course } = await supabaseAdmin.from('courses').select('id').eq('title', 'أساسيات البرمجة الذكية').single();
          
          if (course) {
            // تسجيل الطالب في الكورس فعلياً
            await supabaseAdmin.from('enrollments').upsert({
              student_id: user.id,
              course_id: course.id,
              progress: 0
            }, { onConflict: 'student_id, course_id' });
            console.log(`🎓 Student ${customerEmail} is now enrolled!`);
          }
        }
      }
    } 
    
    else if (eventName === 'subscription_created') {
      // 2️⃣ حالة اشتراك مدرس في باقة مسار برو
      const productId = payload.data.attributes.product_id.toString();
      
      if (productId === PRO_PLAN_ID) {
        console.log(`✅ Success: Upgrading ${customerEmail} to MASAR PRO`);
        
        // جلب معرف المدرس عبر إيميله
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users?.users.find(u => u.email === customerEmail);

        if (user) {
          // ترقية حساب المدرس في جدول profiles
          await supabaseAdmin.from('profiles').update({ 
            is_pro: true, 
            subscription_status: 'active' 
          }).eq('id', user.id);
          console.log(`🚀 Teacher ${customerEmail} is now PRO!`);
        }
      }
    }

    // إرسال رد ناجح لـ Lemon Squeezy لكي يغلق الطلب ولا يكرر الإرسال
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook execution error:', error.message);
    // نرجع 200 حتى لو حدث خطأ داخلي لكي لا يقوم Lemon Squeezy بحظر الـ Webhook
    return NextResponse.json({ message: 'Webhook received but execution failed' }, { status: 200 });
  }
}