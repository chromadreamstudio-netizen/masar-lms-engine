'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, PlayCircle, Loader2, ArrowLeft, Trophy, LayoutDashboard, LogOut } from 'lucide-react';
import Image from 'next/image';

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
    return <div className="min-h-screen bg-white flex justify-center items-center"><Loader2 className="animate-spin text-[#0c8c5e] w-12 h-12" /></div>;
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
            <Link href="/courses" className="text-sm font-bold text-gray-600 hover:text-[#0c8c5e] transition-colors">تصفح الكورسات</Link>
            <div className="w-px h-6 bg-gray-200"></div>
            <button onClick={handleSignOut} className="text-red-500 hover:text-red-700 p-2 rounded transition-colors flex items-center gap-2 text-sm font-bold">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-[#08090a] mb-2 flex items-center gap-3">
            <LayoutDashboard className="text-[#0c8c5e]" /> لوحة التحكم التعليمية
          </h1>
          <p className="text-gray-500 font-medium">مرحباً بك مجدداً. واصل رحلة تعلمك من حيث توقفت.</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">الكورسات المسجلة</p>
              <h3 className="text-3xl font-black text-[#08090a]">{enrollments.length}</h3>
            </div>
            <div className="w-14 h-14 bg-[#0c8c5e]/10 rounded-xl flex items-center justify-center text-[#0c8c5e]">
              <BookOpen size={24} />
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold mb-1">شهادات الإنجاز</p>
              <h3 className="text-3xl font-black text-[#08090a]">0</h3>
            </div>
            <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Trophy size={24} />
            </div>
          </div>
        </div>

        {/* الكورسات الحالية */}
        <h2 className="text-2xl font-bold text-[#08090a] mb-6">كورساتي</h2>
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrollments.map((enrollment, index) => {
              const course = enrollment.courses;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="aspect-video bg-[#08090a] flex items-center justify-center relative">
                    <PlayCircle size={48} className="text-white/20" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-[#08090a] mb-4 line-clamp-2">{course.title}</h3>
                    
                    {/* شريط التقدم */}
                    <div className="mt-auto mb-6">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                        <span>نسبة الإنجاز</span>
                        <span className="text-[#0c8c5e]">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#0c8c5e] h-2 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }}></div>
                      </div>
                    </div>

                    <Link href={`/learn/${course.slug}`} className="w-full bg-[#08090a] hover:bg-gray-800 text-white text-center py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm">
                      متابعة التعلم <ArrowLeft size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[#08090a] mb-2">لم تقم بالتسجيل في أي كورس بعد</h3>
            <p className="text-gray-500 text-sm mb-6">استكشف مكتبتنا التعليمية وابدأ رحلتك الآن.</p>
            <Link href="/courses" className="inline-block bg-[#0c8c5e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0a754f] transition-colors">
              تصفح الكورسات
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}