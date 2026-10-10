import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, Users, BookOpen, PlusCircle, 
  TrendingUp, PlayCircle, Star, ArrowLeft, Rocket, CheckCircle2
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

  // 1. التحقق من تسجيل الدخول
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/instructor');

  // 2. جلب دور المستخدم الحالي
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  // ==========================================
  // دالة الترقية (Server Action) لتحويل الطالب لمدرس
  // ==========================================
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
      // ترقية الدور إلى مدرس
      await supabaseAction.from('profiles').update({ role: 'instructor' }).eq('id', user.id);
      // إنشاء محفظة له إذا لم تكن موجودة
      await supabaseAction.from('instructor_wallets').upsert({ instructor_id: user.id, balance: 0 }, { onConflict: 'instructor_id' });
    }
    revalidatePath('/instructor');
  }

  // ==========================================
  // تجربة المستخدم (UX): شاشة تهيئة المدرسين للطالب
  // ==========================================
  if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 dir-rtl font-sans text-slate-900" dir="rtl">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00a88f] to-[#391e75]"></div>
          
          <div className="w-24 h-24 bg-gradient-to-tr from-[#00a88f]/10 to-[#391e75]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Rocket className="w-12 h-12 text-[#00a88f]" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-4">كن صانع محتوى في مسار</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
            يبدو أن حسابك مسجل حالياً كـ <b>"طالب"</b>. لتحويل حسابك والبدء في نشر كورساتك والوصول إلى لوحة المبيعات والمحفظة، يجب تفعيل حساب المدرس.
          </p>

          <div className="text-right bg-slate-50/80 rounded-2xl p-5 mb-8 border border-slate-100">
            <h3 className="font-bold text-sm mb-4 text-slate-800">صلاحيات المدرس تشمل:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 size={14} className="text-emerald-600" /></div>
                لوحة تحكم مالية لمتابعة المبيعات وسحب الأرباح.
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 size={14} className="text-emerald-600" /></div>
                رفع فيديوهاتك مشفرة ومحمية (Bunny DRM).
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 size={14} className="text-emerald-600" /></div>
                دمج المعلم الذكي (Gemini) للرد على أسئلة طلابك.
              </li>
            </ul>
          </div>
          
          <form action={upgradeToInstructor}>
            <button type="submit" className="w-full bg-gradient-to-l from-[#00a88f] to-teal-500 hover:from-teal-600 hover:to-teal-700 text-white py-4 rounded-xl font-black text-sm transition-all shadow-lg shadow-[#00a88f]/30 flex items-center justify-center gap-2 hover:-translate-y-0.5">
              <PlusCircle size={18} />
              تفعيل حساب التدريس الآن
            </button>
          </form>
          
          <Link href="/dashboard" className="inline-block mt-6 text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors hover:underline">
            العودة إلى لوحة الطالب
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // لوحة تحكم المدرس (التي ستظهر بعد التفعيل)
  // ==========================================
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
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-sm">
            <Star className="w-5 h-5 fill-emerald-400" />
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
            className="px-5 py-2.5 rounded-xl bg-[#00a88f] hover:bg-[#008f7a] text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-[#00a88f]/20"
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
          <div className="absolute -left-6 -top-6 text-[#00a88f]/10">
            <Wallet size={120} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-sm text-slate-400 font-bold">إجمالي الأرباح المستحقة</span>
            <div className="p-2 bg-[#00a88f]/10 text-[#00a88f] rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-4xl font-black text-white relative z-10">${walletBalance}</h3>
          <button className="mt-4 text-xs font-bold text-[#00a88f] hover:text-[#008f7a] transition-colors relative z-10 flex items-center gap-1">
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
              className="inline-flex items-center gap-2 bg-[#00a88f] hover:bg-[#008f7a] text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              <PlusCircle size={18} /> أول كورس لي
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}