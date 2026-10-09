'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, ShoppingCart, Sparkles, 
  ArrowRight, PlayCircle, BrainCircuit, 
  Building2, BookOpen, ChevronDown, Layers, UserPlus, LogIn, LogOut, LayoutDashboard 
} from 'lucide-react';

export default function GlobalPlatformHome() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
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
        .select('id, title, slug, description, price')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (data) setCourses(data);
      setIsLoadingCourses(false);
    };
    fetchPublishedCourses();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl selection:bg-[#00a88f] selection:text-white">
      
      <div className="bg-gradient-to-r from-[#391e75] via-[#2d175e] to-[#00a88f] text-white py-2 px-4 text-center text-xs md:text-sm font-semibold flex items-center justify-center gap-3 border-b border-white/10 shadow-md">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">تحديث جديد</span>
        <span className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-amber-300 animate-pulse" />
          تم تفعيل المعلم الذكي (Gemini 1.5) ليتفاعل مع فيديوهات الدروس لحظياً!
        </span>
      </div>

      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-11 h-11 bg-gradient-to-tr from-[#391e75] to-[#00a88f] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#00a88f]/20 border border-white/10 group-hover:scale-105 transition-transform">
                M
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white block leading-none">مسار العالمية</span>
                <span className="text-[10px] text-[#00a88f] font-bold tracking-widest uppercase">LMS Engine</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-800 transition-all">
              <Layers size={16} className="text-[#00a88f]" />
              <span>تصفح الأقسام</span>
              <ChevronDown size={14} />
            </div>

            <div className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="ابحث عن كورس، أو مهارة (مثال: الذكاء الاصطناعي)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-full py-2.5 pr-11 pl-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00a88f] transition-all shadow-inner"
              />
              <Search size={18} className="absolute right-4 top-3 text-slate-500" />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="#b2b" className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#00a88f] transition-colors">
                <Building2 size={16} className="text-[#00a88f]" />
                <span>حلول الشركات</span>
              </Link>

              <div className="h-6 w-[1px] bg-slate-800 hidden lg:block"></div>

              {user ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSignOut}
                    className="text-slate-400 hover:text-red-400 px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">خروج</span>
                  </button>
                  <Link 
                    href="/dashboard" 
                    className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#00a88f]/20 flex items-center gap-1.5"
                  >
                    <LayoutDashboard size={15} />
                    <span>لوحة التحكم</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className="text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    دخول
                  </Link>
                  <Link 
                    href="/login" 
                    className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#00a88f]/20 flex items-center gap-1.5"
                  >
                    <UserPlus size={15} />
                    <span>حساب جديد</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 text-right">
              <div className="inline-flex items-center gap-2 bg-[#391e75]/40 border border-purple-500/30 text-[#00a88f] font-bold px-4 py-2 rounded-full text-xs mb-6 shadow-xl">
                <Sparkles size={16} />
                <span>الجيل الجديد من منصات التعليم الرقمي المدعومة بالـ AI</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                ابنِ مهارات المستقبل مع <br />
                <span className="bg-gradient-to-l from-[#00a88f] to-purple-400 bg-clip-text text-transparent">
                  منظومة مسار التفاعلية
                </span>
              </h1>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                تجربة تعليمية فريدة تدمج بين فيديوهات عالية الجودة (Bunny DRM) ومعلم ذكي مرافق لك في كل درس ليجيب على أسئلتك ويحلل تقدمك لحظة بلحظة.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-[#00a88f]/25 flex items-center gap-3 hover:-translate-y-0.5"
                  >
                    <PlayCircle size={20} />
                    <span>استكمل مسارك التعليمي</span>
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-[#00a88f]/25 flex items-center gap-3 hover:-translate-y-0.5"
                    >
                      <UserPlus size={20} />
                      <span>ابدأ رحلتك مجاناً</span>
                    </Link>
                    <a 
                      href="#courses" 
                      className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2"
                    >
                      <BookOpen size={20} className="text-[#00a88f]" />
                      <span>تصفح الكورسات</span>
                    </a>
                  </>
                )}
              </div>

              <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6">
                <div>
                  <span className="block font-black text-2xl text-white">100%</span>
                  <span className="text-xs text-slate-500">حماية وتشفير</span>
                </div>
                <div>
                  <span className="block font-black text-2xl text-[#00a88f]">تفاعلي</span>
                  <span className="text-xs text-slate-500">متابعة للإنجاز</span>
                </div>
                <div>
                  <span className="block font-black text-2xl text-purple-400">Gemini AI</span>
                  <span className="text-xs text-slate-500">معلم ذكي مدمج</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#00a88f] to-teal-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg">
                  تجربة المشغل الذكي
                </div>

                <div className="block aspect-video bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00a88f]/10 to-transparent"></div>
                  <BrainCircuit size={64} className="text-[#00a88f]/50 group-hover:scale-110 group-hover:text-[#00a88f] transition-all duration-500 z-10" />
                  <span className="absolute bottom-4 right-4 text-xs font-bold text-white bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                    واجهة التعلم الجديدة
                  </span>
                </div>

                <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00a88f] mb-2">
                    <BrainCircuit size={16} /> رسالة من المعلم الذكي
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    "أهلاً بك! أنا متصل بمحتوى الكورسات. سجل دخولك الآن واختر دورتك التدريبية لنبدأ رحلة التعلم معاً."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="courses" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-white mb-4">أحدث المسارات التعليمية</h2>
            <p className="text-slate-400 text-sm">
              اختر من بين الكورسات المتاحة والمصممة بعناية لتناسب احتياجات سوق العمل، والمدعومة بالكامل بنظام الذكاء الاصطناعي.
            </p>
          </div>

          {isLoadingCourses ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a88f]"></div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-[#00a88f]/50 transition-all group flex flex-col">
                  <div className="aspect-video bg-slate-950 flex items-center justify-center border-b border-slate-800 relative">
                    <BookOpen className="text-slate-800 w-16 h-16 group-hover:scale-110 transition-transform group-hover:text-[#00a88f]/40" />
                    <div className="absolute top-4 left-4 bg-[#00a88f] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {course.price > 0 ? `$${course.price}` : 'متاح للتسجيل'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3 flex-1">
                      {course.description}
                    </p>
                    {/* التحديث هنا: توجيه المستخدم لصفحة المبيعات (courses) وليس المشغل (learn) */}
                    <Link 
                      href={`/courses/${course.slug}`}
                      className="w-full bg-slate-800 hover:bg-[#00a88f] text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      <span>استكشاف الكورس</span>
                      <ArrowRight size={14} className="group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
              <p className="text-slate-400 text-sm">لا توجد كورسات منشورة حالياً. (قم بإضافة كورس من لوحة الإدارة واجعله "منشوراً")</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}