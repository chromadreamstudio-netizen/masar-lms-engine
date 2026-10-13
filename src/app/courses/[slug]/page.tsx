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

  // 🛠️ الدالة المعدلة بذكاء لمعالجة الدفع أو التسجيل المجاني
  const handleEnrollment = async () => {
    setIsEnrolling(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }
    
    // التحقق المالي: هل الكورس مدفوع؟
    if (course.price && course.price > 0) {
      // توجيه الطالب إلى رابط Lemon Squeezy الخاص بالكورس المدفوع
      // (مستقبلاً سنجعل هذا الرابط يقرأ ديناميكياً من قاعدة البيانات course.checkout_url)
      window.location.href = 'https://masar-platform.lemonsqueezy.com/checkout/buy/acdd539e-397f-40df-b90b-ae76d3928aa4';
      return;
    }

    // إذا كان الكورس مجانياً، يتم التسجيل المباشر
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

    router.push(`/learn/${course.slug}`);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-mint w-12 h-12" /></div>;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans" dir="rtl">
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
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-mint">
              <Link href="/courses" className="hover:underline">الكورسات</Link>
              <ChevronRight size={16} className="rotate-180" />
              <span>عام</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight">{course.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">{course.description || 'وصف شامل للكورس'}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-ink mb-6">ماذا ستتعلم في هذا الكورس؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['إتقان المهارات الأساسية والمتقدمة من الصفر', 'بناء مشاريع عملية', 'التفاعل المباشر مع الذكاء الاصطناعي', 'الحصول على أفضل الممارسات'].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 text-mint"><Check size={18} strokeWidth={3} /></div>
                  <span className="text-sm font-bold text-gray-700 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink mb-6">محتوى الكورس</h2>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {modules?.map((module: any, index: number) => (
                <div key={module.id} className={`border-b border-gray-200 last:border-0 ${index === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="p-5 font-bold text-ink flex items-center justify-between">
                    <span>{module.title}</span>
                  </div>
                  <div className="px-5 pb-5 space-y-3">
                    {module.lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center justify-between text-sm font-bold group">
                        <div className="flex items-center gap-3 text-gray-600 group-hover:text-mint transition-colors">
                          <PlayCircle size={18} className={lesson.is_free_preview ? "text-mint" : "text-gray-300"} />
                          <span>{lesson.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="sticky top-24 border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-md p-1.5">
            <div className="w-full h-56 bg-ink rounded-xl flex items-center justify-center relative group cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-ink to-mint/20 z-10"></div>
              <PlayCircle size={56} className="text-white z-20 opacity-90 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-6">
              <div className="text-4xl font-black text-ink mb-6">${course.price || '0'}</div>
              <div className="space-y-3 mb-8">
                <button 
                  onClick={handleEnrollment} 
                  disabled={isEnrolling} 
                  className="w-full bg-ink hover:bg-gray-800 text-white py-4 rounded-xl font-black text-base transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : (course.price > 0 ? 'شراء الكورس الآن' : 'الاشتراك مجاناً')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}