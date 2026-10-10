'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowRight, BookOpen, DollarSign, Type, AlignLeft, Link as LinkIcon, Loader2, PlusCircle } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: 0,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // توليد رابط (Slug) تلقائياً من العنوان
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // إزالة الرموز الخاصة
      .replace(/[\s_-]+/g, '-') // استبدال المسافات بشرطة
      .replace(/^-+|-+$/g, ''); // إزالة الشرطات من الأطراف

    setFormData({ ...formData, title, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. جلب بيانات المدرس الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      // 2. إدخال الكورس في قاعدة البيانات
      const { data, error: insertError } = await supabase
        .from('courses')
        .insert([
          {
            title: formData.title,
            slug: formData.slug || Date.now().toString(),
            description: formData.description,
            price: formData.price,
            instructor_id: user.id,
            is_published: false, // الكورس يبدأ كمسودة
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. العودة إلى لوحة المدرسين بعد النجاح
      router.push('/instructor');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الكورس. قد يكون الرابط (Slug) مستخدماً بالفعل.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl font-sans" dir="rtl">
      
      <div className="max-w-3xl mx-auto">
        {/* الترويسة والعودة */}
        <div className="mb-8">
          <Link 
            href="/instructor" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00a88f] transition-colors mb-6 text-sm font-bold"
          >
            <ArrowRight size={16} /> العودة للوحة التحكم
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BookOpen className="text-[#00a88f]" size={32} />
            إنشاء كورس جديد
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            أدخل التفاصيل الأساسية للكورس الخاص بك. يمكنك تعديل هذه البيانات لاحقاً قبل النشر.
          </p>
        </div>

        {/* نموذج الإنشاء */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* عنوان الكورس */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">عنوان الكورس</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="block w-full pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-[#00a88f] focus:border-[#00a88f] transition-colors text-sm"
                  placeholder="مثال: دبلوم تطوير الويب الشامل 2026"
                />
              </div>
            </div>

            {/* الرابط المخصص (Slug) */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">الرابط المخصص (Slug)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="block w-full pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-[#00a88f] focus:border-[#00a88f] transition-colors text-sm text-left"
                  placeholder="full-stack-web-development"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">يجب أن يكون باللغة الإنجليزية، بدون مسافات، وفريداً. (مثال: masar.com/courses/<span className="text-[#00a88f]">{formData.slug || 'slug'}</span>)</p>
            </div>

            {/* وصف قصير */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">وصف قصير</label>
              <div className="relative">
                <div className="absolute top-3 right-0 pr-3 pointer-events-none">
                  <AlignLeft className="h-5 w-5 text-slate-500" />
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-[#00a88f] focus:border-[#00a88f] transition-colors text-sm resize-none"
                  placeholder="اكتب وصفاً جذاباً يشرح ما سيتعلمه الطالب في هذا الكورس..."
                />
              </div>
            </div>

            {/* السعر */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">سعر الكورس (بالدولار الأمريكي)</label>
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="block w-full pr-10 py-3 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-[#00a88f] focus:border-[#00a88f] transition-colors text-sm font-bold text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">ضع السعر 0 إذا كنت تريد تقديم الكورس مجاناً.</p>
            </div>

            {/* رسائل الخطأ */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-4 rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* زر الحفظ */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#00a88f] hover:bg-[#008f7a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#00a88f]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" /> حفظ وإنشاء مسودة
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}