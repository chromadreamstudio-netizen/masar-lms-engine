'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, Shield, MonitorPlay, ArrowRight, Check, ChevronDown, 
  Sparkles, BrainCircuit, Code, Palette, Briefcase, 
  LayoutDashboard, LogOut, Loader2, Lock, PlayCircle, Star
} from 'lucide-react';

export default function GlobalPlatformHome() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const fetchPublishedCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, description, price, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (data) setCourses(data);
      setIsLoadingCourses(false);
    };
    fetchPublishedCourses();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const faqs = [
    { q: 'كيف يعمل المعلم الذكي (AI Tutor) في مسار؟', a: 'يتم تدريب المعلم الذكي حصرياً على المادة العلمية الخاصة بكل كورس بواسطة المحاضر للإجابة على استفسارات الطلاب بدقة.' },
    { q: 'هل يمكنني الانضمام كصانع محتوى (محاضر)؟', a: 'نعم بالتأكيد، توفر لك مسار أدوات متكاملة لحماية محتواك وبيع كورساتك بحرية.' },
    { q: 'هل الفيديوهات محمية من السرقة؟', a: 'نعم، نستخدم تقنيات التشفير المتقدمة (DRM) لحماية المحتوى التعليمي.' }
  ];

  const categories = [
    { title: 'البرمجة والتطوير', icon: <Code size={22} />, count: '١٢٠+ كورس' },
    { title: 'الذكاء الاصطناعي', icon: <BrainCircuit size={22} />, count: '٤٥+ كورس' },
    { title: 'التصميم والجرافيك', icon: <Palette size={22} />, count: '٨٠+ كورس' },
    { title: 'ريادة الأعمال', icon: <Briefcase size={22} />, count: '٦٠+ كورس' },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans" dir="rtl">
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-black flex items-center gap-2 no-underline">
              <span className="text-[#0c8c5e] text-xl font-black">MASAR</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/courses" className="hover:text-[#0c8c5e] transition-colors">تصفح الكورسات</Link>
              <Link href="/login?redirect=/instructor" className="hover:text-[#0c8c5e] transition-colors">التدريس في مسار</Link>
            </nav>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                 <Link href="/dashboard" className="text-sm font-medium text-black bg-gray-100 px-4 py-2 rounded transition-colors">
                    لوحة التحكم
                  </Link>
                  <button onClick={handleSignOut} className="text-red-600 p-2 hover:bg-red-50 rounded transition-colors">
                    <LogOut size={18} />
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-black px-4 py-2">
                  دخول
                </Link>
                <Link href="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded hover:opacity-90 transition-opacity">
                  ابدأ مجاناً
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-6 text-center border-b border-gray-100 bg-gradient-to-b from-[#0c8c5e]/5 to-white">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-white border border-gray-200 text-[#0c8c5e] px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-sm">
              الجيل الجديد من التعليم المدعوم بالذكاء الاصطناعي
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-6 tracking-tight">
              تعلم، وعَلِّم، بذكاء لم يسبق له مثيل.
            </h1>
            <p className="text-base text-gray-600 leading-relaxed mb-10">
              المنصة التعليمية الأولى التي تدمج التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي لكل طالب ومدرس.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-2"><Shield size={16} className="text-[#0c8c5e]" /> حماية DRM</span>
              <span className="flex items-center gap-2"><BrainCircuit size={16} className="text-[#0c8c5e]" /> المعلم الذكي</span>
              <span className="flex items-center gap-2"><MonitorPlay size={16} className="text-[#0c8c5e]" /> وصول مدى الحياة</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-black mb-8">
            استكشف التصنيفات الرئيسية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 text-[#0c8c5e]">
                  {cat.icon}
                </div>
                <h3 className="text-base font-bold text-black mb-1">{cat.title}</h3>
                <p className="text-xs text-gray-500">{cat.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-gray-100">
          <h2 className="text-2xl font-bold text-black mb-8">أحدث الكورسات المنشورة</h2>
          
          {isLoadingCourses ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#0c8c5e]" size={32} />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link href={`/courses/${course.slug}`} key={course.id} className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all no-underline">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <MonitorPlay className="text-white/30" size={40} />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-black mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">{course.profiles?.full_name || 'مدرس معتمد'}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold text-black">
                        {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                      </span>
                      <span className="text-xs font-bold text-[#0c8c5e] flex items-center gap-1">
                        التفاصيل <ArrowRight size={14} className="rotate-180" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm">
              لا توجد كورسات متاحة حالياً.
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 max-w-3xl mx-auto border-t border-gray-100">
          <h2 className="text-2xl font-bold text-black mb-8 text-center">
            الأسئلة الشائعة
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-right p-6 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors font-bold text-sm text-black border-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-6 text-xs leading-relaxed text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-6 mt-16 border-t border-gray-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4 text-xs text-gray-400">
          <div className="font-bold flex items-center gap-2 text-white">
            <Sparkles className="text-[#0c8c5e]" size={16} />
            <span>MASAR Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={12} /> جميع الحقوق محفوظة © 2026 مسار
          </div>
        </div>
      </footer>

    </div>
  );
}