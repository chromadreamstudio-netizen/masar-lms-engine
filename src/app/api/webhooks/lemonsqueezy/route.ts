import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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
      console.error('[Webhook Error] Missing signature or secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error('[Webhook Error] Invalid signature match');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customerEmail = payload.data.attributes.user_email.toLowerCase().trim();

    console.log(`[Webhook Radar] Event: ${eventName} | Email: ${customerEmail}`);

    if (eventName === 'order_created') {
      const productId = payload.data.attributes.first_order_item.product_id.toString();
      console.log(`[Webhook Radar] Product ID bought: ${productId}`);
      
      if (productId === PYTHON_COURSE_ID) {
        
        // 1. البحث عن الطالب
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (profileError || !profile) {
          console.error(`[Webhook Error] Student profile not found for email: ${customerEmail}`);
          return NextResponse.json({ message: 'Profile not found' }, { status: 200 });
        }

        // 2. البحث عن الكورس بالـ Slug (الطريقة الهندسية الصحيحة والآمنة)
        const { data: course, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id')
          .eq('slug', 'ai-programming')
          .single();

        if (courseError || !course) {
          console.error(`[Webhook Error] Course with slug 'ai-programming' not found in database!`);
          return NextResponse.json({ message: 'Course not found' }, { status: 200 });
        }

        // 3. تسجيل الطالب في الكورس
        const { error: insertError } = await supabaseAdmin.from('enrollments').upsert({
          student_id: profile.id,
          course_id: course.id,
          progress: 0
        }, { onConflict: 'student_id, course_id' });

        if (insertError) {
          console.error(`[Webhook Error] Failed to insert enrollment:`, insertError);
          return NextResponse.json({ message: 'Enrollment failed' }, { status: 500 });
        }

        console.log(`✅ [Webhook Success] Student ${customerEmail} enrolled successfully in course!`);
      }
    } 
    
    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook Fatal Error]:', error.message);
    return NextResponse.json({ message: 'Webhook failed' }, { status: 500 });
  }
}