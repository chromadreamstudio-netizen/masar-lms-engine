import React from 'react';

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          ارتقِ بتدريسك مع الذكاء الاصطناعي
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          اختر الباقة المناسبة لك، ووفر مئات الساعات من التحضير والرد على الطلاب.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {/* الباقة الأساسية */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900">الأساسية</h3>
            <p className="mt-4 text-gray-500">للمدرسين المبتدئين في العالم الرقمي</p>
            <div className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">مجاناً</span>
            </div>
            <ul className="mt-8 space-y-4 text-right">
              <li className="flex items-center">✅ رفع حتى 5 كورسات</li>
              <li className="flex items-center">✅ حماية أساسية للفيديوهات</li>
              <li className="flex items-center text-gray-400">❌ بدون المعلم الذكي (AI Tutor)</li>
            </ul>
            <button className="mt-8 w-full bg-indigo-50 text-indigo-700 font-bold py-3 rounded-md hover:bg-indigo-100 transition">
              ابدأ الآن
            </button>
          </div>

          {/* باقة الذكاء الاصطناعي (MagicSchool Model) */}
          <div className="bg-indigo-600 rounded-lg shadow-xl p-8 border border-indigo-700 relative transform scale-105">
            <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-md">
              الأكثر طلباً
            </div>
            <h3 className="text-2xl font-semibold text-white">مسار برو (AI)</h3>
            <p className="mt-4 text-indigo-200">التحكم الكامل والرد الآلي على آلاف الطلاب</p>
            <div className="mt-8 flex justify-center items-baseline text-white">
              <span className="text-4xl font-extrabold">$29</span>
              <span className="ml-1 text-xl">/شهرياً</span>
            </div>
            <ul className="mt-8 space-y-4 text-right text-indigo-100">
              <li className="flex items-center">✅ كورسات وطلاب غير محدودين</li>
              <li className="flex items-center">✅ حماية DRM المتقدمة والعلامة المائية</li>
              <li className="flex items-center font-bold text-white">🚀 المعلم الذكي (AI Tutor) يعمل 24/7</li>
              <li className="flex items-center font-bold text-white">🚀 توليد الاختبارات آلياً (AI Quizzes)</li>
            </ul>
            <button className="mt-8 w-full bg-white text-indigo-600 font-bold py-3 rounded-md hover:bg-gray-50 transition shadow-lg">
              اشترك الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}