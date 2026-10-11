'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, PlayCircle, BookOpen, LogOut, LayoutDashboard,
  Star, Shield, MonitorPlay, ArrowRight, Check, ChevronDown, 
  Sparkles, BrainCircuit, Code, Palette, Briefcase, TrendingUp, 
  MessageSquare, Users, Globe, Lock, FileText, Mail, Loader2
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

  const faqs = [
    { q: 'كيف يعمل المعلم الذكي (AI Tutor) في مسار؟', a: 'يتم تدريب المعلم الذكي حصرياً على المادة العلمية الخاصة بكل كورس بواسطة المحاضر. أثناء مشاهدتك للدرس، يمكنك سؤاله أي سؤال، وسيجيبك بناءً على سياق الكورس، بل ويرشدك للدقيقة المحددة في الفيديو.' },
    { q: 'هل يمكنني الانضمام كصانع محتوى (محاضر)؟', a: 'نعم بالتأكيد. منصة مسار توفر لك بنية تحتية متكاملة تشمل حماية الفيديوهات (DRM)، أدوات الذكاء الاصطناعي، ولوحة تحكم مالية دقيقة.' },
    { q: 'هل الفيديوهات محمية من السرقة؟', a: 'نعم، نستخدم تقنيات التشفير المتقدمة (DRM) بالتعاون مع Bunny.net لضمان عدم إمكانية تحميل المحتوى التعليمي.' },
    { q: 'هل الكورسات مسجلة أم بث مباشر؟', a: 'الكورسات مسجلة مسبقاً بأعلى جودة، مما يتيح لك التعلم بالسرعة التي تناسبك مع وصول مدى الحياة.' }
  ];

  const categories = [
    { title: 'البرمجة والتطوير', icon: <Code size={24} />, count: '١٢٠+ كورس', color: 'text-blue-600' },
    { title: 'الذكاء الاصطناعي', icon: <BrainCircuit size={24} />, count: '٤٥+ كورس', color: 'text-[#0c8c5e]' },
    { title: 'التصميم والجرافيك', icon: <Palette size={24} />, count: '٨٠+ كورس', color: 'text-purple-600' },
    { title: 'ريادة الأعمال', icon: <Briefcase size={24} />, count: '٦٠+ كورس', color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans dir-rtl" dir="rtl">
      
      {/* Header */}
      <header className="bg-white border-b border-[#f2f2f2] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-[#08090a] flex items-center gap-2 tracking-tight">
              <Sparkles className="text-[#0c8c5e]" size={20} />
              <span className="text-[18px]">MASAR</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#08090a]/80">
              <Link href="/courses" className="hover:text-[#0c8c5e] transition-colors">تصفح الكورسات</Link>
              <Link href="#features" className="hover:text-[#0c8c5e] transition-colors">المميزات السحرية</Link>
              <Link href={user ? "/instructor" : "/login?redirect=/instructor"} className="hover:text-[#0c8c5e] transition-colors">التدريس في مسار</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 border-r border-[#f2f2f2] pr-4">
                 <Link href="/dashboard" className="text-[14px] font-medium text-[#08090a] hover:bg-[#f2f2f2] px-4 py-2 rounded-[4px] transition-colors flex items-center gap-2">
                    <LayoutDashboard size={16} /> لوحتي
                  </Link>
                  <button onClick={handleSignOut} className="text-[14px] font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-[4px] transition-colors">
                    <LogOut size={16} />
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-[14px] font-medium text-[#08090a] hover:bg-[#f2f2f2] px-4 py-2 rounded-[4px] transition-colors">
                  دخول
                </Link>
                <Link href="/login" className="text-[14px] font-medium bg-[#08090a] text-white px-4 py-2 rounded-[4px] shadow-sm hover:opacity-90 transition-opacity">
                  ابدأ مجاناً
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-28 overflow-hidden border-b border-[#f2f2f2] bg-gradient-to-b from-[#0c8c5e]/[0.03] to-white">
          <div className="max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 bg-white border border-[#f2f2f2] text-[#08090a] font-medium px-4 py-1.5 rounded-full text-[13px] mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#0c8c5e] animate-pulse"></span>
              تعرف على المعلم الذكي الجديد كلياً
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold text-[#08090a] max-w-4xl mb-6 tracking-tight leading-tight">
              تعلم، وعَلِّم، بذكاء <br /> لم يسبق له مثيل.
            </h1>
            <p className="text-lg text-[#000000]/70 max-w-2xl mb-10 leading-relaxed">
              المنصة التعليمية الأولى التي تدمج التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي لكل طالب ومدرس.
            </p>
            
            <div className="relative w-full max-w-xl mx-auto flex items-center bg-white rounded-[4px] border border-[#dddddd] shadow-md overflow-hidden h-14 px-2">
               <Search size={20} className="text-[#000000]/40 mr-2" />
               <input
                  type="text"
                  placeholder="ابحث عن (بايثون، ذكاء اصطناعي، تسويق)..."
                  className="w-full h-full py-2 px-3 text-[15px] text-[#08090a] outline-none bg-transparent text-right"
                />
                <button className="bg-[#08090a] text-white h-10 px-6 text-[14px] font-medium rounded-[4px] hover:opacity-90 transition-opacity shrink-0">
                  استكشف
                </button>
            </div>
            
            <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-[13px] text-[#000000]/60 font-medium">
              <span className="flex items-center gap-2"><Shield size={16} className="text-[#0c8c5e]" /> حماية DRM</span>
              <span className="flex items-center gap-2"><BrainCircuit size={16} className="text-[#0c8c5e]" /> AI Tutor</span>
              <span className="flex items-center gap-2"><MonitorPlay size={16} className="text-[#0c8c5e]" /> وصول مدى الحياة</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-semibold text-[#08090a] mb-8 tracking-tight">
              استكشف التصنيفات
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="border border-[#f2f2f2] rounded-[16px] p-6 hover:border-[#dddddd] hover:shadow-sm transition-all bg-white cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg bg-[#f2f2f2] flex items-center justify-center mb-4 ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#08090a] mb-1">{cat.title}</h3>
                  <p className="text-[13px] text-[#000000]/60">{cat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-[#0c8c5e]/[0.02] border-y border-[#f2f2f2]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-[13px] font-medium text-[#0c8c5e] uppercase tracking-wider mb-4">
                القوة السحرية للذكاء الاصطناعي
              </div>
              <h2 className="text-3xl font-semibold text-[#08090a] tracking-tight">
                أدوات خارقة للمدرس والطالب
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-[#f2f2f2] rounded-[16px] p-8 shadow-sm">
                <div className="text-[#0c8c5e] mb-6"><BrainCircuit size={32} strokeWidth={1.5} /></div>
                <h3 className="text-[20px] font-semibold text-[#08090a] mb-3">معلم آلي لكل كورس</h3>
                <p className="text-[15px] text-[#000000]/70 leading-relaxed">
                  مساعد ذكي يرافق الطالب أثناء المشاهدة، يجيب على الأسئلة من صميم المادة العلمية، ويرشده لأوقات الشرح داخل الفيديو بدقة.
                </p>
              </div>
              <div className="bg-white border border-[#f2f2f2] rounded-[16px] p-8 shadow-sm">
                <div className="text-[#08090a] mb-6"><Shield size={32} strokeWidth={1.5} /></div>
                <h3 className="text-[20px] font-semibold text-[#08090a] mb-3">حماية سينمائية DRM</h3>
                <p className="text-[15px] text-[#000000]/70 leading-relaxed">
                  نحمي محتواك الفكري بتقنيات تشفير قوية تمنع التحميل والإضافات غير القانونية، لتركز أنت على صناعة محتوى عظيم بأمان.
                </p>
              </div>
              <div className="bg-white border border-[#f2f2f2] rounded-[16px] p-8 shadow-sm">
                <div className="text-[#08090a] mb-6"><Sparkles size={32} strokeWidth={1.5} /></div>
                <h3 className="text-[20px] font-semibold text-[#08090a] mb-3">مساعد المدرس السحري</h3>
                <p className="text-[15px] text-[#000000]/70 leading-relaxed">
                  أدوات ذكية للمحاضرين لتوليد الاختبارات، كتابة وصف الكورسات، وتحليل أداء الطلاب بضغطة زر واحدة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-semibold text-[#08090a] mb-8 tracking-tight">أحدث الكورسات المنشورة</h2>
            
            {isLoadingCourses ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-[#0c8c5e] w-8 h-8" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link href={`/courses/${course.slug}`} key={course.id} className="flex flex-col bg-white border border-[#f2f2f2] rounded-[16px] overflow-hidden hover:border-[#dddddd] shadow-sm transition-all group">
                    <div className="aspect-video bg-[#08090a] flex items-center justify-center relative overflow-hidden">
                      <MonitorPlay className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-semibold text-[18px] text-[#08090a] mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-[13px] text-[#000000]/60 mb-4">{course.profiles?.full_name || 'مدرس معتمد'}</p>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#f2f2f2]">
                        <div className="font-semibold text-[20px] text-[#08090a]">
                          {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                        </div>
                        <div className="flex items-center gap-1 text-[13px] font-medium text-[#08090a]">
                          <Star size={14} className="fill-amber-400 text-amber-400" /> 4.9
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-[#f2f2f2] rounded-[16px] bg-[#f2f2f2]/20">
                <p className="text-[#000000]/60 text-[14px]">لا توجد كورسات متاحة حالياً.</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white border-t border-[#f2f2f2]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-semibold text-[#08090a] mb-8 text-center tracking-tight">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-[#f2f2f2] rounded-[16px] overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-right p-6 flex justify-between items-center bg-white hover:bg-[#f2f2f2]/30 transition-colors"
                  >
                    <span className="font-semibold text-[15px] text-[#08090a]">{faq.q}</span>
                    <ChevronDown size={18} className={`text-black/50 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="p-6 pt-0 text-[14px] leading-relaxed text-[#000000]/70 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#08090a] text-white py-16 border-t border-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="font-bold flex items-center gap-2 tracking-tight mb-6">
                <Sparkles className="text-[#0c8c5e]" size={20} />
                <span className="text-[18px]">MASAR</span>
              </Link>
              <p className="text-[13px] text-white/60 leading-relaxed">
                منصة مسار هي بيئتك التعليمية المتكاملة المدعومة بالذكاء الاصطناعي لحماية وبيع وتقديم المحتوى بأعلى جودة.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[15px] mb-6">المنصة</h4>
              <ul className="space-y-3 text-[13px] text-white/60">
                <li><Link href="/courses" className="hover:text-white transition-colors">تصفح الكورسات</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">تسجيل كطالب</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[15px] mb-6">المميزات</h4>
              <ul className="space-y-3 text-[13px] text-white/60">
                <li><Link href="#" className="hover:text-white transition-colors">التشفير وحماية DRM</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">المعلم الذكي (AI Tutor)</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[15px] mb-6">القانونية</h4>
              <ul className="space-y-3 text-[13px] text-white/60">
                <li><Link href="#" className="hover:text-white transition-colors">شروط الاستخدام</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1a1a1a] pt-8 flex flex-col md:flex-row items-center justify-between text-[12px] text-white/40">
            <p>© 2026 مسار MASAR. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
               <Lock size={12} /> <p>مدعوم بتشفير بنكي وبنية تحتية آمنة</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}