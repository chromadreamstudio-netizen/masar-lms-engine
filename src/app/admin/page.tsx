import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, BrainCircuit, Activity, 
  PlusCircle, ShieldCheck, ArrowUpRight, ArrowLeft 
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. التحقق من هوية وصلاحية المدير
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard'); // طرد أي مستخدم عادي إلى لوحة الطالب
  }

  // 2. تجميع الإحصائيات السحابية الحية
  const [{ count: totalStudents }, { count: totalCourses }, { data: courses }] = await Promise.all([
    supabase.from('enrollments').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('id, title, slug, is_published, price, created_at').order('created_at', { ascending: false })
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl" dir="rtl">
      
      {/* الترويسة العلوية للإدارة */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[#00a88f] font-semibold mb-1 text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>لوحة التحكم المركزية | MASAR CMS Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">إدارة منصة مسار العالمية</h1>
          <p className="text-slate-400 text-xs mt-1">
            التحكم في المناهج التعليمية، حسابات الطلاب، وتكاليف الذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition flex items-center gap-2 border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            معاينة حساب الطالب
          </Link>
          <Link
            href="/admin/courses/new"
            className="px-5 py-2.5 rounded-xl bg-[#00a88f] hover:bg-[#008f7a] text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-[#00a88f]/20"
          >
            <PlusCircle className="w-4 h-4" />
            إضافة كورس جديد
          </Link>
        </div>
      </header>

      {/* بطاقات المؤشرات الرئيسية (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">الطلاب المسجلين</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{totalStudents || 0}</h3>
          <span className="text-[11px] text-emerald-400 mt-2 block">اشتراكات مفعلة</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">الكورسات المتاحة</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <BookOpen size={18} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{totalCourses || 0}</h3>
          <span className="text-[11px] text-slate-500 mt-2 block">جاهزة للبث المباشر</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">نموذج المعلم الذكي</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <BrainCircuit size={18} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white">Gemini 1.5 Flash</h3>
          <span className="text-[11px] text-purple-400 mt-2 block">معدل الاستجابة فائق السرعة</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">حالة السيرفرات</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Activity size={18} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-emerald-400">تشغيل مستقر 100%</h3>
          <span className="text-[11px] text-slate-500 mt-2 block">Vercel & Supabase Sync</span>
        </div>
      </div>

      {/* جدول إدارة الدورات التدريبية */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">مكتبة الكورسات (CMS)</h2>
            <p className="text-xs text-slate-400">إدارة مسارات التعليم وحالة نشر المحتوى للطلاب</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">عنوان الكورس</th>
                <th className="p-4">المعرف (Slug)</th>
                <th className="p-4">السعر</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {courses?.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">{c.title}</td>
                  <td className="p-4 text-slate-400 font-mono">{c.slug}</td>
                  <td className="p-4 text-emerald-400 font-bold">${c.price || '0.00'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'}`}>
                      {c.is_published ? 'منشور للطلاب' : 'مسودة'}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <Link
                      href={`/learn/${c.slug}`}
                      className="inline-flex items-center gap-1 text-[#00a88f] hover:underline font-bold"
                    >
                      فتح المشغل <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}