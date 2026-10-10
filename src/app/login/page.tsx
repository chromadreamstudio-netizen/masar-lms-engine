'use client';

import { useState, Suspense } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'student',
            },
          },
        });
        if (error) throw error;

        if (data.user) {
           await supabase.from('profiles').upsert({
             id: data.user.id,
             full_name: fullName,
             role: 'student'
           }, { onConflict: 'id' });
        }
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء العملية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 flex flex-col items-center sm:items-start">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#00a88f] mb-8 transition-colors">
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
        <Image src="/logo.png" alt="Masar Logo" width={140} height={45} className="object-contain" priority />
        <h2 className="mt-8 text-3xl font-black text-slate-900">
          {isLogin ? 'مرحباً بعودتك' : 'ابدأ رحلتك التعليمية'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {isLogin 
            ? 'سجل دخولك لاستكمال دروسك ومتابعة تقدمك.' 
            : 'أنشئ حساباً مجانياً وافتح آفاقاً جديدة للمعرفة.'}
        </p>
      </div>

      <div className="mt-8">
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 mr-3" />
                </div>
                <input
                  type="text"
                  required={!isLogin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:ring-[#00a88f] focus:border-[#00a88f] focus:bg-white transition-colors text-sm"
                  placeholder="مثال: وليد طه"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 mr-3" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:ring-[#00a88f] focus:border-[#00a88f] focus:bg-white transition-colors text-sm text-left"
                placeholder="you@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 mr-3" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:ring-[#00a88f] focus:border-[#00a88f] focus:bg-white transition-colors text-sm text-left"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#00a88f] hover:bg-[#008f7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a88f] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'دخول' : 'إنشاء حساب'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-bold text-[#00a88f] hover:text-[#008f7a] mr-2"
            >
              {isLogin ? 'سجل الآن' : 'قم بتسجيل الدخول'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans dir-rtl" dir="rtl">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] bg-white shadow-2xl z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#00a88f] border-t-transparent rounded-full animate-spin"></div></div>}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#391e75]/90 to-[#00a88f]/90 mix-blend-multiply"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00a88f] rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#391e75] rounded-full blur-[80px] opacity-50"></div>
        <div className="relative z-10 max-w-xl text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-4 py-2 rounded-full text-xs mb-8">
            <Sparkles size={16} className="text-amber-300" />
            <span>الجيل الجديد من منصات التعليم الرقمي</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">مستقبلك يبدأ من هنا.</h2>
          <p className="text-lg text-slate-200 mb-12 leading-relaxed">انضم إلى آلاف الطلاب الذين يطورون مهاراتهم يومياً باستخدام أحدث تقنيات التعلم المدعومة بالذكاء الاصطناعي (Gemini).</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="bg-[#00a88f]/20 p-2 rounded-xl text-[#00a88f]">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">وصول غير محدود</h4>
                <p className="text-xs text-slate-400 mt-1">تعلم بالسرعة التي تناسبك وفي أي وقت.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="bg-purple-500/20 p-2 rounded-xl text-purple-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">معلم ذكي مرافق</h4>
                <p className="text-xs text-slate-400 mt-1">مساعد ذكي يجيب على أسئلتك فوراً أثناء الدرس.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}