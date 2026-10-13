'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, Shield, MonitorPlay, ArrowRight, Check, ChevronDown, 
  Sparkles, BrainCircuit, Code, Palette, Briefcase, 
  LayoutDashboard, LogOut, Loader2, Lock, PlayCircle, Star, GraduationCap
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

  const categories = [
    { title: 'البرمجة والتطوير', icon: <Code size={24} />, count: '١٢٠+ كورس', desc: 'ويب، تطبيقات، ذكاء اصطناعي' },
    { title: 'الذكاء الاصطناعي', icon: <BrainCircuit size={24} />, count: '٤٥+ كورس', desc: 'تعلم الآلة والـ Prompt Engineering' },
    { title: 'التصميم والجرافيك', icon: <Palette size={24} />, count: '٨٠+ كورس', desc: 'UI/UX، فوتوشوب، وتصميم تفاعلي' },
    { title: 'ريادة الأعمال', icon: <Briefcase size={24} />, count: '٦٠+ كورس', desc: 'إدارة، تسويق، ومبيعات' },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans" dir="rtl">
      
      {/* 1. Header (Smart Routing Integration) */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="MASAR Logo" width={100} height={30} className="object-contain" priority />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
              <Link href="/courses" className="hover:text-mint transition-colors">تصفح الكورسات</Link>
              <Link href="#features" className="hover:text-mint transition-colors">المميزات السحرية</Link>
              
              <Link href="/pricing" className="text-mint hover:text-[#0a754f] transition-colors flex items-center gap-1">
                 <Sparkles size={14} /> باقات المعلم الذكي
              </Link>

              <Link href={user ? "/instructor" : "/login?redirect=/instructor"} className="text-mint hover:text-[#0a754f] transition-colors">التدريس في مسار</Link>
            </nav>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                 <Link href="/dashboard" className="text-sm font-bold text-ink bg-gray-100 px-4 py-2 rounded-lg transition-colors hover:bg-gray-200 flex items-center gap-2">
                    <GraduationCap size={16} /> لوحة الطالب
                  </Link>
                  <Link href="/instructor" className="hidden md:flex text-sm font-bold text-white bg-mint px-4 py-2 rounded-lg transition-colors hover:bg-[#0a754f] items-center gap-2">
                    <LayoutDashboard size={16} /> بوابة المدرس
                  </Link>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors" title="تسجيل الخروج">
                    <LogOut size={18} />
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login?redirect=/dashboard" className="text-sm font-bold text-ink px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                  دخول الطالب
                </Link>
                <Link href="/login?redirect=/dashboard" className="text-sm font-bold bg-mint text-white px-5 py-2 rounded-lg hover:bg-[#0a754f] transition-colors shadow-sm">
                  دخول المدرس
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero Section (Mintlify Style: Dark Teal to Monastic White with Clouds) */}
        {/* The background uses a strict teal gradient fading into white, typical of the Mintlify brand identity */}
        <section className="relative pt-32 pb-40 overflow-hidden bg-gradient-to-b from-[#0d3b45] via-[#10535e] to-white text-white">
          
          {/* Hand-illustrated cloud effect (Pure CSS solution replacing the image for better load times) */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-70 pointer-events-none mix-blend-overlay">
             <div className="absolute bottom-0 left-10 w-96 h-96 bg-white rounded-full filter blur-[80px] opacity-40 mix-blend-soft-light"></div>
             <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#34d399] rounded-full filter blur-[100px] opacity-20 mix-blend-screen"></div>
             <div className="absolute -bottom-10 left-1/3 w-[500px] h-[500px] bg-white rounded-full filter blur-[100px] opacity-50 mix-blend-overlay"></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399] px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-wider backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
              المنصة التعليمية الأولى المدعومة بالذكاء الاصطناعي
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight text-white drop-shadow-lg">
              المنصة الذكية <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#34d399]">لصناعة المعرفة</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
              تدمج منصة مسار التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي لتجربة تعليمية فريدة من نوعها.
            </p>
            
            <div className="relative w-full max-w-xl mx-auto flex items-center bg-white rounded-xl p-1.5 shadow-2xl border border-gray-100">
               <Search size={20} className="text-gray-400 mr-3" />
               <input
                  type="text"
                  placeholder="ابحث عن مهارة، برمجة، تسويق..."
                  className="w-full py-3 px-3 text-base font-bold text-ink outline-none bg-transparent"
                />
                <button className="bg-ink text-white h-12 px-8 text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shrink-0">
                  ابحث
                </button>
            </div>
            
            <div className="mt-12 flex justify-center gap-4">
              {/* التعديل التسويقي: استكشف الكورسات */}
               <Link href="/courses" className="text-sm font-bold bg-white text-ink px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-lg border border-gray-100">
                  استكشف الكورسات
               </Link>
               <Link href="/pricing" className="text-sm font-bold bg-transparent border border-[#34d399]/30 text-white px-8 py-3 rounded-xl hover:bg-[#34d399]/10 transition-colors backdrop-blur-sm">
                  باقات المدرسين
               </Link>
            </div>
          </div>
        </section>

        {/* 3. Floating UI Mockup (Mintlify Glass Desk Style) */}
        <section className="relative z-20 -mt-24 max-w-5xl mx-auto px-6 mb-24">
           <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-6 text-black grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50/80 p-4 rounded-xl flex flex-col justify-between border border-gray-100 backdrop-blur-sm">
                 <div className="text-xs font-bold text-mint uppercase tracking-wider">نموذج قاعة الدرس</div>
                 <div className="font-bold text-sm mt-2">أساسيات البرمجة الذكية</div>
                 <div className="text-xs text-gray-500 mt-4 flex items-center gap-1 font-bold"><PlayCircle size={14} className="text-mint" /> فيديو مشفر بتقنية متقدمة</div>
              </div>
              <div className="bg-mint/5 border border-mint/20 p-5 rounded-xl md:col-span-2 flex flex-col justify-between">
                 <div className="flex items-center gap-2 text-mint font-bold text-sm">
                    <BrainCircuit size={18} /> المعلم الذكي (AI Tutor) متصل
                 </div>
                 <p className="text-xs text-gray-700 mt-3 font-bold">طالب: "كيف يمكنني تطبيق هذه الدالة في مشروع بايثون العملي الخاص بي؟"</p>
                 <div className="bg-white p-3 rounded-lg text-xs font-bold text-ink mt-2 shadow-sm border border-gray-100 leading-relaxed relative">
                    {/* Mintlify Active State Green Dot */}
                    <div className="absolute -left-1 -top-1 w-3 h-3 bg-mint rounded-full border-2 border-white shadow-sm"></div>
                    المعلم الذكي: "يمكنك استخدامها مباشرة عبر استدعاء المكتبة كما هو موضح بالتفصيل في الدقيقة 4:12 من هذا الدرس. دعني أكتب لك مثالاً برمجياً..."
                 </div>
              </div>
           </div>
        </section>

        {/* 4. Categories Section (Monastic White Background) */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center md:text-right">
               <div className="text-[13px] font-bold text-mint uppercase tracking-[0.05em] mb-2">التصنيفات الرئيسية</div>
               <h2 className="text-3xl font-black text-ink tracking-tight">استكشف مجالات المستقبل</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all bg-white cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mb-5 text-mint group-hover:bg-mint/10 transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-1">{cat.title}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">{cat.desc}</p>
                  <span className="text-xs font-bold text-mint">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Magic School AI Features Section */}
        <section id="features" className="py-24 px-6 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-mint uppercase tracking-widest mb-4">
                قوة الذكاء الاصطناعي
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
                أدوات خارقة للمدرس والطالب
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-mint mb-6"><BrainCircuit size={36} strokeWidth={1.5} /></div>
                <h3 className="text-xl font-bold text-ink mb-3">معلم آلي تفاعلي</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  مساعد ذكي يرافق الطالب أثناء المشاهدة، يجيب على الأسئلة من صميم المادة العلمية، ويرشده لأوقات الشرح داخل الفيديو بدقة.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-ink mb-6"><Shield size={36} strokeWidth={1.5} /></div>
                <h3 className="text-xl font-bold text-ink mb-3">حماية سينمائية DRM</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  نحمي محتواك الفكري بتقنيات تشفير قوية تمنع التحميل والإضافات غير القانونية، لتركز أنت على صناعة محتوى عظيم بأمان.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-ink mb-6"><Sparkles size={36} strokeWidth={1.5} /></div>
                <h3 className="text-xl font-bold text-ink mb-3">مساعد المدرس السحري</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  أدوات ذكية للمحاضرين لتوليد الاختبارات، كتابة وصف الكورسات، وتحليل أداء الطلاب بضغطة زر واحدة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Dynamic Courses Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl font-black text-ink tracking-tight">أحدث الكورسات المنشورة</h2>
                    <p className="text-gray-500 font-medium mt-2">تعلم من أفضل الخبراء المعتمدين في منصة مسار.</p>
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
                  <Link href={`/courses/${course.slug}`} key={course.id} className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:border-gray-200 transition-all group no-underline">
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
                      <p className="text-sm font-medium text-gray-500 mb-6">{course.profiles?.full_name || 'مدرس معتمد'}</p>
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
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-500 font-bold">
                لا توجد كورسات متاحة حالياً.
              </div>
            )}
          </div>
        </section>

      </main>

      {/* 8. Footer (Dark Ink replacing True Black) */}
      <footer className="bg-[#0c1117] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="font-bold flex items-center gap-2 mb-6 text-white no-underline">
                <Image src="/logo.png" alt="MASAR Logo" width={100} height={30} className="object-contain brightness-0 invert opacity-90" />
              </Link>
              <p className="text-sm text-gray-400 font-medium leading-relaxed pr-2">
                منصة مسار هي بيئتك التعليمية المتكاملة المدعومة بالذكاء الاصطناعي لحماية وبيع وتقديم المحتوى بأعلى جودة.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base mb-6 text-white">المنصة</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-400 list-none p-0">
                <li><Link href="/courses" className="hover:text-white transition-colors no-underline text-gray-400">تصفح الكورسات</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors no-underline text-gray-400">تسجيل كطالب</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-6 text-white">المميزات</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-400 list-none p-0">
                <li><span className="hover:text-white cursor-pointer transition-colors">التشفير وحماية DRM</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">المعلم الذكي (AI Tutor)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-6 text-white">القانونية</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-400 list-none p-0">
                <li><span className="hover:text-white cursor-pointer transition-colors">شروط الاستخدام</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">سياسة الخصوصية</span></li>
              </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex justify-between items-center flex-wrap gap-4 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-2">
            <Lock size={14} /> جميع الحقوق محفوظة © 2026 مسار
          </div>
          <div>مدعوم بتشفير بنكي وبنية تحتية آمنة</div>
        </div>
      </footer>

    </div>
  );
}