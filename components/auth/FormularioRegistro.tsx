"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MensajeError } from "@/components/auth/MensajeError";
import { CheckCircle, Loader2 } from "lucide-react";

export function FormularioRegistro() {
  const supabase = createClient();

  const [form, setForm] = useState({
    nombre_completo: "",
    email: "",
    password: "",
    confirmar: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre_completo: form.nombre_completo.trim(),
          role: "cliente",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Ese email ya tiene una cuenta registrada."
          : "No pudimos crear tu cuenta. Intentá de nuevo."
      );
      setCargando(false);
      return;
    }

    setEnviado(true);
    setCargando(false);
  }

  if (enviado) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-primary" />
          <div>
            <p className="font-semibold text-lg">¡Cuenta creada!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Te enviamos un email de confirmación a{" "}
              <strong>{form.email}</strong>. Revisá tu bandeja de entrada.
            </p>
          </div>
          <Link href="/login" className="text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre completo</Label>
            <Input
              id="nombre_completo"
              name="nombre_completo"
              placeholder="Juan García"
              value={form.nombre_completo}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar contraseña</Label>
            <Input
              id="confirmar"
              name="confirmar"
              type="password"
              placeholder="Repetí tu contraseña"
              value={form.confirmar}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <MensajeError mensaje={error} />}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta…
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Iniciá sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
