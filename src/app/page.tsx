'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, ShoppingCart, Globe, Sparkles, Star, Users, 
  CheckCircle2, ArrowRight, PlayCircle, ShieldCheck, 
  BrainCircuit, Award, Building2, Zap, BookOpen, 
  ChevronDown, Layers, HelpCircle, ArrowUpRight, Check, UserPlus, LogIn, LogOut, LayoutDashboard
} from 'lucide-react';

export default function GlobalPlatformHome() {
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    // مراقبة أي تغيير في حالة الجلسة (تسجيل دخول أو خروج في تبويب آخر)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // دالة تسجيل الخروج الآمنة
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl selection:bg-[#00a88f] selection:text-white">
      
      {/* 1. Global Announcement Header Bar */}
      <div className="bg-gradient-to-r from-[#391e75] via-[#2d175e] to-[#00a88f] text-white py-2 px-4 text-center text-xs md:text-sm font-semibold flex items-center justify-center gap-3 border-b border-white/10 shadow-md">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">جديد</span>
        <span className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-amber-300 animate-pulse" />
          أطلقنا خطط اشتراكات قطاع الأعمال (B2B) والمعلم الذكي المدعوم بـ Gemini 3.6
        </span>
        <Link href="#pricing" className="underline hover:text-amber-200 transition-colors mr-2">استكشف الخطط ←</Link>
      </div>

      {/* 2. Mega Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 bg-gradient-to-tr from-[#391e75] to-[#00a88f] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#00a88f]/20 border border-white/10">
                M
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white block leading-none">منصة مسار العالمية</span>
                <span className="text-[10px] text-[#00a88f] font-bold tracking-widest uppercase">Enterprise EdTech SaaS</span>
              </div>
            </Link>

            {/* Categories Dropdown */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-800 transition-all">
              <Layers size={16} className="text-[#00a88f]" />
              <span>الأقسام التعليمية</span>
              <ChevronDown size={14} />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="ابحث عن كورس، مهارة، أو تخصص (مثال: الذكاء الاصطناعي)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-full py-2.5 pr-11 pl-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00a88f] transition-all shadow-inner"
              />
              <Search size={18} className="absolute right-4 top-3 text-slate-500" />
            </div>

            {/* Right Actions & Auth Links (DYNAMIC) */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="#b2b" className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#00a88f] transition-colors">
                <Building2 size={16} className="text-[#00a88f]" />
                <span>مسار للشركات</span>
              </Link>

              <div className="h-6 w-[1px] bg-slate-800 hidden lg:block"></div>

              <button className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl relative transition-all">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-[#00a88f] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
              </button>

              {user ? (
                /* أزرار المستخدم المسجل */
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSignOut}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border border-red-500/20"
                  >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">خروج</span>
                  </button>
                  <Link 
                    href="/dashboard" 
                    className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#00a88f]/20 flex items-center gap-1.5"
                  >
                    <LayoutDashboard size={15} />
                    <span>لوحة التحكم</span>
                  </Link>
                </div>
              ) : (
                /* أزرار الزائر */
                <div className="flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5"
                  >
                    <LogIn size={15} className="text-purple-400" />
                    <span className="hidden sm:inline">دخول</span>
                  </Link>
                  <Link 
                    href="/login" 
                    className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#00a88f]/20 flex items-center gap-1.5"
                  >
                    <UserPlus size={15} />
                    <span>حساب جديد</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 text-right">
              <div className="inline-flex items-center gap-2 bg-[#391e75]/40 border border-purple-500/30 text-[#00a88f] font-bold px-4 py-2 rounded-full text-xs mb-6 shadow-xl">
                <Sparkles size={16} />
                <span>الجيل الجديد من منصات التعليم الرقمي المباشر والاشتراكات</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                ابنِ مهارات المستقبل مع <br />
                <span className="bg-gradient-to-l from-[#00a88f] to-purple-400 bg-clip-text text-transparent">
                  منظومة التعليم والذكاء الاصطناعي
                </span>
              </h1>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                احصل على وصول فردي للكورسات، أو اشترك في الباقة السنوية الشاملة، أو زوّد مؤسستك ببيئة تدريبية متكاملة لفرق العمل مع معلم ذكي مرافق لكل درس وشهادات معتمدة مشفرة.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-[#00a88f]/25 flex items-center gap-3 hover:-translate-y-0.5"
                  >
                    <LayoutDashboard size={20} />
                    <span>متابعة التعلم في لوحة التحكم</span>
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-[#00a88f]/25 flex items-center gap-3 hover:-translate-y-0.5"
                    >
                      <UserPlus size={20} />
                      <span>أنشئ حسابك وابدأ الآن</span>
                    </Link>
                    <Link 
                      href="/login" 
                      className="bg-[#391e75] border border-purple-500/30 hover:bg-[#2d175e] text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2"
                    >
                      <LogIn size={20} className="text-[#00a88f]" />
                      <span>دخول المنصة</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6">
                <div>
                  <span className="block font-black text-2xl text-white">100%</span>
                  <span className="text-xs text-slate-500">حماية الفيديوهات</span>
                </div>
                <div>
                  <span className="block font-black text-2xl text-[#00a88f]">5 مصادر</span>
                  <span className="text-xs text-slate-500">لتحقيق الدخل</span>
                </div>
                <div>
                  <span className="block font-black text-2xl text-purple-400">Gemini 3.6</span>
                  <span className="text-xs text-slate-500">معلم ذكي متفاعل</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#00a88f] to-teal-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg">
                  LIVE INTERACTIVE SYSTEM
                </div>

                <Link href="/learn/demo" className="block aspect-video bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <PlayCircle size={64} className="text-[#00a88f] group-hover:scale-110 transition-transform z-10" />
                  <span className="absolute bottom-4 right-4 text-xs font-bold text-white bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                    دبلوم الذكاء الاصطناعي (ديمو مباشر)
                  </span>
                </Link>

                <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00a88f] mb-2">
                    <BrainCircuit size={16} /> المعلم الذكي (مسار AI)
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    "أنا متصل بسياق الفيديو، اسألني في أي وقت أثناء مشاهدة المنهج وسأقوم بالشرح والتحليل فورياً!"
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* الأقسام السفلية */}
      <section className="py-10 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-6">تثق بنا المدارس والشركات</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="font-black text-xl text-slate-400">Vodafone</span>
            <span className="font-black text-xl text-slate-400">MASAR Center</span>
            <span className="font-black text-xl text-slate-400">EduAcademy</span>
          </div>
        </div>
      </section>

    </div>
  );
}