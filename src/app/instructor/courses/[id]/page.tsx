'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, Video, Plus, GripVertical, Settings, 
  BookOpen, Trash2, CheckCircle2, PlayCircle, X, UploadCloud, Loader2
} from 'lucide-react';

export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);

  // حالات نافذة رفع الفيديو
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCourseData = async () => {
      const resolvedParams = await params;
      const courseId = resolvedParams.id;

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      if (courseData) setCourse(courseData);

      const { data: modulesData } = await supabase
        .from('modules')
        .select(`*, lessons (*)`)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesData) {
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

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);

    const { data, error } = await supabase
      .from('modules')
      .insert([{ course_id: course.id, title: newModuleTitle, order_index: modules.length }])
      .select().single();

    if (data) {
      setModules([...modules, { ...data, lessons: [] }]);
      setNewModuleTitle('');
    }
    setIsAddingModule(false);
  };

  const openLessonModal = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setLessonTitle('');
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // ==========================================
  // عملية الرفع الحقيقية المباشرة لـ Bunny.net
  // ==========================================
  const handleUploadLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !selectedFile || !activeModuleId) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(1); // إظهار شريط التقدم

    try {
      // 1. إخبار سيرفرنا بإنشاء مساحة للفيديو في Bunny.net
      const createRes = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: lessonTitle })
      });
      
      const resData = await createRes.json();
      if (!createRes.ok) throw new Error(resData.error || 'فشل تهيئة الفيديو');

      const { videoId, libraryId, uploadKey } = resData;

      // 2. رفع الملف مباشرة من متصفح المستخدم إلى Bunny.net
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          // 3. الرفع نجح! نقوم بحفظ الـ videoId في قاعدة بيانات Supabase
          const currentModule = modules.find(m => m.id === activeModuleId);
          const newOrder = currentModule?.lessons?.length || 0;

          const { data: newLesson, error } = await supabase
            .from('lessons')
            .insert([{ 
              module_id: activeModuleId, 
              title: lessonTitle, 
              order_index: newOrder,
              video_url: videoId, // هذا الرقم هو الأهم!
              is_free_preview: false
            }])
            .select().single();

          if (error) throw error;

          // تحديث الواجهة فوراً
          setModules(modules.map(mod => {
            if (mod.id === activeModuleId) {
              return { ...mod, lessons: [...mod.lessons, newLesson] };
            }
            return mod;
          }));

          setIsUploading(false);
          setIsModalOpen(false);
        } else {
          throw new Error('فشل الرفع لـ Bunny.net');
        }
      };

      xhr.onerror = () => {
        setUploadError('حدث خطأ في الاتصال أثناء الرفع.');
        setIsUploading(false);
      };

      // تنفيذ طلب الرفع المباشر
      xhr.open('PUT', `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`);
      xhr.setRequestHeader('AccessKey', uploadKey);
      xhr.send(selectedFile);

    } catch (err: any) {
      setUploadError(err.message);
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-[#00a88f] w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl font-sans relative" dir="rtl">
      
      <header className="max-w-5xl mx-auto mb-10 border-b border-slate-800 pb-6">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00a88f] transition-colors mb-4 text-sm font-bold">
          <ArrowRight size={16} /> العودة للوحة التحكم
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">{course?.title}</h1>
            <p className="text-slate-400 text-sm mt-1">إدارة المنهج ورفع الفيديوهات المشفرة (Bunny.net DRM)</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-[#00a88f] hover:bg-[#008f7a] text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-[#00a88f]/20">
              <CheckCircle2 size={16} /> حفظ التغييرات ونشر
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <BookOpen className="text-[#00a88f]" /> محتوى الكورس
            </h2>

            <div className="space-y-4 mb-8">
              {modules.map((module) => (
                <div key={module.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-800/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-slate-600 cursor-move" size={18} />
                      <h3 className="font-bold text-white text-sm">الفصل: {module.title}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {module.lessons?.map((lesson: any) => (
                      <div key={lesson.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <PlayCircle size={16} className="text-[#00a88f]" />
                          <span className="text-sm font-medium text-slate-300">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">تم الرفع لـ Bunny ✓</span>
                      </div>
                    ))}

                    <button 
                      onClick={() => openLessonModal(module.id)}
                      className="w-full mt-2 border border-dashed border-slate-700 hover:border-[#00a88f] hover:bg-[#00a88f]/5 text-slate-400 hover:text-[#00a88f] p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all"
                    >
                      <Plus size={16} /> إضافة فيديو جديد
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddModule} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-400 mb-2">عنوان الفصل الجديد</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="مثال: مقدمة في لغة بايثون"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:border-[#00a88f] outline-none"
                />
                <button type="submit" disabled={isAddingModule || !newModuleTitle.trim()} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">تفاصيل المنهج</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400">إجمالي الفصول</span>
                <span className="text-white font-bold">{modules.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">إجمالي الدروس</span>
                <span className="text-[#00a88f] font-bold">
                  {modules.reduce((total, mod) => total + (mod.lessons?.length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="text-[#00a88f]" size={20} /> رفع درس لـ Bunny.net
              </h3>
              <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadLesson} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">عنوان الدرس</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-[#00a88f] outline-none text-sm"
                    placeholder="مثال: الدرس الأول - تثبيت البرامج"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">ملف الفيديو</label>
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${selectedFile ? 'border-[#00a88f] bg-[#00a88f]/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <UploadCloud className={`w-8 h-8 mb-2 ${selectedFile ? 'text-[#00a88f]' : 'text-slate-400'}`} />
                      <p className="text-sm text-slate-300 font-bold truncate w-full">
                        {selectedFile ? selectedFile.name : 'اضغط لاختيار فيديو من جهازك'}
                      </p>
                      {!selectedFile && <p className="text-xs text-slate-500 mt-1">يتم التشفير والرفع الآمن مباشرة لـ Bunny Stream</p>}
                    </div>
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={isUploading} required />
                  </label>
                </div>

                {uploadError && (
                   <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl font-bold">
                     {uploadError}
                   </div>
                )}

                {isUploading && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs font-bold text-[#00a88f]">
                      <span>جاري الرفع الحقيقي... الرجاء عدم إغلاق النافذة</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#00a88f] to-teal-400 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="submit"
                  disabled={isUploading || !lessonTitle || !selectedFile}
                  className="flex-1 bg-[#00a88f] hover:bg-[#008f7a] text-white py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الرفع...</> : 'بدء الرفع الآمن'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}