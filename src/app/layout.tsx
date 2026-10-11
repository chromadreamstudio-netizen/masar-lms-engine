import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أكاديمية نماء الذكية | Global AI E-Learning Platform",
  description: "منصة تعليمية عالمية مدعومة بمحرك AI التفاعلي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        {children}
      </body>
    </html>
  );
}