'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, Loader2, CheckCircle, XCircle, 
  Search, Video, BookOpen, AlertTriangle
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. التحقق من صلاحيات المدير (Super Admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);

      // 2. جلب كل الكورسات، مرتبة بالأحدث، وجلب اسم المدرس معها
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (coursesData) {
        setCourses(coursesData);
      }
      setIsLoading(false);
    };

    fetchAdminData();
  }, [router, supabase]);

  const handleUpdateStatus = async (courseId: string, newStatus: string) => {
    setActionLoading(courseId);
    
    // إذا كانت الحالة القديمة للنشر (published)، نوقفها ونجعل الحالة الجديدة سارية
    const isPublished = newStatus === 'approved';

    const { error } = await supabase
      .from('courses')
      .update({ 
        status: newStatus,
        is_published: isPublished // نحدث القديم والجديد لتجنب أي تعارض في العرض
      })
      .eq('id', courseId);

    if (!error) {
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: newStatus, is_published: isPublished } : c));
    } else {
      alert('حدث خطأ أثناء التحديث');
    }
    setActionLoading(null);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
              <ShieldCheck className="w-6 h-6" />
              <span>لوحة الإدارة المركزية (Super Admin)</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">مراجعة واعتماد الكورسات</h1>
          </div>
          <Link href="/dashboard" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition shadow-sm">
            العودة للرئيسية
          </Link>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">الكورسات المرفوعة على المنصة</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute right-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="ابحث عن كورس..." className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">الكورس</th>
                  <th className="p-4">المُدرّس</th>
                  <th className="p-4">الحالة (Status)</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">إجراءات المراجعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">لا توجد كورسات في المنصة حتى الآن.</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{course.title}</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">{course.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {course.profiles?.full_name || 'غير محدد'}
                      </td>
                      <td className="p-4">
                        {course.status === 'approved' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> معتمد ومنشور</span>}
                        {course.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3"/> قيد المراجعة</span>}
                        {(!course.status || course.status === 'draft') && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold w-max">مسودة (لم يطلب النشر)</span>}
                        {course.status === 'rejected' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> مرفوض</span>}
                      </td>
                      <td className="p-4 font-bold text-slate-900">${course.price}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/learn/${course.slug}`} target="_blank" className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition" title="معاينة الكورس">
                            <Video className="w-4 h-4" />
                          </Link>
                          
                          {course.status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateStatus(course.id, 'approved')}
                              disabled={actionLoading === course.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                            >
                              {actionLoading === course.id ? 'جاري...' : 'موافقة ونشر'}
                            </button>
                          )}

                          {course.status === 'approved' && (
                            <button 
                              onClick={() => handleUpdateStatus(course.id, 'rejected')}
                              disabled={actionLoading === course.id}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition disabled:opacity-50"
                            >
                              {actionLoading === course.id ? 'جاري...' : 'إيقاف النشر'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}