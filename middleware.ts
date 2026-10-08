import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. حماية مسارات التعليم ولوحة التحكم (إذا لم يكن مسجلاً، اذهب لصفحة الدخول)
  if ((request.nextUrl.pathname.startsWith('/learn') || request.nextUrl.pathname.startsWith('/dashboard')) && !user) {
    return NextResponse.redirect(new URL('/login?redirect=' + request.nextUrl.pathname, request.url))
  }

  // 2. إذا كان مسجلاً للدخول وحاول فتح صفحة الدخول، حوله مباشرة للوحة التحكم
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// تحديد المسارات التي يعمل عليها الـ Middleware (تمت إضافة لوحة التحكم)
export const config = {
  matcher: ['/learn/:path*', '/dashboard/:path*', '/login'],
}