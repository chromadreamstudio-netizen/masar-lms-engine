import type { Metadata } from "next";
import "./globals.css";

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
        {/* إضافة Tailwind CDN لضمان عمل التصميم 100% متجاوزاً أي أخطاء في الـ Build */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    mint: '#0c8c5e',
                    ink: '#08090a'
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-white text-black antialiased font-sans">
        {children}
      </body>
    </html>
  );
}