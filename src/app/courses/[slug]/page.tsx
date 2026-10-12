'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Check, PlayCircle, Monitor, FileText, Infinity, ChevronRight, Bot, Loader2 } from 'lucide-react';

export default function CourseLandingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCourse = async () => {
      const resolvedParams = await params;
      const slug = resolvedParams.slug;

      const { data: courseData } = await supabase
        .from('courses')
        .select('*, profiles(full_name)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (!courseData) {
        router.push('/404');
        return;
      }
      setCourse(courseData);

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*, lessons(*)')
        .eq('course_id', courseData.id)
        .order('order_index', { ascending: true });

      setModules(modulesData || []);
      setIsLoading(false);
    };

    fetchCourse();
  }, [params, router, supabase]);

  const totalLessons = modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  // דالة التسجيل في الكورس
  const handleEnrollment = async () => {
    setIsEnrolling(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }
    
    // تسجيل الطالب في قاعدة البيانات
    const { error } = await supabase.from('enrollments').upsert({
      student_id: user.id,
      course_id: course.id,
      progress: 0
    }, { onConflict: 'student_id, course_id' });

    if (error) {
      alert('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
      setIsEnrolling(false);
      return;
    }

    // التوجيه فوراً لقاعة الدرس
    router.push(`/learn/${course.slug}`);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-mint w-12 h-12" /></div>;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans" dir="rtl">
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-ink flex items-center gap-2 no-underline">
            <span className="text-mint text-xl font-black">MASAR</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-ink px-4 py-2 hover:bg-gray-50 rounded-md transition-colors">
              تسجيل الدخول
            </Link>
            <Link href="/login" className="text-sm font-medium bg-ink text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        
        {/* المحتوى الأيسر */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-mint">
              <Link href="/courses" className="hover:underline">الكورسات</Link>
              <ChevronRight size={16} className="rotate-180" />
              <span>عام</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              {course.description || 'وصف شامل للكورس يأخذك من الصفر وحتى الاحتراف بخطوات عملية وتطبيقية. صُمم هذا الكورس ليناسب احتياجات سوق العمل.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-1 text-ink">
                <span className="text-amber-500 flex items-center"><Star size={18} fill="currentColor" /> 4.8</span>
                <span className="text-gray-500">(1,240 تقييم)</span>
              </div>
              <div className="text-gray-300">•</div>
              <div className="text-gray-500">
                المحاضر: <span className="text-mint hover:underline cursor-pointer">{course.profiles?.full_name || 'مسار Creators'}</span>
              </div>
            </div>
          </div>

          {/* ماذا ستتعلم */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-ink mb-6">ماذا ستتعلم في هذا الكورس؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'إتقان المهارات الأساسية والمتقدمة من الصفر',
                'بناء مشاريع عملية يمكن إضافتها لمعرض أعمالك',
                'التفاعل المباشر مع الذكاء الاصطناعي لفهم أعمق',
                'الحصول على أفضل الممارسات المستخدمة في الشركات'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 text-mint"><Check size={18} strokeWidth={3} /></div>
                  <span className="text-sm font-bold text-gray-700 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* محتوى المنهج */}
          <div>
            <h2 className="text-2xl font-bold text-ink mb-6">محتوى الكورس</h2>
            <div className="flex items-center gap-4 text-sm font-bold text-gray-500 mb-4">
              <span>{modules?.length || 0} فصول</span>
              <span>•</span>
              <span>{totalLessons} درس</span>
            </div>
            
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {modules?.map((module: any, index: number) => (
                <div key={module.id} className={`border-b border-gray-200 last:border-0 ${index === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="p-5 font-bold text-ink flex items-center justify-between">
                    <span>{module.title}</span>
                    <span className="text-sm text-gray-500">{module.lessons?.length || 0} دروس</span>
                  </div>
                  <div className="px-5 pb-5 space-y-3">
                    {module.lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center justify-between text-sm font-bold group">
                        <div className="flex items-center gap-3 text-gray-600 group-hover:text-mint transition-colors">
                          <PlayCircle size={18} className={lesson.is_free_preview ? "text-mint" : "text-gray-300"} />
                          <span>{lesson.title}</span>
                        </div>
                        {lesson.is_free_preview && (
                          <span className="text-xs text-mint bg-mint/10 px-2 py-1 rounded">معاينة مجانية</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الشريط الجانبي (بطاقة الشراء) */}
        <div className="relative">
          <div className="sticky top-24 border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-md p-1.5">
            
            <div className="w-full h-56 bg-ink rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-ink to-mint/20 z-10"></div>
              <PlayCircle size={56} className="text-white z-20 opacity-90 group-hover:scale-110 transition-transform" />
            </div>

            <div className="p-6">
              <div className="text-4xl font-black text-ink mb-6">
                ${course.price || '0'}
              </div>
              
              <div className="space-y-3 mb-8">
                <button 
                  onClick={handleEnrollment}
                  disabled={isEnrolling}
                  className="w-full bg-ink hover:bg-gray-800 text-white py-4 rounded-xl font-black text-base transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'الاشتراك وبدء التعلم'}
                </button>
              </div>

              <div className="text-xs font-bold text-mint mb-4 uppercase tracking-widest">
                هذا الكورس يتضمن
              </div>
              
              <ul className="space-y-4 text-sm font-bold text-gray-600">
                <li className="flex items-center gap-3"><Monitor size={18} className="text-gray-400" /> وصول كامل ومباشر للمنصة</li>
                <li className="flex items-center gap-3"><Bot size={18} className="text-mint" /> دعم المعلم الآلي (Gemini AI)</li>
                <li className="flex items-center gap-3"><FileText size={18} className="text-gray-400" /> ملفات ومرفقات تعليمية</li>
                <li className="flex items-center gap-3"><Infinity size={18} className="text-gray-400" /> وصول مدى الحياة</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}