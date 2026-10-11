'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowRight, PlayCircle, Bot, Send, Loader2, Menu, X, Shield, Sparkles } from 'lucide-react';

export default function LearningRoom({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [aiSettings, setAiSettings] = useState<any>(null);
  
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
    const fetchCourseData = async () => {
      const resolvedParams = await params;
      
      // 1. Fetch Course
      const { data: courseData } = await supabase.from('courses').select('*').eq('slug', resolvedParams.slug).single();
      if (courseData) setCourse(courseData);

      // 2. Fetch AI Settings
      if (courseData) {
        const { data: aiData } = await supabase.from('course_ai_settings').select('*').eq('course_id', courseData.id).maybeSingle();
        setAiSettings(aiData);
      }

      // 3. Fetch Curriculum
      if (courseData) {
        const { data: modulesData } = await supabase.from('modules').select(`*, lessons (*)`).eq('course_id', courseData.id).order('order_index', { ascending: true });
        
        if (modulesData && modulesData.length > 0) {
          const sortedModules = modulesData.map(mod => ({
            ...mod,
            lessons: mod.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
          }));
          setModules(sortedModules);
          // Set first lesson as active by default
          if (sortedModules[0].lessons.length > 0) {
            setActiveLesson(sortedModules[0].lessons[0]);
          }
        }
      }
    };
    fetchCourseData();
  }, [params, supabase]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        setMessages(prev => [...prev, { sender: 'ai', text: 'عذراً، حدث خطأ في الاتصال بالمعلم الذكي. يرجى المحاولة لاحقاً.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'عذراً، تأكد من اتصالك بالإنترنت.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (!course) return <div className="min-h-screen bg-[#08090a] flex justify-center items-center"><Loader2 className="animate-spin text-[#0c8c5e] w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col font-sans overflow-hidden" dir="rtl">
      
      {/* Top Navbar */}
      <header className="h-16 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold bg-[#222] px-3 py-1.5 rounded-md">
            <ArrowRight size={16} /> العودة
          </Link>
          <div className="w-px h-6 bg-[#333]"></div>
          <h1 className="font-bold text-sm md:text-base text-white truncate max-w-xs md:max-w-md">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-2 text-[#0c8c5e] text-xs font-bold bg-[#0c8c5e]/10 px-3 py-1.5 rounded-full border border-[#0c8c5e]/20">
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
          <div className="p-4 space-y-4">
            {modules.map((module: any, idx: number) => (
              <div key={module.id} className="mb-4">
                <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الفصل {idx + 1}: {module.title}</h3>
                <div className="space-y-1">
                  {module.lessons?.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      onClick={() => { setActiveLesson(lesson); setIsSidebarOpen(false); }}
                      className={`w-full text-right p-3 rounded-lg flex items-start gap-3 transition-colors ${activeLesson?.id === lesson.id ? 'bg-[#0c8c5e]/10 border border-[#0c8c5e]/30' : 'hover:bg-[#222222] border border-transparent'}`}
                    >
                      <PlayCircle size={18} className={`shrink-0 mt-0.5 ${activeLesson?.id === lesson.id ? 'text-[#0c8c5e]' : 'text-gray-500'}`} />
                      <div>
                        <div className={`text-sm font-bold ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-300'}`}>{lesson.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Shield size={10} /> فيديو محمي</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Video Player */}
        <div className="flex-1 flex flex-col bg-black relative">
          {activeLesson ? (
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Bunny.net Secure Player Iframe */}
              {/* ملاحظة: سنستخدم رابط Bunny الافتراضي هنا. قم بتحديث الـ Library ID لاحقاً في Vercel */}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0c8c5e] to-[#085b3d] flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1">المعلم الذكي <Sparkles size={12} className="text-amber-400" /></h3>
              <p className="text-xs text-[#0c8c5e]">متصل وجاهز للمساعدة</p>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm font-bold">أهلاً بك في الدرس!</p>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">هل لديك أي سؤال حول ما يشرحه المحاضر الآن؟ اسألني وسأشرح لك بناءً على منهج الكورس.</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed font-medium ${
                  msg.sender === 'user' 
                  ? 'bg-white text-black rounded-tl-none' 
                  : 'bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[#333] px-4 py-3 rounded-xl rounded-tr-none flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                placeholder="اسأل المعلم الذكي عن الدرس..."
                className="w-full bg-[#222222] border border-[#333] text-white text-sm font-medium rounded-xl py-3 pr-4 pl-12 focus:outline-none focus:border-[#0c8c5e] transition-colors"
                disabled={isAiTyping}
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || isAiTyping}
                className="absolute left-2 bg-[#0c8c5e] text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#0a754f] transition-colors disabled:opacity-50"
              >
                <Send size={14} className="mr-0.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}