"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

export function FormarioCambiarContrasena() {
  const supabase = createClient();
  const [guardando, setGuardando] = useState(false);
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenanueva, setContrasenanueva] = useState("");
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!contrasenaActual || !contrasenanueva || !contrasenaConfirmar) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (contrasenanueva !== contrasenaConfirmar) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (contrasenanueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setGuardando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: contrasenanueva,
      });

      if (error) {
        toast.error(error.message || "Error al cambiar la contraseña");
      } else {
        toast.success("Contraseña actualizada correctamente");
        setContrasenaActual("");
        setContrasenanueva("");
        setContrasenaConfirmar("");
      }
    } catch (err) {
      toast.error("Error inesperado al cambiar la contraseña");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card className="max-w-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Cambiar Contraseña
        </CardTitle>
        <CardDescription>
          Actualiza tu contraseña para mantener tu cuenta segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contrasena-actual">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="contrasena-actual"
                type={mostrarActual ? "text" : "password"}
                placeholder="Ingresa tu contraseña actual"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarActual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena-nueva">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="contrasena-nueva"
                type={mostrarNueva ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={contrasenanueva}
                onChange={(e) => setContrasenanueva(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena-confirmar">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="contrasena-confirmar"
                type={mostrarConfirmar ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={contrasenaConfirmar}
                onChange={(e) => setContrasenaConfirmar(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={guardando} className="w-full sm:w-auto">
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiar…
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
