import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, PlayCircle, CheckCircle2, BrainCircuit, ListVideo } from 'lucide-react';

export const revalidate = 0;

export default async function CoursePlayerPage({ params }: { params: { slug: string } }) {
  // في Next.js 15، يجب عمل await لـ params و cookies
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

  // 1. التحقق من المستخدم
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/learn/${resolvedParams.slug}`);
  }

  // 2. جلب بيانات الكورس بناءً على الـ slug
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      modules (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          video_id,
          order_index,
          is_free_preview
        )
      )
    `)
    .eq('slug', resolvedParams.slug)
    .single();

  if (courseError || !course) {
    redirect('/dashboard'); // توجيه للوحة التحكم إذا كان الكورس غير موجود
  }

  // 3. التحقق من اشتراك الطالب في هذا الكورس
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single();

  if (!enrollment || enrollment.status !== 'active') {
    redirect('/dashboard'); // غير مشترك أو اشتراك غير نشط
  }

  // 4. جلب تقدم الطالب في هذا الكورس
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, is_completed, last_watched_seconds')
    .eq('user_id', user.id)
    .eq('enrollment_id', enrollment.id);

  const progressMap = new Map(progressData?.map((p) => [p.lesson_id, p]) || []);

  // ترتيب الفصول والدروس (لضمان العرض الصحيح)
  const sortedModules = course.modules?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
  sortedModules.forEach((m: any) => {
    m.lessons = m.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden dir-rtl" dir="rtl">
      
      {/* القسم الأيمن (الرئيسي): مشغل الفيديو والتفاصيل */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative scrollbar-hide">
        
        {/* شريط التنقل العلوي للمشغل */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="العودة للوحة التحكم"
            >
              <ChevronRight size={20} />
            </Link>
            <h1 className="text-lg font-bold text-white truncate max-w-md">
              {course.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20">
              المعلم الذكي نشط
            </span>
          </div>
        </header>

        {/* منطقة مشغل الفيديو (Placeholder حالياً) */}
        <div className="w-full bg-black aspect-video flex items-center justify-center border-b border-slate-800 relative group">
          {/* سنقوم بدمج Bunny DRM هنا لاحقاً */}
          <div className="text-center">
            <PlayCircle size={64} className="text-slate-700 mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:text-[#00a88f]" />
            <p className="text-slate-500 text-sm">منطقة العرض المحمية (Bunny DRM Video Player)</p>
          </div>
        </div>

        {/* تفاصيل الدرس الحالي */}
        <div className="p-8 max-w-5xl">
          <h2 className="text-2xl font-black text-white mb-2">الدرس الأول: دمج المعلم الذكي مع مشغل الفيديو</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            في هذا الدرس سنتعلم كيف يتفاعل الذكاء الاصطناعي مع سياق الفيديو لحظة بلحظة...
          </p>
        </div>
      </main>

      {/* القسم الأيسر: القائمة الجانبية (المحتوى + المعلم الذكي) */}
      <aside className="w-80 lg:w-96 flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0 z-20">
        
        {/* تبويبات القائمة الجانبية */}
        <div className="flex bg-slate-950 p-2 gap-2 border-b border-slate-800">
          <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-xl bg-slate-800 text-white shadow-sm transition-all">
            <ListVideo size={16} />
            محتوى الكورس
          </button>
          <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all border border-transparent">
            <BrainCircuit size={16} className="text-purple-400" />
            المعلم الذكي
          </button>
        </div>

        {/* قائمة الفصول والدروس */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {sortedModules.map((module: any, mIdx: number) => (
            <div key={module.id} className="mb-6 last:mb-0">
              <h3 className="text-sm font-bold text-slate-300 mb-3 px-2">
                {module.title}
              </h3>
              <div className="space-y-1.5">
                {module.lessons?.map((lesson: any, lIdx: number) => {
                  const progress = progressMap.get(lesson.id);
                  const isCompleted = progress?.is_completed;
                  // نفترض الدرس الأول نشط للتجربة
                  const isActive = mIdx === 0 && lIdx === 0; 

                  return (
                    <button
                      key={lesson.id}
                      className={`w-full text-right flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-indigo-600/10 border border-indigo-500/30' 
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-indigo-400' : 'border-slate-600'}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? 'text-indigo-300' : 'text-slate-300'} line-clamp-2 leading-snug`}>
                          {lesson.title}
                        </p>
                        {progress?.last_watched_seconds > 0 && !isCompleted && (
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-indigo-400 h-full w-1/3"></div> {/* قيمة تجريبية */}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}