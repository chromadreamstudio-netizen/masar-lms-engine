'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Mail, Lock, User, Phone, ArrowLeft, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // قراءة الوجهة المطلوبة من الـ URL، أو الاعتماد على لوحة التحكم كوجهة افتراضية
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // --- 1. عملية إنشاء حساب جديد (Signup) ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (error) throw error;

        // تسجيل البيانات بشكل آمن في جدول contacts دون إيقاف العملية عند وجود قيود
        if (data.user) {
          try {
            await supabase.from('contacts').insert([
              {
                user_id: data.user.id,
                full_name: fullName,
                email: email,
                phone: phone,
                notes: 'حساب جديد تم إنشاؤه من منصة مسار',
              },
            ]);
          } catch (contactErr) {
            console.warn('تنبيه: لم يتم حفظ جهة الاتصال في جدول contacts:', contactErr);
          }
        }

        // التوجيه إذا تم إنشاء الجلسة فوراً (Confirm Email غير مفعّل)
        if (data.session) {
          router.push(redirectTarget);
          router.refresh();
        } else {
          setSuccessMsg('تم إنشاء الحساب بنجاح! إذا كان تأكيد البريد مفعلاً، يرجى مراجعة بريدك الإلكتروني لإنهاء التفعيل، أو يمكنك تسجيل الدخول الآن.');
          setIsSignUp(false);
        }
      } else {
        // --- 2. عملية تسجيل الدخول (Sign In) ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // التوجيه الديناميكي للجهة المستهدفة
        router.push(redirectTarget);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تنفيذ الطلب. يرجى التثبت من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      
      {/* خلفية جمالية */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00a88f]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#391e75]/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* الشعار والهيدر */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#391e75] to-[#00a88f] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/10">
            M
          </div>
        </Link>
        <h1 className="text-2xl font-black text-white">
          {isSignUp ? 'أنشئ حسابك في منصة مسار' : 'تسجيل الدخول'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isSignUp ? 'انضم إلى آلاف المتعلمين وابدأ رحلتك التفاعلية اليوم' : 'مرحباً بك مجدداً، ادخل بياناتك للمتابعة'}
        </p>
      </div>

      {/* أزرار التبديل بين الدخول والتسجيل */}
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            !isSignUp ? 'bg-[#391e75] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          تسجيل الدخول
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            isSignUp ? 'bg-[#00a88f] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>حساب جديد</span>
        </button>
      </div>

      {/* رسائل التنبيه والخطأ */}
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center font-medium flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* نموذج الإدخال */}
      <form onSubmit={handleAuth} className="space-y-4">
        
        {isSignUp && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="وليد طه"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00a88f] transition-all"
                />
                <User size={16} className="absolute right-3 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف (اختياري)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00a88f] transition-all"
                />
                <Phone size={16} className="absolute right-3 top-3.5 text-slate-500" />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00a88f] transition-all"
            />
            <Mail size={16} className="absolute right-3 top-3.5 text-slate-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور</label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00a88f] transition-all"
            />
            <Lock size={16} className="absolute right-3 top-3.5 text-slate-500" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-extrabold text-xs text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
            isSignUp 
              ? 'bg-[#00a88f] hover:bg-[#008f7a] shadow-[#00a88f]/20' 
              : 'bg-[#391e75] hover:bg-[#2d175e] shadow-purple-950/50'
          } disabled:opacity-50`}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>
            {loading 
              ? 'جاري التحقق والتقييد...' 
              : isSignUp 
                ? 'إنشاء حساب جديد والبدء' 
                : 'دخول المنصة'}
          </span>
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>العودة لصفحة الهبوط الرئيسية</span>
        </Link>
      </div>

    </div>
  );
}

// التغليف النهائي بـ Suspense للتوافق مع Next.js App Router
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans dir-rtl">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 size={18} className="animate-spin text-[#00a88f]" />
          <span>جاري تحميل واجهة المصادقة...</span>
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  );
}