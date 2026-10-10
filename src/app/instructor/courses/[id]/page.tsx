'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, Video, Plus, GripVertical, Settings, 
  BookOpen, Trash2, CheckCircle2, PlayCircle 
} from 'lucide-react';

export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // جلب بيانات الكورس والمنهج
  useEffect(() => {
    const fetchCourseData = async () => {
      const resolvedParams = await params; // Next.js 15 requirement
      const courseId = resolvedParams.id;

      // جلب الكورس
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseData) setCourse(courseData);

      // جلب الفصول والدروس
      const { data: modulesData } = await supabase
        .from('modules')
        .select(`
          *,
          lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesData) {
        // ترتيب الدروس داخل كل فصل
        const sortedModules = modulesData.map(mod => ({
          ...mod,
          lessons: mod.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
        }));
        setModules(sortedModules);
      }
      setIsLoading(false);
    };

    fetchCourseData();
  }, [params, supabase]);

  // إضافة فصل جديد (Module)
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);

    const newOrder = modules.length;
    
    const { data, error } = await supabase
      .from('modules')
      .insert([
        { 
          course_id: course.id, 
          title: newModuleTitle, 
          order_index: newOrder 
        }
      ])
      .select()
      .single();

    if (data) {
      setModules([...modules, { ...data, lessons: [] }]);
      setNewModuleTitle('');
    }
    setIsAddingModule(false);
  };

  // دالة وهمية لإضافة درس (سيتم برمجتها في الخطوة القادمة مع رفع الفيديو)
  const handleAddLessonPlaceholder = () => {
    alert('هذه الخطوة القادمة يا كابتن! هنا سنقوم ببرمجة واجهة رفع الفيديو المباشر إلى Bunny.net.');
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a88f]"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl font-sans" dir="rtl">
      
      {/* الترويسة */}
      <header className="max-w-5xl mx-auto mb-10 border-b border-slate-800 pb-6">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00a88f] transition-colors mb-4 text-sm font-bold">
          <ArrowRight size={16} /> العودة للوحة التحكم
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">{course?.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              إدارة المنهج، الفصول، ورفع الفيديوهات
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition flex items-center gap-2 border border-slate-700">
              <Settings size={16} /> إعدادات الكورس
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-[#00a88f] hover:bg-[#008f7a] text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-[#00a88f]/20">
              <CheckCircle2 size={16} /> نشر الكورس
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* بناء المنهج (Curriculum Builder) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <BookOpen className="text-[#00a88f]" /> محتوى المنهج
            </h2>

            {/* قائمة الفصول والدروس */}
            <div className="space-y-4 mb-8">
              {modules.map((module) => (
                <div key={module.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  
                  {/* رأس الفصل */}
                  <div className="bg-slate-800/50 p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-slate-600 cursor-move" size={18} />
                      <h3 className="font-bold text-white text-sm">الفصل: {module.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-red-400 transition"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {/* الدروس داخل الفصل */}
                  <div className="p-4 space-y-2">
                    {module.lessons?.map((lesson: any) => (
                      <div key={lesson.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between hover:border-slate-700 transition">
                        <div className="flex items-center gap-3">
                          <PlayCircle size={16} className={lesson.video_url ? "text-[#00a88f]" : "text-amber-500"} />
                          <span className="text-sm font-medium text-slate-300">{lesson.title}</span>
                        </div>
                      </div>
                    ))}

                    {/* زر إضافة درس جديد */}
                    <button 
                      onClick={handleAddLessonPlaceholder}
                      className="w-full mt-2 border border-dashed border-slate-700 hover:border-[#00a88f] hover:bg-[#00a88f]/5 text-slate-400 hover:text-[#00a88f] p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all"
                    >
                      <Plus size={16} /> إضافة درس (فيديو) جديد
                    </button>
                  </div>
                </div>
              ))}

              {modules.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                  <p>لم تقم بإضافة أي فصول بعد.</p>
                </div>
              )}
            </div>

            {/* نموذج إضافة فصل جديد */}
            <form onSubmit={handleAddModule} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-400 mb-2">عنوان الفصل الجديد</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="مثال: مقدمة في لغة بايثون"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:border-[#00a88f] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingModule || !newModuleTitle.trim()}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                >
                  إضافة الفصل
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* الشريط الجانبي (حالة الكورس) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">حالة الكورس</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">حالة النشر</span>
                <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-bold text-xs">مسودة</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">السعر</span>
                <span className="text-emerald-400 font-bold">${course?.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">إجمالي الدروس</span>
                <span className="text-white font-bold">
                  {modules.reduce((total, mod) => total + (mod.lessons?.length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}