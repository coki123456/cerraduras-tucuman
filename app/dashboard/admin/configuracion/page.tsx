import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FormularioConfiguracionMercadopago } from "@/components/dashboard/admin/FormularioConfiguracionMercadopago";

export const metadata: Metadata = {
  title: "Configuración | Cerraduras Tucumán",
  description: "Configurá tus integración con MercadoPago",
};

export default async function PaginaConfiguracion() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar que sea admin
  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // @ts-ignore
  if (perfil?.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener configuración actual
  const { data: config } = await supabase
    .from("mercadopago_config")
    .select("access_token, public_key")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administrá las integraciones y configuraciones de tu tienda.
        </p>
      </div>

      <div className="grid gap-6">
        <FormularioConfiguracionMercadopago configActual={config || undefined} />
      </div>
    </div>
  );
}
