import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

// استدعاء خط Cairo الاحترافي ودعم الأوزان العريضة للأزرار والعناوين
const cairo = Cairo({ 
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"] 
});

export const metadata: Metadata = {
  title: "مسار MASAR | المنصة التعليمية المدعومة بالذكاء الاصطناعي",
  description: "المنصة التعليمية الأولى التي تدمج التشفير العسكري للمحتوى مع سحر الذكاء الاصطناعي التفاعلي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    mint: '#0c8c5e',
                    ink: '#08090a'
                  },
                  fontFamily: {
                    sans: ['Cairo', 'sans-serif']
                  }
                }
              }
            }
          `
        }} />
      </head>
      {/* تطبيق الخط على كامل المنصة */}
      <body className={`${cairo.className} bg-white text-black antialiased`}>
        {children}
      </body>
    </html>
  );
}