import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, Users, BookOpen, PlusCircle, 
  TrendingUp, PlayCircle, Star, ArrowLeft
} from 'lucide-react';

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

  // 1. التحقق من المستخدم
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/instructor');

  // 2. التحقق من الصلاحيات (يجب أن يكون مدرساً أو مديراً)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
    redirect('/dashboard'); // توجيه الطالب العادي للوحة الطلاب
  }

  // 3. جلب بيانات المدرس (المحفظة، وكورساته الخاصة فقط)
  const [walletRes, coursesRes] = await Promise.all([
    supabase.from('instructor_wallets').select('balance').eq('instructor_id', user.id).single(),
    supabase.from('courses').select('id, title, slug, price, is_published, created_at').eq('instructor_id', user.id).order('created_at', { ascending: false })
  ]);

  const walletBalance = walletRes.data?.balance || 0.00;
  const myCourses = coursesRes.data || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl" dir="rtl">
      
      {/* الترويسة العلوية للمدرس */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1 text-sm">
            <Star className="w-5 h-5 fill-purple-400" />
            <span>بوابة صناع المحتوى | MASAR Creators</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">مرحباً كابتن {profile?.full_name || 'أستاذ'}! 👋</h1>
          <p className="text-slate-400 text-xs mt-1">
            تابع أرباحك، إدارة كورساتك، وتفاعل مع طلابك من مكان واحد.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition flex items-center gap-2 border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة كطالب
          </Link>
          <Link
            href="/instructor/courses/new"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            إنشاء كورس جديد
          </Link>
        </div>
      </header>

      {/* لوحة المؤشرات المالية (Dashboard Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* المحفظة المالية */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -left-6 -top-6 text-emerald-500/10">
            <Wallet size={120} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm text-slate-400 font-bold">إجمالي الأرباح المستحقة</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-white relative z-10">${walletBalance}</h3>
          <button className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors relative z-10 flex items-center gap-1">
            طلب سحب الأرباح <ArrowLeft size={14} />
          </button>
        </div>

        {/* إحصائيات الطلاب */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400 font-bold">الطلاب النشطين</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-white">0</h3>
          <span className="text-xs text-slate-500 mt-2 block">إجمالي التسجيلات في كورساتك</span>
        </div>

        {/* الكورسات */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400 font-bold">كورساتي</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <BookOpen size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-white">{myCourses.length}</h3>
          <span className="text-xs text-slate-500 mt-2 block">كورس متاح على المنصة</span>
        </div>
      </div>

      {/* قائمة الكورسات الخاصة بالمدرس */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">إدارة محتواك التعليمي</h2>
        </div>

        {myCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-bold">صورة الكورس</th>
                  <th className="p-4 font-bold">العنوان</th>
                  <th className="p-4 font-bold">السعر</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myCourses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="w-24 h-14 bg-slate-800 rounded-lg flex items-center justify-center">
                        <PlayCircle size={20} className="text-slate-500" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{course.title}</td>
                    <td className="p-4 text-emerald-400 font-bold">${course.price}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'}`}>
                        {course.is_published ? 'منشور (Live)' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <button className="text-slate-400 hover:text-white transition-colors text-xs font-bold bg-slate-800 px-3 py-2 rounded-lg">
                        تعديل الكورس
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-slate-500" />
            </div>
            <h3 className="text-white font-bold mb-2">لم تقم بإنشاء أي كورسات بعد</h3>
            <p className="text-slate-400 text-sm mb-6">ابدأ رحلتك كصانع محتوى وشارك معرفتك مع العالم.</p>
            <Link 
              href="/instructor/courses/new" 
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              <PlusCircle size={18} /> أول كورس لي
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}