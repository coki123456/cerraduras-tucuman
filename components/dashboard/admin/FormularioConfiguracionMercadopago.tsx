"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { schemaMercadopagoConfig, type MercadopagoConfigInput } from "@/lib/validations/mercadopago-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MensajeError } from "@/components/auth/MensajeError";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormularioConfiguracionMercadopagoProps {
  configActual?: MercadopagoConfigInput;
}

export function FormularioConfiguracionMercadopago({
  configActual,
}: FormularioConfiguracionMercadopagoProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MercadopagoConfigInput>({
    resolver: zodResolver(schemaMercadopagoConfig),
    defaultValues: configActual || {
      access_token: "",
      public_key: "",
    },
  });

  const onSubmit: SubmitHandler<MercadopagoConfigInput> = async (data) => {
    setErrorServidor(null);
    setGuardado(false);

    try {
      const res = await fetch("/api/admin/configuracion-mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error al guardar la configuración");
      }

      toast.success("Configuración de MercadoPago guardada correctamente");
      setGuardado(true);
    } catch (error: any) {
      setErrorServidor(error.message || "Error al guardar la configuración");
      toast.error(error.message || "Error al guardar");
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Configuración de MercadoPago</CardTitle>
        <CardDescription>
          Configura tus credenciales de MercadoPago para que los pagos se acrediten a tu cuenta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Alerta informativa */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>¿Dónde encontro mis credenciales?</strong>
              <br />
              Ingresá a tu cuenta de MercadoPago → Configuración → Credenciales → Obtén tu Access Token
            </AlertDescription>
          </Alert>

          {/* Token de acceso */}
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token *</Label>
            <div className="relative">
              <Input
                id="access_token"
                type={mostrarToken ? "text" : "password"}
                placeholder="APP_USR-1234567890..."
                {...register("access_token")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarToken(!mostrarToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {mostrarToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.access_token && (
              <p className="text-xs text-destructive">{errors.access_token.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Tu token es encriptado y no se comparte. Solo se usa para procesar pagos a tu cuenta.
            </p>
          </div>

          {/* Public Key (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="public_key">Public Key (Opcional)</Label>
            <Input
              id="public_key"
              type="text"
              placeholder="APP_USR-..."
              {...register("public_key")}
            />
            <p className="text-xs text-muted-foreground">
              Se usa para la integración en cliente. Puede dejarse en blanco.
            </p>
          </div>

          {errorServidor && <MensajeError mensaje={errorServidor} />}

          {guardado && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                ✓ Configuración guardada exitosamente. Los nuevos pagos irán a tu cuenta.
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar configuración"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
