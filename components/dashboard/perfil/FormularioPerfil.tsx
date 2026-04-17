"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Phone, MapPin, Building2, Globe } from "lucide-react";
import type { Usuario } from "@/types/database";

export function FormularioPerfil() {
  const supabase = createClient();
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setPerfil(data);
      }
      setCargando(false);
    }
    cargarPerfil();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!perfil) return;

    setGuardando(true);
    const { error } = await (supabase
      .from("users") as any)
      .update({
        nombre_completo: perfil.nombre_completo,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
        ciudad: perfil.ciudad,
        empresa: perfil.empresa,
      })
      .eq("id", perfil.id);

    setGuardando(false);

    if (error) {
      toast.error("Error al actualizar el perfil");
    } else {
      toast.success("Perfil actualizado correctamente");
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mi Información Personal
        </CardTitle>
        <CardDescription>
          Mantené tus datos actualizados para facilitar la coordinación de visitas técnicas y entregas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre_completo"
                  className="pl-9"
                  value={perfil?.nombre_completo || ""}
                  onChange={(e) => setPerfil(p => p ? { ...p, nombre_completo: e.target.value } : null)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  className="pl-9"
                  placeholder="+54 381 000-0000"
                  value={perfil?.telefono || ""}
                  onChange={(e) => setPerfil(p => p ? { ...p, telefono: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección de Instalación / Entrega</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="direccion"
                  className="pl-9"
                  placeholder="Calle, Número, Piso/Dpto"
                  value={perfil?.direccion || ""}
                  onChange={(e) => setPerfil(p => p ? { ...p, direccion: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ciudad"
                  className="pl-9"
                  placeholder="San Miguel de Tucumán"
                  value={perfil?.ciudad || ""}
                  onChange={(e) => setPerfil(p => p ? { ...p, ciudad: e.target.value } : null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa (Opcional)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="empresa"
                  className="pl-9"
                  value={perfil?.empresa || ""}
                  onChange={(e) => setPerfil(p => p ? { ...p, empresa: e.target.value } : null)}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={guardando} className="w-full sm:w-auto">
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
