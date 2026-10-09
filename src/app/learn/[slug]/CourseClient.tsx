'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, PlayCircle, CheckCircle2, BrainCircuit, 
  ListVideo, Send, Sparkles, Loader2 
} from 'lucide-react';

export default function CourseClient({ course, progressMap }: { course: any, progressMap: Record<string, any> }) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'ai'>('syllabus');
  
  // تحديد الدرس الأول كدرس نشط افتراضياً
  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';
  const [activeLessonId, setActiveLessonId] = useState<string>(firstLessonId);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `مرحباً بك في ${course.title}! أنا المعلم الذكي الخاص بك. اسألني أي سؤال حول الدرس الحالي وسأجيبك فوراً.`
    }
  ]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'حدث خطأ في الاتصال بالمعلم الذكي. تأكد من إعداد API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // النسخ الآمن للمصفوفات (لتجنب خطأ Hydration الذي يعطل الأزرار)
  const sortedModules = course.modules 
    ? [...course.modules].sort((a: any, b: any) => a.order_index - b.order_index) 
    : [];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden dir-rtl" dir="rtl">
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative scrollbar-hide">
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </Link>
            <h1 className="text-lg font-bold text-white truncate max-w-md">{course.title}</h1>
          </div>
          <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20">
            طالب نشط
          </span>
        </header>

        <div className="w-full bg-black aspect-video flex items-center justify-center border-b border-slate-800 relative group">
          <div className="text-center">
            <PlayCircle size={64} className="text-[#00a88f] mx-auto mb-4 group-hover:scale-110 transition-transform cursor-pointer" />
            <p className="text-slate-300 text-xs bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-700">منطقة العرض المحمية (Bunny DRM)</p>
          </div>
        </div>

        <div className="p-8 max-w-5xl">
          <h2 className="text-2xl font-black text-white mb-2">معلومات الدرس النشط</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            أنت الآن تشاهد الدرس ذو المعرف: {activeLessonId}
          </p>
        </div>
      </main>

      <aside className="w-80 lg:w-[400px] flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0 z-20">
        <div className="flex bg-slate-950 p-2 gap-2 border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'syllabus' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <ListVideo size={16} /> محتوى الكورس
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'ai' ? 'bg-[#00a88f] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <BrainCircuit size={16} className={activeTab === 'ai' ? 'text-white' : 'text-[#00a88f]'} /> المعلم الذكي
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {activeTab === 'syllabus' ? (
            <div className="p-4 space-y-6">
              {sortedModules.map((module: any) => (
                <div key={module.id}>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 px-2">{module.title}</h3>
                  <div className="space-y-2">
                    {module.lessons ? [...module.lessons].sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => {
                      const isCompleted = progressMap[lesson.id]?.is_completed;
                      const isActive = activeLessonId === lesson.id; 
                      
                      return (
                        <button 
                          key={lesson.id} 
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-right flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isCompleted ? <CheckCircle2 size={16} className="text-emerald-400" /> : <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-indigo-400' : 'border-slate-600'}`} />}
                          </div>
                          <p className={`text-sm font-medium ${isActive ? 'text-indigo-300' : 'text-slate-300'} line-clamp-2`}>{lesson.title}</p>
                        </button>
                      );
                    }) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between p-4 bg-slate-900/50">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-[#391e75] text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'}`}>
                      {m.role === 'assistant' && <span className="flex items-center gap-1.5 text-[10px] text-[#00a88f] font-bold mb-1.5"><Sparkles size={12} /> مسار AI</span>}
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#00a88f]" /> جاري التفكير...</div>}
              </div>
              
              <form onSubmit={handleChat} className="flex gap-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="اسأل المعلم الذكي..." 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00a88f]" 
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-[#00a88f] hover:bg-[#008f7a] text-white p-3 rounded-xl disabled:opacity-50 transition-colors">
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}