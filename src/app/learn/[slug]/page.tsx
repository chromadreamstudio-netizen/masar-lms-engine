'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, PlayCircle, Bot, Send, Loader2, Menu, X, Shield, Sparkles } from 'lucide-react';

export default function LearningRoom({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [aiSettings, setAiSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Chat States
  const [messages, setMessages] = useState<{sender: 'user'|'ai', text: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchLearningData = async () => {
      const resolvedParams = await params;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. جلب الكورس
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();
        
      if (!courseData) {
        router.push('/dashboard');
        return;
      }
      setCourse(courseData);

      // 2. التحقق من اشتراك الطالب
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseData.id)
        .maybeSingle();

      if (!enrollment && !courseData.is_published) {
        // إذا لم يكن مشتركاً والكورس غير منشور، أعده للوحة التحكم
         router.push('/dashboard');
         return;
      }

      // 3. جلب إعدادات الذكاء الاصطناعي
      const { data: aiData } = await supabase
        .from('course_ai_settings')
        .select('*')
        .eq('course_id', courseData.id)
        .maybeSingle();
      setAiSettings(aiData);

      // 4. جلب المنهج
      const { data: modulesData } = await supabase
        .from('modules')
        .select(`*, lessons (*)`)
        .eq('course_id', courseData.id)
        .order('order_index', { ascending: true });
        
      if (modulesData && modulesData.length > 0) {
        const sortedModules = modulesData.map(mod => ({
          ...mod,
          lessons: mod.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
        }));
        setModules(sortedModules);
        
        // تحديد أول درس كدرس افتراضي
        if (sortedModules[0].lessons.length > 0) {
          setActiveLesson(sortedModules[0].lessons[0]);
        }
      }
      setIsLoading(false);
    };

    fetchLearningData();
  }, [params, router, supabase]);

  // التمرير التلقائي لمربع الدردشة
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          systemInstruction: aiSettings?.base_prompt || '',
          knowledge: aiSettings?.knowledge_text || ''
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'تأكد من اتصالك بالإنترنت.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-ink flex justify-center items-center"><Loader2 className="animate-spin text-mint w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col font-sans overflow-hidden" dir="rtl">
      
      {/* Top Navbar */}
      <header className="h-16 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold bg-[#222222] px-4 py-2 rounded-lg">
            <ArrowRight size={16} /> العودة
          </Link>
          <div className="w-px h-6 bg-[#333333]"></div>
          <h1 className="font-bold text-sm md:text-base text-white truncate max-w-xs md:max-w-md">{course?.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-2 text-mint text-xs font-bold bg-mint/10 px-3 py-1.5 rounded-full border border-mint/20">
            <Shield size={14} /> حماية DRM نشطة
          </span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white p-2">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Sidebar: Curriculum (Collapsible on Mobile) */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 bg-[#111111] border-l border-[#222222] overflow-y-auto shrink-0 z-10 absolute md:relative h-full transition-all`}>
          <div className="p-5 border-b border-[#222222] sticky top-0 bg-[#111111] z-10">
            <h2 className="font-bold text-white text-base">محتوى الكورس</h2>
          </div>
          <div className="p-4 space-y-6">
            {modules.map((module: any, idx: number) => (
              <div key={module.id}>
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">الفصل {idx + 1}: {module.title}</h3>
                <div className="space-y-2">
                  {module.lessons?.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      onClick={() => { setActiveLesson(lesson); setIsSidebarOpen(false); }}
                      className={`w-full text-right p-3 rounded-xl flex items-start gap-3 transition-colors ${activeLesson?.id === lesson.id ? 'bg-mint/10 border border-mint/30' : 'hover:bg-[#222222] border border-transparent'}`}
                    >
                      <PlayCircle size={18} className={`shrink-0 mt-0.5 ${activeLesson?.id === lesson.id ? 'text-mint' : 'text-gray-500'}`} />
                      <div>
                        <div className={`text-sm font-bold ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-300'}`}>{lesson.title}</div>
                        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 font-medium"><Shield size={12} /> محمي بـ DRM</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Video Player */}
        <div className="flex-1 flex flex-col bg-[#000000] relative">
          {activeLesson ? (
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Bunny.net Secure Player */}
              <iframe 
                src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '12345'}/${activeLesson.video_url}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                loading="lazy"
                style={{ border: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen={true}
              ></iframe>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
              <PlayCircle size={48} className="mb-4 opacity-50" />
              <p className="font-bold">اختر درساً من القائمة لتبدأ</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Gemini AI Chat */}
        <div className="w-full md:w-96 bg-[#111111] border-r border-[#222222] flex flex-col shrink-0 h-[50vh] md:h-auto">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#222222] bg-[#111111] flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-mint to-[#085b3d] flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1">المعلم الذكي <Sparkles size={12} className="text-amber-400" /></h3>
              <p className="text-xs text-mint font-medium">متصل وجاهز للمساعدة</p>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333]">
                  <Sparkles size={24} className="text-mint" />
                </div>
                <p className="text-white text-base font-bold mb-2">أهلاً بك في الدرس!</p>
                <p className="text-gray-500 text-sm font-medium leading-relaxed px-4">هل لديك أي سؤال حول الشرح؟ اسألني وسأساعدك بناءً على منهج هذا الكورس.</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed font-bold ${
                  msg.sender === 'user' 
                  ? 'bg-mint text-white rounded-tl-sm shadow-md' 
                  : 'bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-tr-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[#333] px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-mint rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-mint rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-mint rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-[#111111] border-t border-[#222222] shrink-0">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اسأل المعلم الذكي..."
                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm font-bold rounded-xl py-3.5 pr-4 pl-12 focus:outline-none focus:border-mint transition-colors"
                disabled={isAiTyping}
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || isAiTyping}
                className="absolute left-2 bg-mint text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#0a754f] transition-colors disabled:opacity-50"
              >
                <Send size={16} className="mr-0.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}