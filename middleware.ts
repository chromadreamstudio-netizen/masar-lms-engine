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

  // إذا حاول المستخدم الدخول لمسار التعليم (/learn) وهو غير مسجل دخول، حوله لصفحة الدخول
  if (request.nextUrl.pathname.startsWith('/learn') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // إذا كان مسجل دخول وحاول فتح صفحة الدخول، حوله مباشرة للوحة التعليم
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/learn/demo', request.url))
  }

  return response
}

// تحديد المسارات التي يعمل عليها الـ Middleware
export const config = {
  matcher: ['/learn/:path*', '/login'],
}