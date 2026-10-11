import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, Users, BookOpen, PlusCircle, 
  TrendingUp, PlayCircle, Star, ArrowLeft, Rocket, CheckCircle2, Home
} from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function InstructorDashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/instructor');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  async function upgradeToInstructor() {
    'use server';
    const cookieStore = await cookies();
    const supabaseAction = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
      }
    );
    const { data: { user } } = await supabaseAction.auth.getUser();
    if (user) {
      await supabaseAction.from('profiles').update({ role: 'instructor' }).eq('id', user.id);
      await supabaseAction.from('instructor_wallets').upsert({ instructor_id: user.id, balance: 0 }, { onConflict: 'instructor_id' });
    }
    revalidatePath('/instructor');
  }

  // شاشة تفعيل حساب المدرس (بالهوية البيضاء النظيفة)
  if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 dir-rtl" dir="rtl">
        {/* زر العودة للرئيسية */}
        <Link href="/" className="absolute top-6 right-6 flex items-center gap-2 text-gray-500 hover:text-mint font-bold transition-colors">
          <Home size={20} /> العودة للرئيسية
        </Link>

        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-mint"></div>
          
          <div className="w-24 h-24 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-12 h-12 text-mint" />
          </div>
          
          <h1 className="text-3xl font-black text-ink mb-4">كن صانع محتوى في مسار</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
            حسابك مسجل حالياً كـ "طالب". للبدء في نشر كورساتك والوصول إلى لوحة المبيعات، يجب تفعيل حساب التدريس.
          </p>

          <div className="text-right bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
            <h3 className="font-bold text-sm mb-4 text-ink">صلاحيات المدرس تشمل:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                <CheckCircle2 size={18} className="text-mint" /> لوحة تحكم مالية ومتابعة المبيعات.
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                <CheckCircle2 size={18} className="text-mint" /> حماية وتشفير الفيديوهات (DRM).
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                <CheckCircle2 size={18} className="text-mint" /> المعلم الذكي للرد على أسئلة الطلاب.
              </li>
            </ul>
          </div>
          
          <form action={upgradeToInstructor}>
            {/* لاحظ استخدام font-black ليكون الخط عريضاً وقوياً */}
            <button type="submit" className="w-full bg-ink hover:bg-gray-800 text-white py-4 rounded-xl font-black text-base transition-all shadow-md flex items-center justify-center gap-2">
              <PlusCircle size={20} />
              تفعيل حساب التدريس الآن
            </button>
          </form>
        </div>
      </div>
    );
  }

  // جلب البيانات
  const [walletRes, coursesRes] = await Promise.all([
    supabase.from('instructor_wallets').select('balance').eq('instructor_id', user.id).single(),
    supabase.from('courses').select('id, title, slug, price, is_published, created_at').eq('instructor_id', user.id).order('created_at', { ascending: false })
  ]);

  const walletBalance = walletRes.data?.balance || 0.00;
  const myCourses = coursesRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 md:p-10 dir-rtl" dir="rtl">
      
      {/* الترويسة العلوية للمدرس (شريط التنقل) */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-mint font-bold mb-2 text-sm">
            <Star className="w-4 h-4 fill-mint" />
            <span>بوابة صناع المحتوى | MASAR Creators</span>
          </div>
          <h1 className="text-3xl font-black text-ink">مرحباً كابتن {profile?.full_name || 'أستاذ'}! 👋</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2.5 rounded-xl bg-white text-gray-700 font-bold text-sm transition hover:bg-gray-100 flex items-center gap-2 border border-gray-200 shadow-sm">
            <Home className="w-4 h-4" /> العودة للرئيسية
          </Link>
          <Link href="/instructor/courses/new" className="px-5 py-2.5 rounded-xl bg-mint hover:bg-[#0a754f] text-white font-bold text-sm transition flex items-center gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" /> كورس جديد
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* لوحة المؤشرات المالية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-bold">إجمالي الأرباح</span>
              <div className="p-2 bg-mint/10 text-mint rounded-lg"><TrendingUp size={18} /></div>
            </div>
            <h3 className="text-4xl font-black text-ink">${walletBalance}</h3>
            <button className="mt-4 text-sm font-bold text-mint hover:underline transition-colors flex items-center gap-1">
              طلب سحب الأرباح <ArrowLeft size={14} />
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-bold">الطلاب النشطين</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
            </div>
            <h3 className="text-4xl font-black text-ink">0</h3>
            <span className="text-xs font-bold text-gray-400 mt-2 block">إجمالي التسجيلات</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-bold">كورساتي</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BookOpen size={18} /></div>
            </div>
            <h3 className="text-4xl font-black text-ink">{myCourses.length}</h3>
            <span className="text-xs font-bold text-gray-400 mt-2 block">كورس متاح على المنصة</span>
          </div>
        </div>

        {/* قائمة الكورسات */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink">إدارة محتواك التعليمي</h2>
          </div>

          {myCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold">الكورس</th>
                    <th className="p-4 font-bold">العنوان</th>
                    <th className="p-4 font-bold">السعر</th>
                    <th className="p-4 font-bold">الحالة</th>
                    <th className="p-4 font-bold text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myCourses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-24 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          <PlayCircle size={20} className="text-gray-400" />
                        </div>
                      </td>
                      <td className="p-4 font-bold text-ink text-base">{course.title}</td>
                      <td className="p-4 text-mint font-bold text-base">${course.price}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${course.is_published ? 'bg-mint/10 text-mint' : 'bg-gray-100 text-gray-500'}`}>
                          {course.is_published ? 'منشور (Live)' : 'مسودة'}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <Link href={`/instructor/courses/${course.id}`} className="text-ink hover:text-white hover:bg-ink transition-colors text-sm font-bold bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg">
                          إدارة المنهج
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={24} className="text-gray-400" />
              </div>
              <h3 className="text-ink font-bold text-lg mb-2">لم تقم بإنشاء أي كورسات بعد</h3>
              <Link href="/instructor/courses/new" className="inline-flex mt-4 items-center gap-2 bg-ink hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                <PlusCircle size={18} /> إنشاء أول كورس
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}