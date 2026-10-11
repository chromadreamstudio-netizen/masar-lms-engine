'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, PlayCircle, BookOpen, LogOut, LayoutDashboard,
  Star, Shield, MonitorPlay, ArrowRight, Check, ChevronDown, 
  Sparkles, BrainCircuit, Code, Palette, Briefcase, TrendingUp, 
  MessageSquare, Users, Globe, Lock, FileText, Mail
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
    { q: 'كيف يعمل المعلم الذكي (AI Tutor) في مسار؟', a: 'يتم تدريب المعلم الذكي حصرياً على المادة العلمية الخاصة بكل كورس بواسطة المحاضر. أثناء مشاهدتك للدرس، يمكنك سؤاله أي سؤال، وسيجيبك بناءً على سياق الكورس، بل ويرشدك للدقيقة المحددة في الفيديو التي تشرح النقطة.' },
    { q: 'هل يمكنني الانضمام كصانع محتوى (محاضر)؟', a: 'نعم بالتأكيد. منصة مسار توفر لك بنية تحتية متكاملة تشمل حماية الفيديوهات (DRM)، أدوات الذكاء الاصطناعي لتوليد الاختبارات، ولوحة تحكم مالية دقيقة لتسعير وبيع كورساتك بحرية.' },
    { q: 'هل الفيديوهات محمية من السرقة؟', a: 'نعم، نستخدم تقنيات التشفير المتقدمة (DRM) بالتعاون مع Bunny.net لضمان عدم إمكانية تحميل أو سرقة المحتوى التعليمي بأي شكل من الأشكال.' },
    { q: 'هل الكورسات مسجلة أم بث مباشر؟', a: 'الكورسات مسجلة مسبقاً بأعلى جودة، مما يتيح لك التعلم بالسرعة التي تناسبك، وفي أي وقت ومن أي مكان، مع وصول مدى الحياة للمحتوى.' }
  ];

  const categories = [
    { title: 'البرمجة والتطوير', icon: <Code size={24} />, count: '١٢٠+ كورس', color: 'text-blue-500' },
    { title: 'الذكاء الاصطناعي', icon: <BrainCircuit size={24} />, count: '٤٥+ كورس', color: 'text-[var(--color-mint-green)]' },
    { title: 'التصميم والجرافيك', icon: <Palette size={24} />, count: '٨٠+ كورس', color: 'text-purple-500' },
    { title: 'ريادة الأعمال', icon: <Briefcase size={24} />, count: '٦٠+ كورس', color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-paper-white)] text-[var(--color-true-black)] font-sans dir-rtl" dir="rtl">
      
      {/* 1. Header (Mintlify Premium Style) */}
      <header className="bg-[var(--color-paper-white)] border-b border-[var(--color-mist-gray)] sticky top-0 z-50 transition-all">
        <div className="max-w-[var(--page-max-width)] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-[var(--color-ink-black)] flex items-center gap-2 tracking-tight">
              <Sparkles className="text-[var(--color-mint-green)]" size={20} />
              <span className="text-[18px]">MASAR</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[var(--color-ink-black)]/80">
              <Link href="/courses" className="hover:text-[var(--color-mint-green)] transition-colors">تصفح الكورسات</Link>
              <Link href="#features" className="hover:text-[var(--color-mint-green)] transition-colors">المميزات السحرية</Link>
              <Link href={user ? "/instructor" : "/login?redirect=/instructor"} className="hover:text-[var(--color-mint-green)] transition-colors">التدريس في مسار</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center relative">
              <Search size={16} className="absolute right-3 text-[var(--color-true-black)]/40" />
              <input 
                type="text" 
                placeholder="ابحث عن مهارة..." 
                className="bg-[var(--color-mist-gray)]/50 border border-transparent focus:border-[var(--color-cloud-gray)] rounded-[var(--radius-inputs)] py-1.5 pr-9 pl-4 text-[13px] outline-none w-48 transition-all focus:bg-[var(--color-paper-white)]"
              />
            </div>
            
            {user ? (
              <div className="flex items-center gap-3 border-r border-[var(--color-mist-gray)] pr-4">
                 <Link href="/dashboard" className="text-[14px] font-medium text-[var(--color-ink-black)] hover:bg-[var(--color-mist-gray)] px-4 py-2 rounded-[var(--radius-buttons)] transition-colors flex items-center gap-2">
                    <LayoutDashboard size={16} /> لوحتي
                  </Link>
                  <button onClick={handleSignOut} className="text-[14px] font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-[var(--radius-buttons)] transition-colors">
                    <LogOut size={16} />
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-[14px] font-medium text-[var(--color-ink-black)] hover:bg-[var(--color-mist-gray)] px-4 py-2 rounded-[var(--radius-buttons)] transition-colors">
                  دخول
                </Link>
                <Link href="/login" className="text-[14px] font-medium bg-[var(--color-ink-black)] text-[var(--color-paper-white)] px-4 py-2 rounded-[var(--radius-buttons)] shadow-mint-sm hover:opacity-90 transition-opacity">
                  ابدأ مجاناً
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b border-[var(--color-mist-gray)]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--color-mint-green)]/[0.03] to-[var(--color-paper-white)] -z-10"></div>
          <div className="max-w-[var(--page-max-width)] mx-auto px-6 text-center flex flex-col items-center">
            
            <Link href="#features" className="inline-flex items-center gap-2 bg-[var(--color-paper-white)] border border-[var(--color-mist-gray)] text-[var(--color-ink-black)] font-medium px-4 py-1.5 rounded-full text-[13px] mb-8 shadow-mint-sm hover:border-[var(--color-cloud-gray)] transition-colors">
              <span className="w-2 h-2 rounded-full bg-[var(--color-mint-green)] animate-pulse"></span>
              تعرف على المعلم الذكي الجديد كلياً <ArrowRight size={14} className="rotate-180 text-[var(--color-true-black)]/40" />
            </Link>

            <h1 className="text-[var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] font-semibold text-[var(--color-ink-black)] max-w-4xl mb-6">
              تعلم، وعَلِّم، بذكاء <br /> لم يسبق له مثيل.
            </h1>
            <p className="text-[var(--text-subheading)] leading-[var(--leading-subheading)] text-[var(--color-true-black)]/70 max-w-2xl mb-10">
              المنصة التعليمية الأولى التي تدمج التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي لكل طالب ومدرس.
            </p>
            
            <div className="relative w-full max-w-2xl mx-auto flex items-center bg-[var(--color-paper-white)] rounded-[var(--radius-inputs)] border border-[var(--color-cloud-gray)] shadow-mint-md focus-within:border-[var(--color-mint-green)] transition-all overflow-hidden h-14 pl-1">
               <Search size={22} className="text-[var(--color-true-black)]/40 absolute right-4" />
               <input
                  type="text"
                  placeholder="ابحث عن (بايثون، ذكاء اصطناعي، تسويق)..."
                  className="w-full h-full py-2 pr-14 pl-4 text-[15px] text-[var(--color-ink-black)] outline-none bg-transparent"
                />
                <button className="bg-[var(--color-ink-black)] text-[var(--color-paper-white)] h-11 px-8 text-[14px] font-medium rounded-[var(--radius-buttons)] hover:opacity-90 transition-opacity">
                  استكشف
                </button>
            </div>
            
            <div className="mt-10 flex items-center gap-8 text-[13px] text-[var(--color-true-black)]/60 font-medium">
              <span className="flex items-center gap-2"><Shield size={16} className="text-[var(--color-mint-green)]" /> حماية DRM</span>
              <span className="flex items-center gap-2"><BrainCircuit size={16} className="text-[var(--color-mint-green)]" /> AI Tutor</span>
              <span className="flex items-center gap-2"><MonitorPlay size={16} className="text-[var(--color-mint-green)]" /> وصول مدى الحياة</span>
            </div>
          </div>
        </section>

        {/* 3. Categories (Udemy Style Grid) */}
        <section className="py-[var(--section-gap)] bg-[var(--color-paper-white)]">
          <div className="max-w-[var(--page-max-width)] mx-auto px-6">
            <h2 className="text-[var(--text-heading-sm)] font-semibold text-[var(--color-ink-black)] mb-8 tracking-tight">
              استكشف التصنيفات
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--element-gap)]">
              {categories.map((cat, i) => (
                <Link href={`/category/${i}`} key={i} className="group border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] p-6 hover:border-[var(--color-cloud-gray)] hover:shadow-mint-sm transition-all bg-[var(--color-paper-white)]">
                  <div className={`w-12 h-12 rounded-lg bg-[var(--color-mist-gray)]/50 flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-[16px] font-semibold text-[var(--color-ink-black)] mb-1">{cat.title}</h3>
                  <p className="text-[13px] text-[var(--color-true-black)]/60">{cat.count}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Magic School Inspired Features (AI for Education) */}
        <section id="features" className="py-[var(--section-gap)] bg-[var(--color-mint-green)]/[0.02] border-y border-[var(--color-mist-gray)]">
          <div className="max-w-[var(--page-max-width)] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-[13px] font-medium text-[var(--color-mint-green)] tracking-[0.05em] uppercase mb-4">
                القوة السحرية للذكاء الاصطناعي
              </div>
              <h2 className="text-[var(--text-heading)] leading-[var(--leading-heading)] tracking-[var(--tracking-heading)] font-semibold text-[var(--color-ink-black)]">
                أدوات خارقة للمدرس والطالب
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[var(--color-paper-white)] border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] p-8 hover:shadow-mint-sm transition-shadow">
                <div className="text-[var(--color-mint-green)] mb-6"><BrainCircuit size={32} strokeWidth={1.5} /></div>
                <h3 className="text-[20px] font-semibold text-[var(--color-ink-black)] mb-3 tracking-tight">معلم آلي لكل كورس</h3>
                <p className="text-[15px] text-[var(--color-true-black)]/70 leading-relaxed">
                  مساعد ذكي يرافق الطالب أثناء المشاهدة، يجيب على الأسئلة من صميم المادة العلمية، ويرشده لأوقات الشرح داخل الفيديو بدقة.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-[var(--color-paper-white)] border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] p-8 hover:shadow-mint-sm transition-shadow">
                <div className="text-[var(--color-ink-black)] mb-6"><Shield size={32} strokeWidth={1.5} /></div>
                <h3 className="text-[20px] font-semibold text-[var(--color-ink-black)] mb-3 tracking-tight">حماية سينمائية DRM</h3>
                <p className="text-[15px] text-[var(--color-true-black)]/70 leading-relaxed">
                  نحمي محتواك الفكري بتقنيات تشفير قوية تمنع التحميل والإضافات غير القانونية، لتركز أنت على صناعة محتوى عظيم بأمان.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-[var(--color-paper-white)] border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] p-8 hover:shadow-mint-sm transition-shadow">
                <div className="text-[var(--color-ink-black)] mb-6"><Sparkles size={32} strokeWidth={1.5} /></div>
                <h3 className="text-[20px] font-semibold text-[var(--color-ink-black)] mb-3 tracking-tight">مساعد المدرس السحري</h3>
                <p className="text-[15px] text-[var(--color-true-black)]/70 leading-relaxed">
                  أدوات ذكية للمحاضرين لتوليد الاختبارات، كتابة وصف الكورسات، وتحليل أداء الطلاب بضغطة زر واحدة.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Trending Courses (Dynamic from Supabase) */}
        <section className="py-[var(--section-gap)] bg-[var(--color-paper-white)]">
          <div className="max-w-[var(--page-max-width)] mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-[var(--text-heading-sm)] font-semibold text-[var(--color-ink-black)] tracking-tight">أحدث الكورسات المنشورة</h2>
                <p className="text-[14px] text-[var(--color-true-black)]/60 mt-2">تعلم من أفضل الخبراء على منصة مسار</p>
              </div>
              <Link href="/courses" className="hidden md:flex items-center gap-1 text-[14px] font-medium text-[var(--color-ink-black)] hover:text-[var(--color-mint-green)] transition-colors">
                عرض الكل <ArrowRight size={16} className="rotate-180" />
              </Link>
            </div>
            
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--element-gap)]">
                {[1,2,3].map(n => <div key={n} className="h-72 bg-[var(--color-mist-gray)] rounded-[var(--radius-cards)] animate-pulse"></div>)}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--element-gap)]">
                {courses.map((course) => (
                  <Link href={`/courses/${course.slug}`} key={course.id} className="flex flex-col bg-[var(--color-paper-white)] border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] overflow-hidden hover:border-[var(--color-cloud-gray)] hover:shadow-mint-sm transition-all group">
                    <div className="aspect-video bg-[var(--color-ink-black)] flex items-center justify-center relative overflow-hidden">
                      <MonitorPlay className="w-12 h-12 text-[var(--color-paper-white)]/20 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 bg-[var(--color-paper-white)]/90 backdrop-blur-sm text-[var(--color-ink-black)] text-[11px] font-semibold px-2.5 py-1 rounded-[4px] shadow-sm flex items-center gap-1">
                        <Sparkles size={12} className="text-[var(--color-mint-green)]" /> AI Ready
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-semibold text-[18px] leading-[1.4] text-[var(--color-ink-black)] mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-[13px] text-[var(--color-true-black)]/60 mb-4 line-clamp-1">{course.profiles?.full_name || 'مدرس معتمد'}</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="font-semibold text-[20px] text-[var(--color-ink-black)] tracking-tight">
                          {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                        </div>
                        <div className="flex items-center gap-1 text-[13px] font-medium text-[var(--color-ink-black)]">
                          <Star size={14} className="fill-amber-400 text-amber-400" /> 4.9 <span className="text-[var(--color-true-black)]/40">(١٢٠)</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] bg-[var(--color-mist-gray)]/20">
                <p className="text-[var(--color-true-black)]/60 text-[14px]">لا توجد كورسات متاحة حالياً.</p>
              </div>
            )}
          </div>
        </section>

        {/* 6. Testimonials (Social Proof) */}
        <section className="py-[var(--section-gap)] bg-[var(--color-mint-green)]/[0.02] border-t border-[var(--color-mist-gray)]">
           <div className="max-w-[var(--page-max-width)] mx-auto px-6">
              <h2 className="text-[var(--text-heading-sm)] font-semibold text-[var(--color-ink-black)] mb-12 text-center tracking-tight">
                ماذا يقولون عن منصة مسار؟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { t: "التفاعل مع المعلم الذكي أثناء الفيديو وفر علي ساعات من البحث الخارجي. تقنية مذهلة حقاً!", n: "أحمد منصور", r: "طالب هندسة برمجيات" },
                   { t: "كمحاضر، كنت أعاني من سرقة كورساتي. مع تقنية DRM في مسار، نمت قرير العين وبدأت أحقق أرباحاً حقيقية.", n: "د. سارة خليل", r: "محاضرة تسويق رقمي" },
                   { t: "واجهة المستخدم نظيفة جداً ولا تشتت الانتباه. ركزت فقط على التعلم، والكورسات جودتها تنافس المنصات العالمية.", n: "عمر خالد", r: "مصمم واجهات" }
                 ].map((test, i) => (
                   <div key={i} className="bg-[var(--color-paper-white)] border border-[var(--color-mist-gray)] p-8 rounded-[var(--radius-cards)] flex flex-col">
                      <div className="flex text-amber-400 mb-4"><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/></div>
                      <p className="text-[15px] text-[var(--color-true-black)]/80 leading-relaxed mb-6 flex-1">"{test.t}"</p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[var(--color-mist-gray)] flex items-center justify-center text-[var(--color-ink-black)] font-bold">{test.n.charAt(0)}</div>
                         <div>
                           <div className="text-[14px] font-semibold text-[var(--color-ink-black)]">{test.n}</div>
                           <div className="text-[12px] text-[var(--color-true-black)]/60">{test.r}</div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 7. FAQ (Accordion Style) */}
        <section className="py-[var(--section-gap)] bg-[var(--color-paper-white)]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-[var(--text-heading-sm)] font-semibold text-[var(--color-ink-black)] mb-8 text-center tracking-tight">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-[var(--color-mist-gray)] rounded-[var(--radius-cards)] overflow-hidden transition-all duration-200">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-right p-6 flex justify-between items-center bg-[var(--color-paper-white)] hover:bg-[var(--color-mist-gray)]/30 transition-colors"
                  >
                    <span className="font-semibold text-[15px] text-[var(--color-ink-black)]">{faq.q}</span>
                    <ChevronDown size={18} className={`text-[var(--color-true-black)]/50 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="p-6 pt-0 text-[14px] leading-relaxed text-[var(--color-true-black)]/70 bg-[var(--color-paper-white)]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* 8. Footer (Professional & Complete) */}
      <footer className="bg-[var(--color-ink-black)] text-[var(--color-paper-white)] py-16 border-t border-[#1a1a1a]">
        <div className="max-w-[var(--page-max-width)] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="md:col-span-1">
              <Link href="/" className="font-bold flex items-center gap-2 tracking-tight mb-6">
                <Sparkles className="text-[var(--color-mint-green)]" size={20} />
                <span className="text-[18px]">MASAR</span>
              </Link>
              <p className="text-[13px] text-[var(--color-paper-white)]/60 leading-relaxed mb-6">
                منصة مسار هي بيئتك التعليمية المتكاملة المدعومة بالذكاء الاصطناعي لحماية وبيع وتقديم المحتوى بأعلى جودة.
              </p>
              <div className="flex gap-4 text-[var(--color-paper-white)]/40">
                 <Link href="#" className="hover:text-[var(--color-mint-green)] transition-colors"><Globe size={20}/></Link>
                 <Link href="#" className="hover:text-[var(--color-mint-green)] transition-colors"><Mail size={20}/></Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[15px] mb-6">المنصة</h4>
              <ul className="space-y-3 text-[13px] text-[var(--color-paper-white)]/60">
                <li><Link href="/courses" className="hover:text-[var(--color-paper-white)] transition-colors">تصفح الكورسات</Link></li>
                <li><Link href="/login" className="hover:text-[var(--color-paper-white)] transition-colors">تسجيل كطالب</Link></li>
                <li><Link href="/login?redirect=/instructor" className="hover:text-[var(--color-paper-white)] transition-colors">التدريس في مسار</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">أسعار المنصة للمدربين</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[15px] mb-6">المميزات</h4>
              <ul className="space-y-3 text-[13px] text-[var(--color-paper-white)]/60">
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">التشفير وحماية DRM</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">المعلم الذكي (AI Tutor)</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">توليد الاختبارات بالـ AI</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">تحليلات ذكية</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[15px] mb-6">القانونية والدعم</h4>
              <ul className="space-y-3 text-[13px] text-[var(--color-paper-white)]/60">
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">شروط الاستخدام</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">مركز المساعدة</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-paper-white)] transition-colors">تواصل معنا</Link></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-[#1a1a1a] pt-8 flex flex-col md:flex-row items-center justify-between text-[12px] text-[var(--color-paper-white)]/40">
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