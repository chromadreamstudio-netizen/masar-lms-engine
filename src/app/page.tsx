'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, PlayCircle, BookOpen, UserPlus, LogIn, LogOut, LayoutDashboard,
  Star, Clock, Shield, MonitorPlay
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
        .select('id, title, slug, description, price, instructor_id')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6); // زيادة العدد لملء الواجهة
      
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
    <div className="min-h-screen bg-white text-slate-900 font-sans dir-rtl" dir="rtl">
      
      {/* شريط التصفح الرئيسي (Header) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-6">
            
            {/* الشعار */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-[#00a88f] rounded-lg flex items-center justify-center text-white font-black text-xl">
                M
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 hidden sm:block">مسار</span>
            </Link>

            {/* شريط البحث المدمج (مثل Udemy) */}
            <div className="hidden md:flex flex-1 max-w-2xl relative">
              <input
                type="text"
                placeholder="ابحث عن أي شيء (مثال: تطوير الويب، إدارة الأعمال)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-full py-3 pr-12 pl-4 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#00a88f] focus:ring-1 focus:ring-[#00a88f] transition-all"
              />
              <Search size={20} className="absolute right-4 top-3.5 text-slate-400" />
            </div>

            {/* الأزرار العلوية */}
            <div className="flex items-center gap-4 shrink-0">
              
              {/* رابط التدريس (Instructor Link) */}
              <Link 
                href={user ? "/instructor" : "/login?redirect=/instructor"} 
                className="hidden lg:block text-sm font-bold text-slate-600 hover:text-[#00a88f] transition-colors"
              >
                التدريس في مسار
              </Link>

              <div className="h-6 w-[1px] bg-slate-200 hidden lg:block"></div>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/dashboard" 
                    className="text-sm font-bold text-slate-700 hover:text-[#00a88f] transition-colors"
                  >
                    لوحة التحكم
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/login" 
                    className="text-sm font-bold text-slate-700 hover:text-[#00a88f] border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link 
                    href="/login" 
                    className="text-sm font-bold text-white bg-[#00a88f] hover:bg-[#008f7a] px-4 py-2 rounded-lg transition-colors"
                  >
                    حساب جديد
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* قسم البطل (Hero Section) - تصميم نظيف ومباشر */}
      <section className="bg-slate-50 py-16 md:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              تعلم المهارات التي تحتاجها، <br />
              في الوقت الذي تريده.
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
              استكشف آلاف الكورسات في البرمجة، التصميم، التسويق، وغيرها، وتفاعل مع المعلم الذكي للحصول على شرح مخصص في أي وقت.
            </p>
            
            {/* شريط بحث إضافي للموبايل */}
            <div className="md:hidden relative w-full mb-8">
              <input
                type="text"
                placeholder="ماذا تريد أن تتعلم اليوم؟"
                className="w-full bg-white border border-slate-300 rounded-full py-3 pr-12 pl-4 text-sm text-slate-900 focus:outline-none focus:border-[#00a88f]"
              />
              <Search size={20} className="absolute right-4 top-3.5 text-slate-400" />
            </div>

          </div>
        </div>
      </section>

      {/* قسم الكورسات (الكورسات الرائجة) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-8">أحدث الكورسات الرائجة</h2>

          {isLoadingCourses ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a88f]"></div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Link 
                  href={`/courses/${course.slug}`} 
                  key={course.id} 
                  className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* صورة الكورس (عنصر نائب حالياً) */}
                  <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    <MonitorPlay className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                    {/* وسم المعلم الذكي */}
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                      <Star size={10} className="fill-white" /> مدعوم بـ AI
                    </div>
                  </div>
                  
                  {/* تفاصيل الكورس */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 group-hover:text-[#00a88f] transition-colors">
                      {course.title}
                    </h3>
                    
                    {/* اسم المدرس (مؤقتاً نعرض "مدرس مسار") */}
                    <p className="text-xs text-slate-500 mb-3">مدرس معتمد في مسار</p>
                    
                    {/* التقييم */}
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-sm font-bold text-slate-900">4.8</span>
                      <div className="flex text-amber-400">
                        <Star size={12} className="fill-amber-400" />
                        <Star size={12} className="fill-amber-400" />
                        <Star size={12} className="fill-amber-400" />
                        <Star size={12} className="fill-amber-400" />
                        <Star size={12} className="fill-amber-400" />
                      </div>
                      <span className="text-xs text-slate-500">(1,240)</span>
                    </div>

                    {/* السعر */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="font-black text-lg text-slate-900">
                        {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <p className="text-slate-500 text-sm">لا توجد كورسات متاحة حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* قسم دعوة المدرسين (Instructor CTA) */}
      <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="flex-1">
              <h2 className="text-3xl font-black mb-4">انضم إلينا كصانع محتوى</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl">
                شارك معرفتك مع آلاف الطلاب حول العالم، ابنِ جمهورك الخاص، وحقق دخلاً مستداماً. منصة "مسار" توفر لك كل الأدوات التي تحتاجها للنجاح، بما في ذلك الذكاء الاصطناعي المدمج.
              </p>
              <Link 
                href={user ? "/instructor" : "/login?redirect=/instructor"} 
                className="inline-flex items-center gap-2 bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-[#00a88f]/20"
              >
                ابدأ التدريس اليوم <ArrowRight size={20} />
              </Link>
            </div>
            
            {/* صورة تعبيرية (عنصر نائب) */}
            <div className="flex-1 w-full max-w-md hidden md:block">
              <div className="aspect-square bg-gradient-to-tr from-[#00a88f]/20 to-purple-600/20 rounded-full flex items-center justify-center p-8 border border-white/10">
                 <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center shadow-2xl">
                    <UserPlus size={64} className="text-[#00a88f]" />
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}