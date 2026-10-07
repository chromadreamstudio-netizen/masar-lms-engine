'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, ShoppingCart, Globe, Sparkles, Star, Users, 
  CheckCircle2, ArrowRight, PlayCircle, ShieldCheck, 
  BrainCircuit, Award, Building2, Zap, BookOpen, 
  ChevronDown, Layers, HelpCircle, ArrowUpRight, Check
} from 'lucide-react';

export default function GlobalPlatformHome() {
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [activeCategory, setActiveCategory] = useState('all');

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

      {/* 2. Udemy-Style Mega Navbar */}
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

            {/* Categories Dropdown Button */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-800 transition-all">
              <Layers size={16} className="text-[#00a88f]" />
              <span>الأقسام التعليمية</span>
              <ChevronDown size={14} />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="ابحث عن أي كورس، مهارة، أو شهادة معتمدة (مثل: الذكاء الاصطناعي، Python، التسويق)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-full py-2.5 pr-11 pl-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00a88f] transition-all shadow-inner"
              />
              <Search size={18} className="absolute right-4 top-3 text-slate-500" />
            </div>

            {/* Right Actions & Monetization Links */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="#b2b" className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#00a88f] transition-colors">
                <Building2 size={16} className="text-[#00a88f]" />
                <span>مسار للشركات (B2B)</span>
              </Link>

              <Link href="/teach" className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors">
                <span>درّس معنا</span>
              </Link>

              <div className="h-6 w-[1px] bg-slate-800 hidden lg:block"></div>

              {/* Cart Icon */}
              <button className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl relative transition-all">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-[#00a88f] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
              </button>

              <Link 
                href="/login" 
                className="bg-[#391e75] hover:bg-[#2d175e] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all border border-purple-500/30"
              >
                تسجيل الدخول
              </Link>

              <Link 
                href="/login" 
                className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-[#00a88f]/20 flex items-center gap-1.5"
              >
                <Zap size={15} />
                <span>تجربة المنصة حياً</span>
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* 3. Hero Section (Udemy + SaaS Hybrid) */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
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
                احصل على وصول فردي للكورسات، أو اشترك في الباقة السنوية الشاملة، أو زوّد مؤسستك ببيئة تدريبية متكاملة لفرق العمل مع معلم ذكي مرافق لكل درس شهادات معتمدة مشفرة.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link 
                  href="/login" 
                  className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-[#00a88f]/25 flex items-center gap-3 hover:-translate-y-0.5"
                >
                  <PlayCircle size={22} />
                  <span>دخول المشغّل والمعلم الذكي</span>
                </Link>

                <a 
                  href="#pricing" 
                  className="bg-slate-900 border border-slate-700 hover:border-slate-500 text-white px-8 py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2"
                >
                  <span>استكشف خطط الاشتراكات (SaaS)</span>
                </a>
              </div>

              {/* Trust Metrics */}
              <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6">
                <div>
                  <span className="block font-black text-2xl text-white">100%</span>
                  <span className="text-xs text-slate-500">حماية الفيديوهات (Bunny DRM)</span>
                </div>
                <div>
                  <span className="block font-black text-2xl text-[#00a88f]">5 مصادر</span>
                  <span className="text-xs text-slate-500">لتحقيق الدخل والنمو التجاري</span>
                </div>
                <div>
                  <span className="block font-black text-2xl text-purple-400">Gemini 3.6</span>
                  <span className="text-xs text-slate-500">معلم ذكي متفاعل لحظياً</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#00a88f] to-teal-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg">
                  LIVE INTERACTIVE SYSTEM
                </div>

                <div className="aspect-video bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <PlayCircle size={64} className="text-[#00a88f] group-hover:scale-110 transition-transform z-10" />
                  <span className="absolute bottom-4 right-4 text-xs font-bold text-white bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                    دبلوم الذكاء الاصطناعي وبناء الوكلاء
                  </span>
                </div>

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

      {/* 4. Enterprise B2B Trust Bar */}
      <section className="py-10 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-6">
            تثق بنا المدارس، المراكز التعليمية، وكبرى المؤسسات لتأهيل كوادرها
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="font-black text-xl text-slate-400">Vodafone</span>
            <span className="font-black text-xl text-slate-400">MASAR Center</span>
            <span className="font-black text-xl text-slate-400">Global Tech</span>
            <span className="font-black text-xl text-slate-400">EduAcademy</span>
            <span className="font-black text-xl text-slate-400">SaaS Systems</span>
          </div>
        </div>
      </section>

      {/* 5. Deep Category Taxonomy (Udemy Style) */}
      <section className="py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">استكشف الأقسام والتخصصات</h2>
              <p className="text-xs text-slate-400 mt-1">مسارات تعليمية مصممة لتغطية متطلبات سوق العمل العالمي</p>
            </div>
            <Link href="/courses" className="text-xs font-bold text-[#00a88f] hover:underline flex items-center gap-1">
              جميع الأقسام <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'الذكاء الاصطناعي', count: '42 كورس', icon: BrainCircuit },
              { name: 'تطوير البرمجيات', count: '128 كورس', icon: Zap },
              { name: 'إدارة الأعمال (B2B)', count: '65 كورس', icon: Building2 },
              { name: 'التسويق الرقمي', count: '54 كورس', icon: Globe },
              { name: 'التصميم والتجربة', count: '38 كورس', icon: Layers },
              { name: 'الشهادات المعتمدة', count: '29 مسار', icon: Award },
            ].map((cat, idx) => (
              <div 
                key={idx} 
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-[#00a88f] hover:bg-slate-800/80 cursor-pointer transition-all group"
              >
                <cat.icon className="text-[#00a88f] mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h3 className="font-bold text-sm text-white mb-1">{cat.name}</h3>
                <span className="text-[11px] text-slate-500 block">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Monetization & Pricing Section (SaaS + Individual + B2B) */}
      <section id="pricing" className="py-20 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#00a88f] font-extrabold text-xs tracking-widest uppercase block mb-2">نماذج الاشتراكات المرنة</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">اختر خطة التعلم التي تناسب احتياجك</h2>
            <p className="text-slate-400 text-sm">
              نوفر لك حرية الاختيار بين شراء كورس فردي لمرة واحدة، أو الاشتراك في خطة التعلم المفتوحة، أو حلول المؤسسات B2B.
            </p>

            {/* Toggle Billing Period */}
            <div className="inline-flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mt-8">
              <button
                onClick={() => setPricingPeriod('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pricingPeriod === 'monthly' ? 'bg-[#00a88f] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                دفع شهري
              </button>
              <button
                onClick={() => setPricingPeriod('yearly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  pricingPeriod === 'yearly' ? 'bg-[#00a88f] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>دفع سنوي</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">وفر 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Model 1: Individual Course Sale */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">البيع المباشر</span>
                <h3 className="text-2xl font-black text-white mb-2">شراء كورس فردي</h3>
                <p className="text-xs text-slate-400 mb-6">مناسب لمن يبحث عن دورة تدريبية محددة والاحتفاظ بها مدى الحياة.</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-black text-white">تبدأ من $29</span>
                  <span className="text-xs text-slate-500 block mt-1">يدفع مرة واحدة لكل كورس</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6 mb-8">
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> وصول لجميع محاضرات الكورس مدى الحياة</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> دعم المعلم الذكي داخل الكورس</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> شهادة إتمام موثقة برمز QR</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> تحديثات الكورس المستقبلية مجاناً</li>
                </ul>
              </div>

              <Link href="/courses" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3.5 rounded-xl text-center block transition-colors">
                استكشف الكورسات الفردية
              </Link>
            </div>

            {/* Model 2: SaaS Subscription (Personal Plan) - FEATURED */}
            <div className="bg-gradient-to-b from-[#391e75]/40 via-slate-900 to-slate-900 border-2 border-[#00a88f] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-[#00a88f] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg">
                الأكثر إقبالاً (PERSONAL PLAN)
              </div>

              <div>
                <span className="text-xs font-extrabold text-[#00a88f] uppercase tracking-wider block mb-2">الاشتراك السحابي (SaaS)</span>
                <h3 className="text-2xl font-black text-white mb-2">الاشتراك الشخصي الشامل</h3>
                <p className="text-xs text-slate-300 mb-6">وصول غير محدود لكافة الكورسات والمسارات المهنية والمعلم الذكي.</p>

                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{pricingPeriod === 'yearly' ? '$19' : '$25'}</span>
                  <span className="text-xs text-slate-400"> / شهرياً (تفوّتر {pricingPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'})</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-200 border-t border-purple-500/20 pt-6 mb-8">
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> وصول لجميع مكتبة الكورسات (+500 كورس)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> استخدام غير محدود للمعلم الذكي (Gemini 3.6)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> شهادات اعتماد واختبارات قياس مستوى</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> مشغّل محمي بجودة HD بدون إعلانات</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-[#00a88f]" /> خصم 30% على جلسات التوجيه المباشر (1-on-1)</li>
                </ul>
              </div>

              <Link href="/login" className="w-full bg-[#00a88f] hover:bg-[#008f7a] text-white font-extrabold text-xs py-4 rounded-xl text-center block transition-all shadow-lg shadow-[#00a88f]/30">
                اشترك الآن وابدأ التجربة
              </Link>
            </div>

            {/* Model 3: B2B Enterprise Seats */}
            <div id="b2b" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider block mb-2">قطاع الشركات والمدارس</span>
                <h3 className="text-2xl font-black text-white mb-2">خطة المؤسسات (B2B)</h3>
                <p className="text-xs text-slate-400 mb-6">حلول تدريب الموظفين والطلاب مع لوحات تحكم متقدمة وتقارير أداء.</p>

                <div className="mb-6">
                  <span className="text-3xl font-black text-white">تخصيص كامل</span>
                  <span className="text-xs text-slate-500 block mt-1">بناءً على عدد المقاعد (Seats)</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6 mb-8">
                  <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> لوحة تحكم المؤسسة لإدارة المقاعد (Admin Dashboard)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> تقارير تتبع إنجاز الموظفين والطلاب</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> تخصيص مسارات تعليمية خاصة بالشركة</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-purple-400" /> دعم فني مخصص ومدير حساب مستمر</li>
                </ul>
              </div>

              <Link href="/b2b-contact" className="w-full bg-[#391e75] hover:bg-[#2d175e] text-white font-bold text-xs py-3.5 rounded-xl text-center block transition-colors">
                طلب عرض سعر للمؤسسة
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Verified Certificate System Highlight */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <span className="text-[#00a88f] font-bold text-xs tracking-widest uppercase block mb-2">نظام التوثيق الرقمي المعزز</span>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4">شهادات رسمية مشفرة برمز QR للتحقق المباشر</h2>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                عند إتمام أي مسار تعليمي، تُصدر المنصة شهادة رسمية تحتوي على معرف فريد ورمز QR. يمكن لأصحاب العمل والشركات التحقق المباشر من صحة الشهادة عبر بوابتنا المفتوحة للتحقق.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5"><ShieldCheck size={18} className="text-[#00a88f]" /> موثوقة دولياً</span>
                <span className="flex items-center gap-1.5"><Award size={18} className="text-amber-400" /> رابط تحقق عام</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                <div className="w-16 h-16 bg-[#00a88f]/10 text-[#00a88f] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00a88f]/20">
                  <Award size={32} />
                </div>
                <h4 className="font-extrabold text-white text-base mb-1">شهادة إتمام معتمدة</h4>
                <p className="text-[11px] text-slate-500 mb-4">المعرف الرقمي: MSR-2026-8894</p>
                <div className="bg-white p-3 rounded-xl inline-block mb-3">
                  {/* QR Code Placeholder */}
                  <div className="w-28 h-28 bg-slate-900 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    QR VERIFIED
                  </div>
                </div>
                <span className="block text-[10px] text-[#00a88f] font-bold">جاهزة للتحقق الفوري عبر /verify</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#00a88f] rounded-xl flex items-center justify-center text-white font-black">M</div>
                <span className="font-black text-lg text-white">منصة مسار العالمية</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-sm mb-4">
                الجيل الجديد من منصات التعليم الذكي المرتكزة على المعلم الاصطناعي، حماية الفيديوهات المتقدمة، واشتراكات الأفراد والشركات.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">عن المنصة</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">خطط الاشتراكات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">مسار للشركات (B2B)</a></li>
                <li><a href="#" className="hover:text-white transition-colors">درّس معنا</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">المسارات</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="hover:text-white transition-colors">الذكاء الاصطناعي</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تطوير البرمجيات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">إدارة الأعمال</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الشهادات المعتمدة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">الدعم والتحقق</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="hover:text-white transition-colors">التحقق من الشهادات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600">
            <p>جميع الحقوق محفوظة © 2026 — منصة مسار للتعليم الرقمي وحلول الـ SaaS</p>
            <div className="flex gap-6">
              <span>Stripe & Iyzico Encrypted</span>
              <span>Bunny.net DRM Protected</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}