import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Crear una respuesta mutable para poder setear cookies (refresh de sesión)
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propagar el refresh del token a la respuesta
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() verifica el JWT contra el servidor de Supabase (no solo localmente)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // El usuario no tiene sesión activa: redirigir a login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Solo proteger el dashboard; las API routes y páginas públicas quedan fuera
  matcher: ["/dashboard/:path*"],
};
