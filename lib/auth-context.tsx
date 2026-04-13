"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Rol } from "@/types/database";

interface SesionUsuario {
  user: User | null;
  role: Rol | null;
  nombreCompleto: string | null;
  cargando: boolean;
}

interface AuthContextValue extends SesionUsuario {
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [sesion, setSesion] = useState<SesionUsuario>({
    user: null,
    role: null,
    nombreCompleto: null,
    cargando: true,
  });

  useEffect(() => {
    async function cargarSesion() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil } = await supabase
          .from("users")
          .select("role, nombre_completo")
          .eq("id", user.id)
          .single();

        setSesion({
          user,
          role: ((perfil as any)?.role as Rol) ?? null,
          nombreCompleto: (perfil as any)?.nombre_completo ?? null,
          cargando: false,
        });
      } else {
        setSesion({ user: null, role: null, nombreCompleto: null, cargando: false });
      }
    }

    cargarSesion();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: perfil } = await supabase
            .from("users")
            .select("role, nombre_completo")
            .eq("id", session.user.id)
            .single();

          setSesion({
            user: session.user,
            role: ((perfil as any)?.role as Rol) ?? null,
            nombreCompleto: (perfil as any)?.nombre_completo ?? null,
            cargando: false,
          });
        } else {
          setSesion({ user: null, role: null, nombreCompleto: null, cargando: false });
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ ...sesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
