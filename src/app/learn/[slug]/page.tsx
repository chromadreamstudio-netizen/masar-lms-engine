'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PlayCircle, BrainCircuit, Send, ArrowRight, 
  Sparkles, Loader2, CheckCircle2, Lock, FileText 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function LearnCoursePage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'syllabus'>('ai');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'مرحباً بك في دبلوم الذكاء الاصطناعي! أنا المعلم الذكي لـ أكاديمية نماء، اسألني في أي وقت عن الشرح وسأقوم بإجابتك فوراً.'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    const newMessages = [...messages, userMsg];
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
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply
          }
        ]);
      } else {
        throw new Error(data.error || 'خطأ في الاستجابة');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'عذراً، تعذر الاتصال بالمعلم الذكي. يرجى التأكد من إضافة GOOGLE_API_KEY في ملف .env.local'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col dir-rtl">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="font-extrabold text-base md:text-lg text-white">دبلوم البرمجة بالذكاء الاصطناعي و Next.js</h1>
            <span className="text-xs text-[#00a88f] font-semibold">الدرس 3: ربط واجهات API وأتمتة النظم</span>
          </div>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Right Section: Video Player */}
        <div className="lg:col-span-8 p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="aspect-video bg-black rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center shadow-2xl group">
            <div className="text-center z-10">
              <PlayCircle size={72} className="text-[#00a88f] animate-pulse cursor-pointer mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs text-slate-300 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-700 inline-block shadow-lg">
                مشغّل الفيديو الذكي المحمي بنظام Bunny DRM
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-extrabold mb-2 text-white">عن هذا الدرس</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              تتعلم في هذه المحاضرة طريقة إعداد وتطوير واجهات API وربطها بنماذج الذكاء الاصطناعي لتوفير استجابة لحظية للطلاب.
            </p>
          </div>
        </div>

        {/* Left Section: AI Tutor Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-73px)]">
          
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-1">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'ai' ? 'bg-[#00a88f] text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit size={16} />
              <span>المعلم الذكي (Gemini)</span>
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'syllabus' ? 'bg-[#00a88f] text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText size={16} />
              <span>محتوى الكورس</span>
            </button>
          </div>

          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#391e75] text-white rounded-tr-none shadow-md'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {m.role === 'assistant' && (
                        <span className="flex items-center gap-1.5 text-[10px] text-[#00a88f] font-bold mb-1.5">
                          <Sparkles size={12} /> المعلم الذكي
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2 py-2">
                    <Loader2 size={14} className="animate-spin text-[#00a88f]" /> المعلم الذكي يفكر ويصيغ الإجابة...
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل المعلم الذكي عن الشرح..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00a88f] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#00a88f] hover:bg-[#008f7a] text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-xs font-bold text-[#00a88f] block mb-2">الوحدة 1: الأساسيات</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 p-2.5 bg-slate-900 rounded-lg">
                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> 1. مقدمة الكورس</span>
                    <span className="text-[10px] text-slate-500">10 د</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white p-2.5 bg-[#391e75]/40 border border-[#00a88f]/40 rounded-lg font-bold">
                    <span className="flex items-center gap-2"><PlayCircle size={14} className="text-[#00a88f]" /> 2. ربط API الذكاء الاصطناعي</span>
                    <span className="text-[10px] text-[#00a88f]">يعرض الآن</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 p-2.5 bg-slate-950/50 rounded-lg">
                    <span className="flex items-center gap-2"><Lock size={14} /> 3. بناء لوحة التحكم السحابية</span>
                    <span className="text-[10px]">25 د</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}