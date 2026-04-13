"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MensajeError } from "@/components/auth/MensajeError";
import { Loader2 } from "lucide-react";

export function FormularioLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : "Ocurrió un error. Intentá de nuevo."
      );
      setCargando(false);
      return;
    }

    // Redirigir según rol: admin/empleado al panel, cliente a la tienda
    const { data: perfil } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    // @ts-ignore -- supabase-js infers perfil as never
    const rol = (perfil as any)?.role;
    if (rol === "admin" || rol === "empleado") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <Card className="border-border/50">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <MensajeError mensaje={error} />}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando…
              </>
            ) : (
              "Ingresar"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            ¿No tenés cuenta?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Registrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
