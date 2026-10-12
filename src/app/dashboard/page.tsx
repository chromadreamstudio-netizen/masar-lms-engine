'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, PlayCircle, Loader2, ArrowLeft, 
  Trophy, LayoutDashboard, LogOut, Search, Sparkles, Lightbulb
} from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // جلب الكورسات التي اشترك بها الطالب
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          progress,
          courses ( id, title, slug, description )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (enrollmentData) {
        setEnrollments(enrollmentData);
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex justify-center items-center"><Loader2 className="animate-spin text-mint w-12 h-12" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans dir-rtl" dir="rtl">
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="MASAR Logo" width={100} height={30} className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-sm font-bold text-gray-600 hover:text-mint transition-colors">تصفح الكورسات</Link>
            <div className="w-px h-6 bg-gray-200"></div>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors flex items-center gap-2 text-sm font-bold">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-ink mb-2 flex items-center gap-3">
            <LayoutDashboard className="text-mint" /> لوحة التحكم التعليمية
          </h1>
          <p className="text-gray-500 font-medium text-sm">مرحباً بك مجدداً. واصل رحلة تعلمك الذكية من حيث توقفت.</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">الكورسات المسجلة</p>
              <h3 className="text-4xl font-black text-ink">{enrollments.length}</h3>
            </div>
            <div className="w-16 h-16 bg-mint/10 rounded-2xl flex items-center justify-center text-mint">
              <BookOpen size={28} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">شهادات الإنجاز</p>
              <h3 className="text-4xl font-black text-ink">0</h3>
            </div>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <Trophy size={28} />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-ink mb-6">كورساتي</h2>
        
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrollments.map((enrollment, index) => {
              const course = enrollment.courses;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                  <div className="aspect-video bg-ink flex items-center justify-center relative overflow-hidden">
                    <PlayCircle size={48} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 text-ink text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                      <Sparkles size={12} className="text-mint" /> AI Ready
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-ink mb-6 line-clamp-2">{course.title}</h3>
                    
                    {/* شريط التقدم */}
                    <div className="mt-auto mb-6">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                        <span>نسبة الإنجاز</span>
                        <span className="text-mint">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-mint h-2.5 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }}></div>
                      </div>
                    </div>

                    <Link href={`/learn/${course.slug}`} className="w-full bg-ink hover:bg-gray-800 text-white text-center py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                      متابعة التعلم <ArrowLeft size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* قسم التهيئة التفاعلية (Onboarding) للطالب الجديد */
          <div className="bg-white border border-gray-200 rounded-3xl p-10 md:p-16 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-mint"></div>
            
            <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb size={36} className="text-mint" />
            </div>
            
            <h3 className="text-2xl font-black text-ink mb-4">أهلاً بك في بداية رحلتك!</h3>
            <p className="text-gray-500 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed font-medium">
              لوحتك التعليمية فارغة حالياً لأنك لم تشترك في أي كورس بعد. منصة مسار توفر لك بيئة تعلم مدعومة بالذكاء الاصطناعي للإجابة على أسئلتك فوراً أثناء المشاهدة.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses" className="w-full sm:w-auto bg-mint text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#0a754f] transition-colors shadow-sm flex items-center justify-center gap-2">
                <Search size={18} /> استكشف الكورسات الآن
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-right grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
               <div>
                  <h4 className="font-bold text-ink text-sm mb-2 flex items-center gap-2"><Sparkles size={16} className="text-amber-500"/> 1. اختر كورس</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">تصفح مكتبتنا واختر المجال الذي تريد احترافه من بين عشرات الكورسات.</p>
               </div>
               <div>
                  <h4 className="font-bold text-ink text-sm mb-2 flex items-center gap-2"><Sparkles size={16} className="text-amber-500"/> 2. اشترك وابدأ</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">اضغط على زر الاشتراك لتبدأ رحلة التعلم المحمية في قاعة الدرس السينمائية.</p>
               </div>
               <div>
                  <h4 className="font-bold text-ink text-sm mb-2 flex items-center gap-2"><Sparkles size={16} className="text-amber-500"/> 3. اسأل المعلم الذكي</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">أثناء المشاهدة، لا تتردد في توجيه أي سؤال لمساعدك الذكي (Gemini).</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}