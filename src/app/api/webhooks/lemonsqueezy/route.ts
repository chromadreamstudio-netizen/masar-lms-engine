import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PYTHON_COURSE_ID = '1436914';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
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
    const customerEmail = payload.data.attributes.user_email.toLowerCase().trim();

    console.log(`\n\n=== [Webhook Radar] New Event Received ===`);
    console.log(`Event: ${eventName} | Email: ${customerEmail}`);

    if (eventName === 'order_created') {
      const productId = payload.data.attributes.first_order_item.product_id.toString();

      if (productId === PYTHON_COURSE_ID) {
        // 1. البحث في نظام Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = users.find(u => u.email === customerEmail);

        if (!authUser) {
           console.error(`[Webhook Fatal Error] User NOT FOUND in auth.users`);
           return NextResponse.json({ message: 'User must sign up first' }, { status: 200 });
        }

        // 2. التحقق من Profile
        let { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('id', authUser.id).single();

        if (!profile) {
            const { data: newProfile } = await supabaseAdmin
              .from('profiles')
              .insert({ id: authUser.id, full_name: 'طالب مسار', role: 'student', email: customerEmail })
              .select('id')
              .single();
            profile = newProfile;
        }

        // 3. البحث عن الكورس
        const { data: course, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id')
          .eq('slug', 'ai-programming')
          .single();

        if (courseError || !course) {
          return NextResponse.json({ message: 'Course not found' }, { status: 200 });
        }
        
        // 🚀 هذا هو الشرط الجديد الذي يرضي TypeScript ويمنع الخطأ
        if (!profile || !profile.id) {
           console.error(`[Webhook Fatal Error] Profile is undefined before enrollment`);
           return NextResponse.json({ message: 'Profile undefined' }, { status: 500 });
        }

        // 4. تسجيل الطالب
        console.log(`[Webhook Radar] Inserting into enrollments for user_id: ${profile.id}`);
        const { error: insertError } = await supabaseAdmin.from('enrollments').insert({
          user_id: profile.id, 
          course_id: course.id
        });

        if (insertError) {
          console.error(`[Webhook Fatal Error] Failed to enroll student:`, insertError);
          return NextResponse.json({ message: 'Enrollment failed' }, { status: 500 });
        }

        console.log(`\n✅ [Webhook Radar] SUCCESS! Student ${customerEmail} is fully enrolled.\n`);
      }
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (error: any) {
    console.error('\n[Webhook Fatal Error] Unhandled Exception:', error.message);
    return NextResponse.json({ message: 'Webhook failed' }, { status: 500 });
  }
}