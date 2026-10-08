import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, PlayCircle, Award, LayoutDashboard } from 'lucide-react';

export const revalidate = 0; // إلغاء التخزين المؤقت لجلب أحدث البيانات دائماً

export default async function DashboardPage() {
  // التعديل تم هنا: إضافة await
  const cookieStore = await cookies();

  // 1. إنشاء عميل Supabase على جانب الخادم
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

  // 2. التحقق من جلسة المستخدم الحالي
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // 3. جلب بيانات الاشتراكات والكورسات المرتبطة بالمستخدم
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      status,
      enrolled_at,
      courses (
        id,
        title,
        slug,
        description,
        thumbnail_url,
        modules (
          id,
          lessons (
            id
          )
        )
      )
    `)
    .eq('user_id', user.id);

  // 4. جلب سجل تقدم الطالب في الدروس
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, is_completed')
    .eq('user_id', user.id);

  const completedLessonIds = new Set(
    progressData?.filter((p) => p.is_completed).map((p) => p.lesson_id) || []
  );

  // حساب الإحصائيات العامة
  const totalEnrolled = enrollments?.length || 0;
  const totalCompletedLessons = completedLessonIds.size;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl" dir="rtl">
      {/* الترويسة الرئيسية */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <LayoutDashboard className="w-5 h-5" />
            <span>محرك مسار الذكي | MASAR AI</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            مرحباً بك، {user.user_metadata?.full_name || user.email?.split('@')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            تابع تقدمك الدراسي واستكمل دروسك من حيث توقفت.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <BookOpen className="w-4 h-4" />
            استكشاف الكورسات
          </Link>
        </div>
      </header>

      {/* بطاقات الإحصائيات السريعة (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">الكورسات المسجلة</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{totalEnrolled}</h3>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">الدروس المكتملة</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{totalCompletedLessons}</h3>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">حالة الحساب</p>
            <h3 className="text-lg font-bold text-amber-300 mt-0.5">طالب نشط</h3>
          </div>
        </div>
      </div>

      {/* قسم الكورسات النشطة */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          دوراتي التدريبية
        </h2>

        {!enrollments || enrollments.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-1">لم تسجل في أي كورس بعد</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              استكشف مكتبة الكورسات المتاحة وابدأ رحلة التعلم مع معلم مسار الذكي.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition border border-slate-700"
            >
              تصفح الكورسات المتاحة
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item: any) => {
              const course = item.courses;
              if (!course) return null;

              // تجميع كافة الدروس لحساب نسبة الإنجاز
              const allLessons = course.modules?.flatMap((m: any) => m.lessons || []) || [];
              const totalCourseLessons = allLessons.length;
              const completedInCourse = allLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
              const progressPercentage = totalCourseLessons > 0 
                ? Math.round((completedInCourse / totalCourseLessons) * 100) 
                : 0;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 group"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {course.slug || 'كورس مسار'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {completedInCourse} / {totalCourseLessons} درس
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                      {course.description || 'لا يوجد وصف متاح لهذا الكورس حالياً.'}
                    </p>

                    {/* شريط التقدم */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">نسبة الإنجاز</span>
                        <span className="text-indigo-400">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/50 border-t border-slate-800/80">
                    <Link
                      href={`/learn/${course.slug || course.id}`}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <PlayCircle className="w-4 h-4" />
                      متابعة التعلم
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}