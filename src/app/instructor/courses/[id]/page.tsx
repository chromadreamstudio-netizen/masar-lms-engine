'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, Video, Plus, GripVertical, 
  BookOpen, Trash2, PlayCircle, X, UploadCloud, Loader2,
  Bot, Sparkles, FileText, Globe, ShieldOff, AlertCircle
} from 'lucide-react';

export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'curriculum' | 'ai_tutor'>('curriculum');

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiKnowledge, setAiKnowledge] = useState('');
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [isAiDirty, setIsAiDirty] = useState(false); // ثغرة 2: مؤشر التعديل غير المحفوظ
  const [isPublishing, setIsPublishing] = useState(false);

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

      const { data: aiData } = await supabase.from('course_ai_settings').select('*').eq('course_id', courseId).maybeSingle(); 
      if (aiData) {
        setAiPrompt(aiData.base_prompt || '');
        setAiKnowledge(aiData.knowledge_text || '');
      }

      const { data: modulesData } = await supabase.from('modules').select(`*, lessons (*)`).eq('course_id', courseId).order('order_index', { ascending: true });
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

  // دالة حفظ الذكاء الاصطناعي
  const handleSaveAiSettings = async () => {
    setIsSavingAi(true);
    await supabase.from('course_ai_settings').upsert({
      course_id: course.id,
      base_prompt: aiPrompt,
      knowledge_text: aiKnowledge
    }, { onConflict: 'course_id' });
    
    setIsSavingAi(false);
    setIsAiDirty(false); // إعادة تعيين المؤشر بعد الحفظ
  };

  // ثغرة 1: دالة نشر / إلغاء نشر الكورس
  const handleTogglePublish = async () => {
    if (!course.is_published && modules.length === 0) {
      alert('يجب إضافة فصل واحد على الأقل قبل النشر.');
      return;
    }
    setIsPublishing(true);
    const newPublishState = !course.is_published;
    await supabase.from('courses').update({ is_published: newPublishState }).eq('id', course.id);
    setCourse({ ...course, is_published: newPublishState });
    setIsPublishing(false);
  };

  // ثغرة 1: دوال الحذف الآمن (حذف الفصول والدروس)
  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفصل بجميع دروسه؟ لا يمكن التراجع عن هذا الإجراء.')) {
      await supabase.from('modules').delete().eq('id', moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    if (confirm('هل تريد حذف هذا الدرس بشكل نهائي؟')) {
      await supabase.from('lessons').delete().eq('id', lessonId);
      setModules(modules.map(mod => 
        mod.id === moduleId ? { ...mod, lessons: mod.lessons.filter((l:any) => l.id !== lessonId) } : mod
      ));
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);
    const { data } = await supabase.from('modules').insert([{ course_id: course.id, title: newModuleTitle, order_index: modules.length }]).select().single();
    if (data) { setModules([...modules, { ...data, lessons: [] }]); setNewModuleTitle(''); }
    setIsAddingModule(false);
  };

  const openLessonModal = (moduleId: string) => {
    setActiveModuleId(moduleId); setLessonTitle(''); setSelectedFile(null); setUploadProgress(0); setIsModalOpen(true);
  };

  // ثغرة 3: منع الرفع المزدوج وتأمين العملية
  const handleUploadLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || !lessonTitle || !selectedFile || !activeModuleId) return; // حماية صريحة
    setIsUploading(true); setUploadProgress(1);

    try {
      const createRes = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: lessonTitle })
      });
      const resData = await createRes.json();
      if (!createRes.ok) throw new Error(resData.error);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { 
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100)); 
      };
      
      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const currentModule = modules.find(m => m.id === activeModuleId);
          const { data: newLesson } = await supabase.from('lessons').insert([{ 
            module_id: activeModuleId, 
            title: lessonTitle, 
            order_index: currentModule?.lessons?.length || 0,
            video_url: resData.videoId, 
            is_free_preview: false
          }]).select().single();

          if (newLesson) {
            setModules(modules.map(mod => mod.id === activeModuleId ? { ...mod, lessons: [...mod.lessons, newLesson] } : mod));
          }
          setIsUploading(false); setIsModalOpen(false);
        } else {
          setIsUploading(false); alert('فشل الرفع للشبكة الآمنة.');
        }
      };

      xhr.onerror = () => { setIsUploading(false); alert('حدث خطأ في الشبكة.'); };
      xhr.open('PUT', `https://video.bunnycdn.com/library/${resData.libraryId}/videos/${resData.videoId}`);
      xhr.setRequestHeader('AccessKey', resData.uploadKey);
      xhr.send(selectedFile);
    } catch (err: any) { 
      setIsUploading(false); alert('فشل التهيئة: ' + err.message); 
    }
  };

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-mint w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 md:p-10 dir-rtl font-sans" dir="rtl">
      
      <header className="max-w-6xl mx-auto mb-8 border-b border-gray-200 pb-6">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-gray-500 hover:text-mint font-bold mb-4 text-sm transition-colors">
          <ArrowRight size={16} /> العودة للوحة التحكم
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-ink">{course?.title}</h1>
              {course?.is_published ? (
                <span className="bg-mint/10 text-mint px-3 py-1 rounded-full text-xs font-bold border border-mint/20">منشور Live</span>
              ) : (
                <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">مسودة</span>
              )}
            </div>
          </div>
          
          {/* تم إضافة زر إلغاء النشر لمرونة الإدارة */}
          <div className="flex gap-3">
            <button 
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50 ${course?.is_published ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-ink text-white hover:bg-gray-800'}`}
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : (course?.is_published ? <ShieldOff size={16} /> : <Globe size={16} />)} 
              {course?.is_published ? 'إيقاف النشر (Unpublish)' : 'نشر الكورس'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto mb-6 flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('curriculum')} className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'curriculum' ? 'border-mint text-mint' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><BookOpen size={18} /> المنهج والفيديوهات</button>
        <button onClick={() => setActiveTab('ai_tutor')} className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'ai_tutor' ? 'border-mint text-mint' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Bot size={18} /> تدريب المعلم الذكي <Sparkles size={14} className="text-amber-500" /></button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          {activeTab === 'curriculum' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="space-y-4 mb-8">
                {modules.map((module) => (
                  <div key={module.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group/module">
                    <div className="bg-gray-100/50 p-4 flex items-center justify-between border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <GripVertical className="text-gray-400 cursor-move" size={18} />
                        <h3 className="font-bold text-ink text-sm">الفصل: {module.title}</h3>
                      </div>
                      {/* زر حذف الفصل */}
                      <button onClick={() => handleDeleteModule(module.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover/module:opacity-100 transition-all p-1" title="حذف الفصل"><Trash2 size={16} /></button>
                    </div>
                    <div className="p-4 space-y-2">
                      {module.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between group shadow-sm">
                          <div className="flex items-center gap-3">
                            <PlayCircle size={16} className="text-mint" />
                            <span className="text-sm font-bold text-gray-700">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-mint bg-mint/10 px-2 py-1 rounded">فيديو محمي ✓</span>
                            {/* زر حذف الدرس */}
                            <button onClick={() => handleDeleteLesson(lesson.id, module.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="حذف الدرس"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => openLessonModal(module.id)} className="w-full mt-2 border-2 border-dashed border-gray-200 hover:border-mint hover:bg-mint/5 text-gray-500 hover:text-mint p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all">
                        <Plus size={16} /> إضافة فيديو جديد
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddModule} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 mb-2">عنوان الفصل الجديد</label>
                <div className="flex gap-3">
                  <input type="text" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="مثال: مقدمة في لغة بايثون" className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-ink focus:border-mint outline-none shadow-sm" />
                  <button type="submit" disabled={isAddingModule || !newModuleTitle.trim()} className="bg-ink hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50">إضافة</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'ai_tutor' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">شخصية وتعليمات المعلم (System Prompt)</label>
                <textarea rows={4} value={aiPrompt} onChange={(e) => { setAiPrompt(e.target.value); setIsAiDirty(true); }} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-ink font-medium focus:ring-mint focus:border-mint outline-none text-sm resize-none shadow-inner" placeholder="مثال: أنت معلم ذكي متخصص في البرمجة..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2 flex items-center gap-2"><FileText size={16} className="text-gray-400" /> المادة العلمية ومحتوى الكورس (Knowledge Base)</label>
                <textarea rows={10} value={aiKnowledge} onChange={(e) => { setAiKnowledge(e.target.value); setIsAiDirty(true); }} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-ink font-medium focus:ring-mint focus:border-mint outline-none text-sm resize-none shadow-inner" placeholder="انسخ هنا ملخص الدروس..." />
              </div>
              
              {/* رسالة التنبيه بوجود تعديلات غير محفوظة */}
              {isAiDirty && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs font-bold border border-amber-200">
                  <AlertCircle size={16} /> توجد تعديلات غير محفوظة، تذكر الضغط على حفظ!
                </div>
              )}

              <button onClick={handleSaveAiSettings} disabled={isSavingAi || !isAiDirty} className="w-full bg-mint hover:bg-[#0a754f] text-white py-3 rounded-xl font-bold transition shadow-sm disabled:opacity-50 flex justify-center items-center gap-2">
                {isSavingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ تدريب المعلم الآلي'}
              </button>
            </div>
          )}
        </div>

        {/* ملخص الكورس الجانبي (بدون تغيير) */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-ink mb-6">ملخص الكورس</h3>
            <div className="space-y-4 text-sm font-bold">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">إجمالي الفصول</span><span className="text-ink">{modules.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">إجمالي الدروس</span><span className="text-mint bg-mint/10 px-2 py-0.5 rounded">{modules.reduce((t, m) => t + (m.lessons?.length || 0), 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500">الذكاء الاصطناعي</span><span className="text-amber-500 flex items-center gap-1"><Sparkles size={14}/> مُفعل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة رفع الفيديو */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2"><Video className="text-mint" size={20} /> الرفع الآمن للدرس</h3>
              <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleUploadLesson} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الدرس</label>
                  <input type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-ink font-bold focus:border-mint outline-none text-sm shadow-inner" disabled={isUploading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ملف الفيديو</label>
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${selectedFile ? 'border-mint bg-mint/5' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <UploadCloud className={`w-8 h-8 mb-2 ${selectedFile ? 'text-mint' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-600 font-bold truncate w-full">{selectedFile ? selectedFile.name : 'اضغط لاختيار فيديو'}</p>
                    </div>
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={isUploading} required />
                  </label>
                </div>
                {isUploading && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-