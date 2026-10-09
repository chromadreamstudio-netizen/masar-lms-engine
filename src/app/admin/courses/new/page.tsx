'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowRight, Save, Loader2, Video, BookOpen, DollarSign, Link as LinkIcon } from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: 0,
    is_published: false,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('courses')
        .insert([formData]);

      if (insertError) throw insertError;

      // توجيه المدير لصفحة الإدارة بعد نجاح الإضافة
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة الكورس');
    } finally {
      setIsLoading(false);
    }
  };

  // توليد المعرف (Slug) تلقائياً باللغة الإنجليزية
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title, slug: autoSlug || formData.slug });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 dir-rtl" dir="rtl">
      <div className="max-w-3xl mx-auto">
        
        <header className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <Link href="/admin" className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">إضافة مسار تعليمي جديد</h1>
            <p className="text-xs text-slate-400 mt-1">قم بإنشاء كورس جديد لتجهيزه وربطه بفيديوهات Bunny DRM</p>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <BookOpen size={16} className="text-[#00a88f]" /> عنوان الكورس
            </label>
            <input
              required
              type="text"
              placeholder="مثال: دبلوم التسويق الرقمي المتقدم"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00a88f] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <LinkIcon size={16} className="text-[#00a88f]" /> المعرف البرمجي (Slug - بالإنجليزية فقط)
            </label>
            <input
              required
              type="text"
              placeholder="مثال: advanced-digital-marketing"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00a88f] transition-colors font-mono text-left dir-ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Video size={16} className="text-[#00a88f]" /> وصف الكورس وأهدافه
            </label>
            <textarea
              required
              rows={4}
              placeholder="اكتب وصفاً جذاباً يشرح محتوى الكورس وماذا سيتعلم الطالب..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00a88f] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <DollarSign size={16} className="text-[#00a88f]" /> السعر (بالدولار $)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00a88f] transition-colors text-left dir-ltr"
              />
            </div>

            <div className="flex items-center h-full pt-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 text-[#00a88f] focus:ring-[#00a88f] focus:ring-offset-slate-900 bg-slate-950 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                  نشر الكورس فوراً (جعله متاحاً للطلاب)
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#00a88f] hover:bg-[#008f7a] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#00a88f]/20 flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>حفظ وإنشاء الكورس</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}