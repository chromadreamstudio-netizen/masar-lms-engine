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
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

    if (!signature || !secret) {
      console.error('[Webhook Fatal Error] Missing signature or secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      console.error('[Webhook Fatal Error] Invalid signature match');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customerEmail = payload.data.attributes.user_email.toLowerCase().trim();

    console.log(`\n\n=== [Webhook Radar] New Event Received ===`);
    console.log(`Event: ${eventName} | Email: ${customerEmail}`);

    if (eventName === 'order_created') {
      const productId = payload.data.attributes.first_order_item.product_id.toString();
      console.log(`Product ID Bought: ${productId}`);

      if (productId === PYTHON_COURSE_ID) {
        console.log(`[Webhook Radar] Valid Product ID. Initiating User Search...`);

        // 1. البحث في جدول المستخدمين الأصلي (auth.users)
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
          console.error(`[Webhook Fatal Error] Error fetching auth users:`, authError);
          return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
        }

        const authUser = users.find(u => u.email === customerEmail);

        if (!authUser) {
           console.error(`[Webhook Fatal Error] User NOT FOUND in auth.users for email: ${customerEmail}. They MUST sign up first.`);
           return NextResponse.json({ message: 'User must sign up first' }, { status: 200 });
        }

        console.log(`[Webhook Radar] User Found in auth.users (ID: ${authUser.id}). Proceeding to Profile Check...`);

        // 2. التحقق من وجود Profile
        let { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', authUser.id)
          .single();

        if (!profile) {
            console.log(`[Webhook Radar] Profile missing. Creating new profile for user ${authUser.id}...`);
            const { data: newProfile, error: profileInsertError } = await supabaseAdmin
              .from('profiles')
              .insert({ id: authUser.id, full_name: 'طالب مسار', role: 'student', email: customerEmail })
              .select('id')
              .single();

            if (profileInsertError) {
                console.error(`[Webhook Fatal Error] Could not create profile:`, profileInsertError);
                return NextResponse.json({ message: 'Failed to create profile' }, { status: 500 });
            }
            profile = newProfile;
            console.log(`[Webhook Radar] Profile created successfully (ID: ${profile.id}).`);
        } else {
             console.log(`[Webhook Radar] Profile found (ID: ${profile.id}).`);
        }

        // 3. البحث عن الكورس باستخدام الـ slug المؤكد
        console.log(`[Webhook Radar] Searching for course with slug: ai-programming...`);
        const { data: course, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id')
          .eq('slug', 'ai-programming')
          .single();

        if (courseError || !course) {
          console.error(`[Webhook Fatal Error] Course 'ai-programming' NOT FOUND in database!`, courseError);
          return NextResponse.json({ message: 'Course not found' }, { status: 200 });
        }
        
        console.log(`[Webhook Radar] Course found (ID: ${course.id}). Initiating Enrollment...`);

        // 4. تسجيل الطالب أخيرًا
        const { error: insertError } = await supabaseAdmin.from('enrollments').upsert({
          student_id: profile.id,
          course_id: course.id,
          progress: 0
        }, { onConflict: 'student_id, course_id' });

        if (insertError) {
          console.error(`[Webhook Fatal Error] Failed to enroll student in course:`, insertError);
          return NextResponse.json({ message: 'Enrollment failed' }, { status: 500 });
        }

        console.log(`\n✅ [Webhook Radar] SUCCESS! Student ${customerEmail} is fully enrolled in the course.\n`);
      }
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (error: any) {
    console.error('\n[Webhook Fatal Error] Unhandled Exception:', error.message);
    return NextResponse.json({ message: 'Webhook failed' }, { status: 500 });
  }
}