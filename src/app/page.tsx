'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Search, Shield, MonitorPlay, ArrowRight, Check, ChevronDown, 
  Sparkles, BrainCircuit, Code, Palette, Briefcase, 
  LayoutDashboard, LogOut, Loader2, Lock, Globe, Mail
} from 'lucide-react';

export default function GlobalPlatformHome() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const fetchPublishedCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, description, price, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (data) setCourses(data);
      setIsLoadingCourses(false);
    };
    fetchPublishedCourses();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const faqs = [
    { q: 'كيف يعمل المعلم الذكي (AI Tutor) في مسار؟', a: 'يتم تدريب المعلم الذكي حصرياً على المادة العلمية الخاصة بكل كورس بواسطة المحاضر للإجابة على استفسارات الطلاب بدقة.' },
    { q: 'هل يمكنني الانضمام كصانع محتوى (محاضر)؟', a: 'نعم بالتأكيد، توفر لك مسار أدوات متكاملة لحماية محتواك وبيع كورساتك بحرية.' },
    { q: 'هل الفيديوهات محمية من السرقة؟', a: 'نعم، نستخدم تقنيات التشفير المتقدمة (DRM) بالتعاون مع أفضل شبكات البث لحماية المحتوى.' }
  ];

  const categories = [
    { title: 'البرمجة والتطوير', icon: <Code size={24} />, count: '١٢٠+ كورس' },
    { title: 'الذكاء الاصطناعي', icon: <BrainCircuit size={24} />, count: '٤٥+ كورس' },
    { title: 'التصميم والجرافيك', icon: <Palette size={24} />, count: '٨٠+ كورس' },
    { title: 'ريادة الأعمال', icon: <Briefcase size={24} />, count: '٦٠+ كورس' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'system-ui, sans-serif' }} dir="rtl">
      
      {/* Header */}
      <header style={{ borderBottom: '1px solid #f2f2f2', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/" style={{ fontWeight: 'bold', color: '#08090a', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Sparkles style={{ color: '#0c8c5e' }} size={20} />
              <span style={{ fontSize: '18px' }}>MASAR</span>
            </Link>
            <nav style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500 }}>
              <Link href="/courses" style={{ color: '#08090a', textDecoration: 'none' }}>تصفح الكورسات</Link>
              <Link href="/login?redirect=/instructor" style={{ color: '#08090a', textDecoration: 'none' }}>التدريس في مسار</Link>
            </nav>
          </div>

          <div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <Link href="/dashboard" style={{ fontSize: '14px', fontWeight: 500, color: '#08090a', textDecoration: 'none', padding: '8px 16px', background: '#f2f2f2', borderRadius: '4px' }}>
                    لوحة التحكم
                  </Link>
                  <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', padding: '8px' }}>
                    <LogOut size={18} />
                  </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#08090a', textDecoration: 'none', padding: '8px 16px' }}>
                  دخول
                </Link>
                <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, backgroundColor: '#08090a', color: '#ffffff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                  ابدأ مجاناً
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ padding: '80px 24px', textAlign: 'center', borderBottom: '1px solid #f2f2f2', background: 'linear-gradient(to bottom, rgba(12, 140, 94, 0.03), #ffffff)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#ffffff', border: '1px solid #f2f2f2', color: '#0c8c5e', padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
              الجيل الجديد من التعليم المدعوم بالذكاء الاصطناعي
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#08090a', lineHeight: 1.2, marginBottom: '24px', letterSpacing: '-0.02em' }}>
              تعلم، وعَلِّم، بذكاء لم يسبق له مثيل.
            </h1>
            <p style={{ fontSize: '18px', color: '#555555', lineHeight: 1.6, marginBottom: '40px' }}>
              المنصة التعليمية الأولى التي تدمج التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي لكل طالب ومدرس.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '14px', fontWeight: 500, color: '#666666' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} style={{ color: '#0c8c5e' }} /> حماية DRM</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BrainCircuit size={16} style={{ color: '#0c8c5e' }} /> المعلم الذكي</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MonitorPlay size={16} style={{ color: '#0c8c5e' }} /> وصول مدى الحياة</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#08090a', marginBottom: '32px' }}>
            استكشف التصنيفات الرئيسية
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {categories.map((cat, i) => (
              <div key={i} style={{ border: '1px solid #f2f2f2', borderRadius: '16px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#0c8c5e' }}>
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#08090a', marginBottom: '8px' }}>{cat.title}</h3>
                <p style={{ fontSize: '13px', color: '#777777' }}>{cat.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #f2f2f2' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#08090a', marginBottom: '32px' }}>أحدث الكورسات المنشورة</h2>
          
          {isLoadingCourses ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 className="animate-spin" style={{ color: '#0c8c5e', width: '32px', height: '32px' }} />
            </div>
          ) : courses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {courses.map((course) => (
                <Link href={`/courses/${course.slug}`} key={course.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #f2f2f2', borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', backgroundColor: '#ffffff' }}>
                  <div style={{ aspectRatio: '16/9', backgroundColor: '#08090a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MonitorPlay style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#08090a', marginBottom: '8px' }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#777777', marginBottom: '16px' }}>{course.profiles?.full_name || 'مدرس معتمد'}</p>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'between', paddingTop: '16px', borderTop: '1px solid #f2f2f2' }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#08090a' }}>
                        {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0c8c5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        التفاصيل <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #f2f2f2', borderRadius: '16px', color: '#777777' }}>
              لا توجد كورسات متاحة حالياً.
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '80px 24px', maxWidth: '800px', margin: '0 auto', borderTop: '1px solid #f2f2f2' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#08090a', marginBottom: '32px', textAlign: 'center' }}>
            الأسئلة الشائعة
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ border: '1px solid #f2f2f2', borderRadius: '16px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  style={{ width: '100%', textAlign: 'right', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: '#08090a' }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {activeFaq === i && (
                  <div style={{ padding: '0 24px 20px 24px', fontSize: '14px', lineHeight: 1.6, color: '#555555' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#08090a', color: '#ffffff', padding: '64px 24px', marginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles style={{ color: '#0c8c5e' }} size={18} />
              <span>MASAR</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>منصة مسار التعليمية المدعومة بالذكاء الاصطناعي.</p>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={12} /> جميع الحقوق محفوظة © 2026 مسار
          </div>
        </div>
      </footer>

    </div>
  );
}