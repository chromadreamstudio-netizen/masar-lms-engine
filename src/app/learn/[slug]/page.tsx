'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, PlayCircle, Bot, Send, Loader2, Sparkles } from 'lucide-react';

export default function LearningRoom({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [aiSettings, setAiSettings] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  
  const [messages, setMessages] = useState<{sender: 'user'|'ai', text: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
        router.push(`/login?redirect=/learn/${resolvedParams.slug}`);
        return;
      }

      const { data: courseData } = await supabase.from('courses').select('*').eq('slug', resolvedParams.slug).single();
      if (!courseData) {
        router.push('/dashboard');
        return;
      }
      setCourse(courseData);

      const checkEnrollment = async (retryCount = 0) => {
        // 👈 تم التصحيح هنا أيضاً: نبحث بـ user_id وليس student_id
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id) 
          .eq('course_id', courseData.id)
          .maybeSingle();

        if (enrollment) {
          setIsAuthorized(true);
          setIsVerifyingPayment(false);
          
          const { data: aiData } = await supabase.from('course_ai_settings').select('*').eq('course_id', courseData.id).maybeSingle();
          setAiSettings(aiData);

          const { data: modulesData } = await supabase.from('modules').select(`*, lessons (*)`).eq('course_id', courseData.id).order('order_index', { ascending: true });
            
          if (modulesData && modulesData.length > 0) {
            const sortedModules = modulesData.map(mod => ({
              ...mod,
              lessons: mod.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
            }));
            setModules(sortedModules);
            if (sortedModules[0].lessons.length > 0) setActiveLesson(sortedModules[0].lessons[0]);
          }
          setIsLoading(false);
        } else {
          if (retryCount < 5) {
            setIsVerifyingPayment(true);
            setTimeout(() => checkEnrollment(retryCount + 1), 2000);
          } else {
            setIsLoading(false);
            setIsVerifyingPayment(true);
          }
        }
      };

      checkEnrollment();
    };

    fetchLearningData();
  }, [params, router, supabase]);

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
        body: JSON.stringify({ message: userText, systemInstruction: aiSettings?.base_prompt || '', knowledge: aiSettings?.knowledge_text || '' })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'تأكد من اتصالك بالإنترنت.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (isLoading && !isVerifyingPayment) {
    return <div className="min-h-screen bg-[#08090a] flex justify-center items-center"><Loader2 className="animate-spin text-mint w-12 h-12" /></div>;
  }

  if (isVerifyingPayment && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#08090a] flex flex-col justify-center items-center text-white" dir="rtl">
        <Loader2 className="animate-spin text-mint w-16 h-16 mb-6" />
        <h2 className="text-2xl font-bold mb-2">جاري تأكيد عملية الدفع...</h2>
        <p className="text-gray-400 mb-8 max-w-md text-center">نحن نتحقق من استلام الدفعة من بوابة الدفع. عادة ما تستغرق هذه العملية ثواني معدودة.</p>
        <button onClick={() => window.location.reload()} className="bg-[#222] hover:bg-[#333] text-white px-6 py-3 rounded-lg font-bold transition-colors border border-[#444]">تحديث الصفحة الآن</button>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col font-sans overflow-hidden" dir="rtl">
      <header className="h-16 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${course?.slug}`} className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold bg-[#222222] px-4 py-2 rounded-lg">
            <ArrowRight size={16} /> العودة لصفحة الكورس
          </Link>
          <div className="w-px h-6 bg-[#333333]"></div>
          <h1 className="font-bold text-sm md:text-base text-white truncate max-w-xs md:max-w-md">{course?.title}</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
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
                      className={`w-full text-right p-3 rounded-xl flex items-start gap-3 transition-colors ${activeLesson?.id === lesson.id ? 'bg-mint/10 border border-mint/30 shadow-inner' : 'hover:bg-[#222222] border border-transparent'}`}
                    >
                      <PlayCircle size={18} className={`shrink-0 mt-0.5 ${activeLesson?.id === lesson.id ? 'text-mint' : 'text-gray-500'}`} />
                      <div><div className={`text-sm font-bold ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-300'}`}>{lesson.title}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#000000] relative">
          {activeLesson ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <iframe 
                src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '12345'}/${activeLesson.video_url}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                loading="lazy" style={{ border: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" allowFullScreen={true}>
              </iframe>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
              <PlayCircle size={48} className="mb-4 opacity-50" />
            </div>
          )}
        </div>

        <div className="w-full md:w-96 bg-[#111111] border-r border-[#222222] flex flex-col shrink-0 h-[50vh] md:h-auto">
          <div className="p-4 border-b border-[#222222] bg-[#111111] flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-mint to-[#085b3d] flex items-center justify-center shadow-lg"><Bot size={20} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1">المعلم الذكي <Sparkles size={12} className="text-amber-400" /></h3>
              <p className="text-xs text-mint font-medium">متصل ومستعد لمساعدتك</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333] shadow-inner"><Sparkles size={24} className="text-mint" /></div>
                <p className="text-white text-base font-bold mb-2">أهلاً بك في الدرس!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed font-bold ${msg.sender === 'user' ? 'bg-mint text-white rounded-tl-sm shadow-md' : 'bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-tr-sm shadow-inner'}`}>{msg.text}</div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[#333] px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-mint rounded-full animate-bounce"></div><div className="w-2 h-2 bg-mint rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 bg-mint rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-[#111111] border-t border-[#222222] shrink-0">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="اسأل المعلم الذكي عن الدرس..." className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm font-bold rounded-xl py-3.5 pr-4 pl-12 focus:outline-none focus:border-mint transition-colors shadow-inner" disabled={isAiTyping} />
              <button type="submit" disabled={!inputMessage.trim() || isAiTyping} className="absolute left-2 bg-mint text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#0a754f] transition-colors disabled:opacity-50"><Send size={16} className="mr-0.5" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}