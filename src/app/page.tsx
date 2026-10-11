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
    { q: 'كيف يعمل المعلم الذكي (AI Tutor) في مسار؟', a: 'يتم تدريب المعلم الذكي حصرياً على المادة العلمية الخاصة بكل كورس بواسطة المحاضر للإجابة على استفسارات الطلاب بدقة، وإرشادهم للدقيقة المناسبة داخل الدرس.' },
    { q: 'هل يمكنني الانضمام كصانع محتوى (محاضر)؟', a: 'نعم بالتأكيد، توفر لك مسار أدوات متكاملة لحماية محتواك بتشفير DRM وبيع كورساتك بحرية.' },
    { q: 'هل الفيديوهات محمية من السرقة؟', a: 'نعم، نستخدم تقنيات التشفير المتقدمة (DRM) بالتعاون مع Bunny.net لمنع تحميل المحتوى.' }
  ];

  const categories = [
    { title: 'البرمجة والتطوير', icon: <Code size={24} />, count: '١٢٠+ كورس', desc: 'ويب، تطبيقات، ذكاء اصطناعي' },
    { title: 'الذكاء الاصطناعي', icon: <BrainCircuit size={24} />, count: '٤٥+ كورس', desc: 'تعلم الآلة والـ Prompt Engineering' },
    { title: 'التصميم والجرافيك', icon: <Palette size={24} />, count: '٨٠+ كورس', desc: 'UI/UX، فوتوشوب، وتصميم تفاعلي' },
    { title: 'ريادة الأعمال', icon: <Briefcase size={24} />, count: '٦٠+ كورس', desc: 'إدارة، تسويق، ومبيعات' },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans" dir="rtl">
      
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-black flex items-center gap-2 no-underline">
              <span className="text-mint text-xl font-black">MASAR</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/courses" className="hover:text-mint transition-colors">تصفح الكورسات</Link>
              <Link href="#features" className="hover:text-mint transition-colors">المميزات السحرية</Link>
              <Link href={user ? "/instructor" : "/login?redirect=/instructor"} className="hover:text-mint transition-colors">التدريس في مسار</Link>
            </nav>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                 <Link href="/dashboard" className="text-sm font-medium text-ink bg-gray-100 px-4 py-2 rounded-md transition-colors hover:bg-gray-200 flex items-center gap-2">
                    <LayoutDashboard size={16} /> لوحتي
                  </Link>
                  <button onClick={handleSignOut} className="text-red-500 hover:text-red-700 p-2 rounded transition-colors">
                    <LogOut size={18} />
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-ink px-4 py-2 hover:bg-gray-50 rounded-md transition-colors">
                  دخول
                </Link>
                <Link href="/login" className="text-sm font-medium bg-ink text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm">
                  ابدأ مجاناً
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section (Mintlify Dark Style) */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-[#0c8c5e] to-ink text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
              المنصة التعليمية الأولى المدعومة بالذكاء الاصطناعي
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
              تعلم، وعَلِّم، بذكاء <br /> لم يسبق له مثيل.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              تدمج منصة مسار التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي لتجربة تعليمية فريدة من نوعها.
            </p>
            
            <div className="relative w-full max-w-xl mx-auto flex items-center bg-white rounded-md p-1.5 shadow-xl">
               <Search size={20} className="text-gray-400 mr-3" />
               <input
                  type="text"
                  placeholder="ابحث عن مهارة، برمجة، تسويق..."
                  className="w-full py-3 px-3 text-base text-ink outline-none bg-transparent"
                />
                <button className="bg-ink text-white h-12 px-8 text-sm font-medium rounded hover:bg-gray-800 transition-colors shrink-0">
                  ابحث
                </button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/80 font-medium">
              <span className="flex items-center gap-2"><Shield size={18} className="text-mint" /> حماية DRM</span>
              <span className="flex items-center gap-2"><BrainCircuit size={18} className="text-mint" /> معلم ذكي لكل كورس</span>
              <span className="flex items-center gap-2"><MonitorPlay size={18} className="text-mint" /> وصول مدى الحياة</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
               <h2 className="text-3xl font-bold text-ink tracking-tight">استكشف مجالات المستقبل</h2>
               <p className="text-gray-500 mt-2">اختر التصنيف وابدأ رحلة التعلم مع أفضل الخبراء.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all bg-white cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-5 text-mint group-hover:bg-mint group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{cat.desc}</p>
                  <span className="text-xs font-bold text-mint">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Features (Magic School Style) */}
        <section id="features" className="py-24 px-6 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-mint uppercase tracking-widest mb-4">
                قوة الذكاء الاصطناعي
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
                أدوات خارقة للمدرس والطالب
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="text-mint mb-6"><BrainCircuit size={36} strokeWidth={1.5} /></div>
                <h3 className="text-xl font-bold text-ink mb-3">معلم آلي تفاعلي</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  مساعد ذكي يرافق الطالب أثناء المشاهدة، يجيب على الأسئلة من صميم المادة العلمية، ويرشده لأوقات الشرح داخل الفيديو بدقة.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="text-ink mb-6"><Shield size={36} strokeWidth={1.5} /></div>
                <h3 className="text-xl font-bold text-ink mb-3">حماية سينمائية DRM</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  نحمي محتواك الفكري بتقنيات تشفير قوية تمنع التحميل والإضافات غير القانونية، لتركز أنت على صناعة محتوى عظيم بأمان.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="text-ink mb-6"><Sparkles size={36} strokeWidth={1.5} /></div>
                <h3 className="text-xl font-bold text-ink mb-3">مساعد المدرس السحري</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  أدوات ذكية للمحاضرين لتوليد الاختبارات، كتابة وصف الكورسات، وتحليل أداء الطلاب بضغطة زر واحدة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Courses Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-ink tracking-tight">أحدث الكورسات المنشورة</h2>
                    <p className="text-gray-500 mt-2">تعلم من أفضل الخبراء المعتمدين في منصة مسار.</p>
                </div>
                <Link href="/courses" className="hidden md:flex items-center gap-2 text-sm font-bold text-mint hover:underline">
                    عرض الكل <ArrowRight size={16} className="rotate-180" />
                </Link>
            </div>
            
            {isLoadingCourses ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-mint" size={40} />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link href={`/courses/${course.slug}`} key={course.id} className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:border-gray-300 transition-all group">
                    <div className="aspect-video bg-ink flex items-center justify-center relative overflow-hidden">
                      <MonitorPlay className="text-white/20 group-hover:scale-110 transition-transform duration-500" size={48} />
                      <div className="absolute top-3 right-3 bg-white/90 text-ink text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <Sparkles size={12} className="text-mint" /> AI Ready
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-ink mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">{course.profiles?.full_name || 'مدرس معتمد'}</p>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xl font-black text-ink">
                          {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold text-ink">
                          <Star size={16} className="fill-amber-400 text-amber-400" /> 4.9
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-500">
                لا توجد كورسات متاحة حالياً.
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-ink mb-12 text-center tracking-tight">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-gray-200 transition-colors">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-right p-6 flex justify-between items-center bg-transparent border-none cursor-pointer"
                  >
                    <span className="font-bold text-base text-ink">{faq.q}</span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-mint' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="px-6 pb-6 text-sm leading-relaxed text-gray-600">
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
      <footer className="bg-ink text-white py-16 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="font-bold flex items-center gap-2 mb-6 text-white no-underline">
                <span className="text-mint text-xl font-black">MASAR</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed pr-2">
                منصة مسار هي بيئتك التعليمية المتكاملة المدعومة بالذكاء الاصطناعي لحماية وبيع وتقديم المحتوى بأعلى جودة.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base mb-6 text-white">المنصة</h4>
              <ul className="space-y-3 text-sm text-gray-400 list-none p-0">
                <li><Link href="/courses" className="hover:text-white transition-colors">تصفح الكورسات</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">تسجيل كطالب</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-6 text-white">المميزات</h4>
              <ul className="space-y-3 text-sm text-gray-400 list-none p-0">
                <li><span className="hover:text-white cursor-pointer transition-colors">التشفير وحماية DRM</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">المعلم الذكي (AI Tutor)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-6 text-white">القانونية</h4>
              <ul className="space-y-3 text-sm text-gray-400 list-none p-0">
                <li><span className="hover:text-white cursor-pointer transition-colors">شروط الاستخدام</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">سياسة الخصوصية</span></li>
              </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex justify-between items-center flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Lock size={14} /> جميع الحقوق محفوظة © 2026 مسار
          </div>
          <div>مدعوم بتشفير بنكي وبنية تحتية آمنة</div>
        </div>
      </footer>

    </div>
  );
}