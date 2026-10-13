import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// إنشاء اتصال بصلاحيات عليا (Admin) لقاعدة البيانات لكي نتمكن من التعديل الآلي
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    // 1. التقاط البيانات القادمة من بوابات الدفع
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || ''; 

    // 2. التحقق الأمني: التشفير (هل الرسالة فعلاً من Lemon Squeezy؟)
    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. تحليل البيانات لمعرفة نوع الحدث (شراء كورس أم اشتراك مدرس؟)
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customerEmail = payload.data.attributes.user_email;

    console.log(`[Webhook Radar] Received: ${eventName} for ${customerEmail}`);

    // ==========================================
    // توجيه الحدث حسب نوعه (Routing)
    // ==========================================

    if (eventName === 'order_created') {
      // 🟢 حالة (1): طالب اشترى كورس لمرة واحدة
      const productId = payload.data.attributes.first_order_item.product_id;
      // لاحقاً سنكتب هنا كود إضافة الطالب للكورس
      console.log('Action: Give access to course', productId);
    } 
    
    else if (eventName === 'subscription_created') {
      // 🟢 حالة (2): مدرس اشترك في باقة "مسار برو"
      const productId = payload.data.attributes.product_id;
      // لاحقاً سنكتب هنا كود ترقية حساب المدرس
      console.log('Action: Upgrade teacher account to PRO');
    }

    return NextResponse.json({ message: 'Webhook received securely' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}