import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  PlayCircle, CheckCircle2, BrainCircuit, MonitorPlay, 
  Infinity, Trophy, ChevronRight, ShoppingCart, Zap 
} from 'lucide-react';

export const revalidate = 0;

export default async function CourseSalesPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // جلب بيانات الكورس من قاعدة البيانات
  const { data: course } = await supabase
    .from('courses')
    .select(`
      id, title, description, price, 
      modules (
        id, title, order_index,
        lessons (id, title, order_index, is_free_preview)
      )
    `)
    .eq('slug', resolvedParams.slug)
    .eq('is_published', true)
    .single();

  if (!course) notFound();

  // ترتيب المنهج
  const sortedModules = course.modules?.sort((a: any, b: any) => a.order_index - b.order_index) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans dir-rtl selection:bg-[#00a88f] selection:text-white" dir="rtl">
      
      {/* الترويسة العلوية الداكنة */}
      <header className="bg-slate-950 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            
            {/* تفاصيل الكورس */}
            <div className="lg:col-span-8 z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00a88f] mb-4">
                <Link href="/" className="hover:underline">الرئيسية</Link>
                <ChevronRight size={14} />
                <span>الكورسات</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 mb-6">
                <span className="flex items-center gap-2"><MonitorPlay size={18} className="text-purple-400" /> وصول مدى الحياة</span>
                <span className="flex items-center gap-2"><BrainCircuit size={18} className="text-[#00a88f]" /> مدعوم بالمعلم الذكي (Gemini)</span>
                <span className="flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> شهادة معتمدة</span>
              </div>
            </div>

            {/* بطاقة الشراء (العائمة في الشاشات الكبيرة) */}
            <div className="lg:col-span-4 lg:absolute left-8 top-0 w-full lg:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 z-20">
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center group cursor-pointer">
                {/* مكان الفيديو الترويجي */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                <PlayCircle size={64} className="text-white z-10 group-hover:scale-110 transition-transform shadow-sm" />
                <span className="absolute bottom-4 text-sm font-bold text-white bg-black/60 px-4 py-1 rounded-full backdrop-blur-md">
                  معاينة الكورس
                </span>
              </div>
              
              <div className="p-6">
                <div className="text-3xl font-black mb-6">
                  {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                </div>

                <div className="space-y-3">
                  {/* أزرار الدفع (سيتم ربطها بـ Lemon Squeezy لاحقاً) */}
                  <button className="w-full bg-[#00a88f] hover:bg-[#008f7a] text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#00a88f]/20 flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    شراء الكورس الآن
                  </button>
                  
                  <div className="text-center text-xs text-slate-500 my-2 font-bold">أو</div>
                  
                  <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-4 rounded-xl font-bold text-sm transition-all border border-purple-200 flex items-center justify-center gap-2">
                    <Zap size={18} />
                    اشترك في مسار برو (وصول غير محدود)
                  </button>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                  ضمان استرداد الأموال لمدة 30 يوماً
                </p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* محتوى الكورس والمنهج */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* ماذا ستتعلم */}
            <section className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-black mb-6">ماذا ستتعلم في هذا الكورس؟</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#00a88f] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">التطبيق العملي خطوة بخطوة مع مشاريع حقيقية.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#00a88f] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">استخدام الذكاء الاصطناعي لتحليل الكود والبيانات.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#00a88f] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">الحصول على دعم فوري من "المعلم الذكي" المدمج.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#00a88f] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">تجهيزك لسوق العمل بشهادة معتمدة دولياً.</span>
                </div>
              </div>
            </section>

            {/* المنهج (Curriculum) */}
            <section>
              <h2 className="text-2xl font-black mb-6">منهج الكورس</h2>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {sortedModules.length > 0 ? sortedModules.map((module: any, idx: number) => (
                  <div key={module.id} className="border-b border-slate-100 last:border-0">
                    <div className="bg-slate-50 p-5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                      <h3 className="font-bold text-slate-900 text-sm">{module.title}</h3>
                      <span className="text-xs font-bold text-slate-500">{module.lessons?.length || 0} دروس</span>
                    </div>
                    <div className="p-2">
                      {module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <MonitorPlay size={16} className={lesson.is_free_preview ? "text-[#00a88f]" : "text-slate-400"} />
                            <span className={`text-sm ${lesson.is_free_preview ? 'text-[#00a88f] font-bold cursor-pointer hover:underline' : 'text-slate-700'}`}>
                              {lesson.title}
                            </span>
                          </div>
                          {lesson.is_free_preview && (
                            <span className="text-[10px] bg-[#00a88f]/10 text-[#00a88f] px-2 py-1 rounded font-bold">معاينة مجانية</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500 text-sm">لم يتم إضافة فصول دراسية لهذا الكورس بعد.</div>
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}