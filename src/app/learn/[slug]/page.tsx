import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CourseClient from './CourseClient';

export const revalidate = 0;

export default async function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/learn/${resolvedParams.slug}`);

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      id, title, description,
      modules (
        id, title, order_index,
        lessons (id, title, video_id, order_index, is_free_preview)
      )
    `)
    .eq('slug', resolvedParams.slug)
    .single();

  if (courseError || !course) redirect('/dashboard');

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single();

  if (!enrollment || enrollment.status !== 'active') redirect('/dashboard');

  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, is_completed, last_watched_seconds')
    .eq('user_id', user.id)
    .eq('enrollment_id', enrollment.id);

  // تحويل البيانات لمصفوفة عادية لسهولة قراءتها في مكون العميل
  const progressObj = progressData?.reduce((acc: any, curr: any) => {
    acc[curr.lesson_id] = curr;
    return acc;
  }, {}) || {};

  return <CourseClient course={course} progressMap={progressObj} />;
}