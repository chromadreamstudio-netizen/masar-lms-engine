import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Check, PlayCircle, Monitor, FileText, Infinity, ChevronRight, Bot } from 'lucide-react';

export default async function CourseLandingPage({ params }: { params: { slug: string } }) {
  // جلب الـ Slug من الرابط
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 1. جلب بيانات الكورس واسم المدرس بناءً على الرابط
  const { data: course } = await supabase
    .from('courses')
    .select('*, profiles(full_name)')
    .eq('slug', slug)
    .eq('is_published', true) // التأكد أن الكورس منشور
    .single();

  if (!course) {
    notFound(); // توجيه لصفحة 404 إذا الكورس غير موجود أو غير منشور
  }

  // 2. جلب المنهج (الفصول والدروس)
  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const totalLessons = modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000000] font-sans" dir="rtl">
      
      {/* التنقل العلوي البسيط */}
      <header className="border-b border-[#f2f2f2] bg-[#ffffff] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-[#08090a] flex items-center gap-2 tracking-tight">
            <span className="text-[#0c8c5e]">MASAR</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-medium text-[#08090a] hover:bg-[#f2f2f2] px-4 py-2 rounded-[4px] transition-colors">
              تسجيل الدخول
            </Link>
            <Link href="/login" className="text-[14px] font-medium bg-[#08090a] text-[#ffffff] px-4 py-2 rounded-[4px] shadow-sm hover:bg-[#000000] transition-colors">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        
        {/* المحتوى الأيسر (تفاصيل الكورس) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* قسم الـ Hero */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#0c8c5e]">
              <Link href="/courses" className="hover:underline">الكورسات</Link>
              <ChevronRight size={14} className="rotate-180" />
              <span>{course.category_id ? 'التصنيف' : 'عام'}</span>
            </div>
            <h1 className="text-[40px] leading-[1.15] font-semibold text-[#08090a] tracking-tight">
              {course.title}
            </h1>
            <p className="text-[18px] text-[#08090a]/80 leading-relaxed">
              {course.description || 'وصف شامل للكورس يأخذك من الصفر وحتى الاحتراف بخطوات عملية وتطبيقية. صُمم هذا الكورس ليناسب احتياجات سوق العمل.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-[14px]">
              <div className="flex items-center gap-1 text-[#08090a] font-medium">
                <span className="text-amber-500 flex items-center"><Star size={16} fill="currentColor" /> 4.8</span>
                <span className="text-[#08090a]/60">(1,240 تقييم)</span>
              </div>
              <div className="text-[#08090a]/60">•</div>
              <div>
                المحاضر: <span className="font-medium text-[#0c8c5e] hover:underline cursor-pointer">{course.profiles?.full_name || 'مسار Creators'}</span>
              </div>
            </div>
          </div>

          {/* ماذا ستتعلم (Feature Capability Style) */}
          <div className="bg-[#0c8c5e]/[0.03] border border-[#f2f2f2] rounded-[16px] p-8">
            <h2 className="text-[20px] font-semibold text-[#08090a] mb-6 tracking-tight">ماذا ستتعلم في هذا الكورس؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'إتقان المهارات الأساسية والمتقدمة من الصفر',
                'بناء مشاريع عملية يمكن إضافتها لمعرض أعمالك',
                'التفاعل المباشر مع الذكاء الاصطناعي لفهم أعمق',
                'الحصول على أفضل الممارسات المستخدمة في الشركات'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 text-[#0c8c5e]"><Check size={16} strokeWidth={2.5} /></div>
                  <span className="text-[15px] leading-relaxed text-[#000000]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* محتوى المنهج */}
          <div>
            <h2 className="text-[24px] font-semibold text-[#08090a] mb-6 tracking-tight">محتوى الكورس</h2>
            <div className="flex items-center gap-4 text-[14px] text-[#08090a]/60 mb-4 font-medium">
              <span>{modules?.length || 0} فصول</span>
              <span>•</span>
              <span>{totalLessons} درس</span>
            </div>
            
            <div className="border border-[#dddddd] rounded-[16px] overflow-hidden">
              {modules?.map((module: any, index: number) => (
                <div key={module.id} className={`border-b border-[#dddddd] last:border-0 ${index === 0 ? 'bg-[#f2f2f2]/40' : 'bg-[#ffffff]'}`}>
                  <div className="p-5 font-semibold text-[#08090a] flex items-center justify-between">
                    <span>{module.title}</span>
                    <span className="text-[13px] font-normal text-[#08090a]/60">{module.lessons?.length || 0} دروس</span>
                  </div>
                  <div className="px-5 pb-5 space-y-3">
                    {module.lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center justify-between text-[14px] group">
                        <div className="flex items-center gap-3 text-[#08090a]/80 group-hover:text-[#0c8c5e] transition-colors">
                          <PlayCircle size={16} className={lesson.is_free_preview ? "text-[#0c8c5e]" : "text-[#dddddd]"} />
                          <span>{lesson.title}</span>
                        </div>
                        {lesson.is_free_preview && (
                          <span className="text-[13px] font-medium text-[#0c8c5e] underline cursor-pointer">معاينة مجانية</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الشريط الجانبي (بطاقة الشراء العائمة) */}
        <div className="relative">
          <div className="sticky top-24 border border-[#dddddd] bg-[#ffffff] rounded-[16px] overflow-hidden shadow-sm p-1">
            
            {/* مكان صورة الكورس أو فيديو تعريفي */}
            <div className="w-full h-52 bg-[#08090a] rounded-[12px] flex items-center justify-center relative group cursor-pointer overflow-hidden">
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#08090a] to-[#0c8c5e]/20 z-10"></div>
              )}
              <PlayCircle size={48} className="text-[#ffffff] z-20 opacity-90 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-4 text-[#ffffff] z-20 text-[14px] font-medium tracking-tight">معاينة الكورس</div>
            </div>

            <div className="p-6">
              <div className="text-[32px] font-semibold text-[#08090a] tracking-tight mb-6">
                ${course.price || '0'}
              </div>
              
              <div className="space-y-3 mb-6">
                <button className="w-full bg-[#08090a] hover:bg-[#000000] text-[#ffffff] py-3.5 rounded-[4px] font-medium text-[14px] transition-all shadow-sm">
                  الاشتراك في الكورس
                </button>
                <button className="w-full bg-[#ffffff] border border-[#dddddd] hover:bg-[#f2f2f2] text-[#08090a] py-3.5 rounded-[4px] font-medium text-[14px] transition-all">
                  التحدث مع المبيعات
                </button>
              </div>

              <div className="text-[13px] font-semibold text-[#0c8c5e] mb-4 uppercase tracking-[0.05em]">
                هذا الكورس يتضمن
              </div>
              
              <ul className="space-y-3 text-[14px] text-[#000000]">
                <li className="flex items-center gap-3"><Monitor size={16} className="text-[#08090a]/60" /> وصول كامل ومباشر للمنصة</li>
                <li className="flex items-center gap-3"><Bot size={16} className="text-[#0c8c5e]" /> دعم المعلم الآلي التفاعلي (Gemini)</li>
                <li className="flex items-center gap-3"><FileText size={16} className="text-[#08090a]/60" /> ملفات ومرفقات تعليمية</li>
                <li className="flex items-center gap-3"><Infinity size={16} className="text-[#08090a]/60" /> وصول مدى الحياة</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}