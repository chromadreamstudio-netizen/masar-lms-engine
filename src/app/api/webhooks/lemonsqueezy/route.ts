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

    console.log(`[Webhook Radar] Event: ${eventName} | Email: ${customerEmail}`);

    if (eventName === 'order_created') {
      const productId = payload.data.attributes.first_order_item.product_id.toString();
      
      if (productId === PYTHON_COURSE_ID) {
        
        // 🚀 الحل الجذري: البحث في جدول المستخدمين الأصلي (auth.users)
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        
        const authUser = users.find(u => u.email === customerEmail);

        if (!authUser) {
           console.error(`[Webhook Error] User not found in auth system for email: ${customerEmail}`);
           return NextResponse.json({ message: 'User must sign up first' }, { status: 200 });
        }

        // التحقق من وجود Profile، وإنشائه إذا لم يكن موجوداً
        let { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', authUser.id)
          .single();

        if (!profile) {
            console.log(`[Webhook Fix] Profile missing. Creating profile for ${customerEmail}...`);
            const { data: newProfile, error: profileInsertError } = await supabaseAdmin
              .from('profiles')
              .insert({ id: authUser.id, full_name: 'طالب مسار', role: 'student', email: customerEmail }) // أضفت الإيميل هنا للاحتياط
              .select('id')
              .single();
              
            if (profileInsertError) {
                console.error(`[Webhook Error] Could not create profile:`, profileInsertError);
                return NextResponse.json({ message: 'Failed to create profile' }, { status: 500 });
            }
            profile = newProfile;
        }

        // البحث عن الكورس
        const { data: course, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id')
          .eq('slug', 'ai-programming')
          .single();

        if (courseError || !course) {
          console.error(`[Webhook Error] Course not found!`);
          return NextResponse.json({ message: 'Course not found' }, { status: 200 });
        }

        // تسجيل الطالب
        const { error: insertError } = await supabaseAdmin.from('enrollments').upsert({
          student_id: profile.id,
          course_id: course.id,
          progress: 0
        }, { onConflict: 'student_id, course_id' });

        if (insertError) {
          console.error(`[Webhook Error] Failed to enroll:`, insertError);
          return NextResponse.json({ message: 'Enrollment failed' }, { status: 500 });
        }

        console.log(`✅ [Webhook Success] Student enrolled successfully!`);
      }
    } 
    
    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook Fatal Error]:', error.message);
    return NextResponse.json({ message: 'Webhook failed' }, { status: 500 });
  }
}