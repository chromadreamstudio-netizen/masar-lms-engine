'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, PlayCircle, MonitorPlay, ArrowRight, 
  Sparkles, Star, Loader2, Filter
} from 'lucide-react';

export default function CoursesMarketplace() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchAllCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, description, price, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (data) setCourses(data);
      setIsLoading(false);
    };

    fetchAllCourses();
  }, [supabase]);

  // دالة البحث لتصفية الكورسات
  const filteredCourses = courses.filter(course => 
    course.title.includes(searchQuery) || 
    (course.description && course.description.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans dir-rtl" dir="rtl">
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="MASAR Logo" width={100} height={30} className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-gray-600 hover:text-mint transition-colors">الرئيسية</Link>
            <Link href="/dashboard" className="text-sm font-bold text-ink bg-gray-100 px-4 py-2 rounded-lg transition-colors hover:bg-gray-200">
              لوحة الطالب
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-ink mb-4 tracking-tight">
            استكشف <span className="text-mint">مستقبلك</span> الآن
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed">
            تصفح مكتبتنا الشاملة من الكورسات المدعومة بالذكاء الاصطناعي. تعلم من أفضل الخبراء في بيئة آمنة وتفاعلية.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن كورس، تقنية، أو مهارة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-4 pr-12 pl-4 text-ink font-bold focus:border-mint focus:ring-1 focus:ring-mint outline-none shadow-sm transition-all"
            />
          </div>
          <button className="bg-white border border-gray-200 text-gray-600 p-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm hidden md:block">
            <Filter size={20} />
          </button>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-mint" size={40} />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link href={`/courses/${course.slug}`} key={course.id} className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:border-gray-300 transition-all group no-underline">
                <div className="aspect-video bg-ink flex items-center justify-center relative overflow-hidden">
                  <MonitorPlay className="text-white/20 group-hover:scale-110 transition-transform duration-500" size={48} />
                  <div className="absolute top-4 right-4 bg-white/95 text-ink text-xs font-bold px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1.5">
                    <Sparkles size={14} className="text-mint" /> متوافق مع AI
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-ink mb-3 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                    المحاضر: <span className="text-ink">{course.profiles?.full_name || 'مدرس معتمد'}</span>
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-100">
                    <span className="text-2xl font-black text-ink">
                      {course.price > 0 ? `$${course.price}` : 'مجانــــاً'}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-ink bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Star size={16} className="fill-amber-400 text-amber-400" /> 4.9
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-ink mb-2">لم نجد أي كورسات تطابق بحثك</h3>
            <p className="text-gray-500 font-medium">جرب البحث بكلمات مختلفة أو تصفح الأقسام الأخرى.</p>
          </div>
        )}
      </main>
    </div>
  );
}