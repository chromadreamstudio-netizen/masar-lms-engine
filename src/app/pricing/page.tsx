'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Sparkles, BrainCircuit, Shield, Zap } from 'lucide-react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  // تعريف الباقات مع روابط الدفع الحقيقية
  const plans = [
    {
      name: 'الأساسية',
      price: 'مجانــــاً',
      desc: 'للمدرسين المبتدئين لتجربة المنصة',
      buttonText: 'ابدأ مجاناً',
      buttonStyle: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      popular: false,
      href: '/login?redirect=/instructor', 
      target: '_self'
    },
    {
      name: 'مسار برو (AI)',
      price: isAnnual ? '$290' : '$29',
      period: isAnnual ? '/سنوياً' : '/شهرياً',
      desc: 'للمحترفين الذين يقدرون وقتهم',
      buttonText: 'اشترك في برو',
      buttonStyle: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg',
      popular: true,
      badge: 'الأكثر طلباً',
      // تم تحديث هذا الرابط للرابط الحي (Live Mode) الخاص بباقة المدرسين
      href: 'https://masar-platform.lemonsqueezy.com/checkout/buy/34186278-24fc-4584-be7c-abbca4ca94d0', 
      target: '_blank' 
    },
    {
      name: 'المؤسسات',
      price: 'مخصص',
      desc: 'للمراكز التعليمية والمدارس الكبرى',
      buttonText: 'تواصل معنا',
      buttonStyle: 'bg-gray-900 text-white hover:bg-gray-800',
      popular: false,
      href: 'mailto:ceo@masar.com', 
      target: '_blank'
    },
  ];

  // جدول مقارنة المميزات
  const features = [
    {
      category: 'أدوات الذكاء الاصطناعي (AI Tools)',
      items: [
        { name: 'المعلم الذكي (AI Tutor) للطلاب', free: false, pro: true, enterprise: true },
        { name: 'توليد الاختبارات آلياً (Quiz Generator)', free: false, pro: true, enterprise: true },
        { name: 'تحليل أداء الطلاب بالذكاء الاصطناعي', free: false, pro: true, enterprise: true },
        { name: 'توليد خطط الدروس والمذكرات', free: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'التشغيل والحماية (Operations & Security)',
      items: [
        { name: 'رفع الكورسات', free: 'حتى 5 كورسات', pro: 'غير محدود', enterprise: 'غير محدود' },
        { name: 'عدد الطلاب', free: 'حتى 100 طالب', pro: 'غير محدود', enterprise: 'غير محدود' },
        { name: 'حماية الفيديو (DRM الأساسية)', free: true, pro: true, enterprise: true },
        { name: 'العلامة المائية الديناميكية (Dynamic Watermark)', free: false, pro: true, enterprise: true },
        { name: 'منع مشاركة الحسابات (Device Fingerprinting)', free: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'الإدارة والتحكم (Admin)',
      items: [
        { name: 'لوحة تحكم المبيعات', free: true, pro: true, enterprise: true },
        { name: 'تصدير بيانات الطلاب', free: false, pro: true, enterprise: true },
        { name: 'إضافة مساعدين (Sub-accounts)', free: false, pro: false, enterprise: true },
        { name: 'واجهة مخصصة (White-labeling)', free: false, pro: false, enterprise: true },
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans pb-24" dir="rtl">
      {/* 1. Header Section */}
      <div className="bg-indigo-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b-8 border-indigo-500">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" size={40} />
            منصة واحدة، خيارات مرنة
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            استثمر في وقتك. دع الذكاء الاصطناعي من "مسار" يدير الشرح والردود، لتركز أنت على النمو.
          </p>

          {/* Toggle Monthly/Annual */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-indigo-300'}`}>شهرياً</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-indigo-700 focus:outline-none transition-colors"
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAnnual ? '-translate-x-1' : '-translate-x-9'}`} />
            </button>
            <span className={`text-sm font-bold ${isAnnual ? 'text-white' : 'text-indigo-300'}`}>
              سنوياً <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">وفر 20%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* 2. Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white rounded-2xl shadow-xl border ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50 transform md:-translate-y-4' : 'border-gray-200'} p-8 relative flex flex-col`}>
              {plan.badge && (
                <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-black tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 font-medium mb-6 h-10">{plan.desc}</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500 text-lg font-medium">{plan.period}</span>}
              </div>
              
              {/* زر الاشتراك مبرمج برابط الدفع المباشر */}
              <a 
                href={plan.href}
                target={plan.target}
                rel={plan.target === '_blank' ? "noopener noreferrer" : ""}
                className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all mt-auto text-center block ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        {/* 3. Detailed Comparison Matrix */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">مقارنة الباقات التفصيلية</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-6 text-sm font-bold text-gray-500 w-2/5">المميزات</th>
                    <th className="p-6 text-sm font-bold text-gray-900 w-1/5 text-center">الأساسية</th>
                    <th className="p-6 text-sm font-bold text-indigo-700 w-1/5 text-center bg-indigo-50/50">مسار برو</th>
                    <th className="p-6 text-sm font-bold text-gray-900 w-1/5 text-center">المؤسسات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {features.map((section, idx) => (
                    <React.Fragment key={idx}>
                      {/* Section Header */}
                      <tr className="bg-indigo-900">
                        <td colSpan={4} className="px-6 py-3 text-sm font-bold text-white">
                          {section.category}
                        </td>
                      </tr>
                      {/* Feature Rows */}
                      {section.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-700 border-l border-gray-100">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-center border-l border-gray-100">
                            {typeof item.free === 'boolean' ? (
                              item.free ? <Check className="mx-auto text-green-500" size={20} /> : <X className="mx-auto text-gray-300" size={20} />
                            ) : (
                              <span className="text-sm text-gray-600 font-bold">{item.free}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center bg-indigo-50/30 border-l border-gray-100">
                            {typeof item.pro === 'boolean' ? (
                              item.pro ? <Check className="mx-auto text-indigo-600" size={20} /> : <X className="mx-auto text-gray-300" size={20} />
                            ) : (
                              <span className="text-sm text-indigo-700 font-bold">{item.pro}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {typeof item.enterprise === 'boolean' ? (
                              item.enterprise ? <Check className="mx-auto text-green-500" size={20} /> : <X className="mx-auto text-gray-300" size={20} />
                            ) : (
                              <span className="text-sm text-gray-600 font-bold">{item.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}