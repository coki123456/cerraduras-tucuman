import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FormularioPerfil } from "@/components/dashboard/perfil/FormularioPerfil";
import { FormarioCambiarContrasena } from "@/components/dashboard/perfil/FormarioCambiarContrasena";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Cerraduras Tucumán",
  description: "Gestioná tu información personal y de contacto.",
};

export default async function PaginaPerfil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Actualizá tus datos de contacto, dirección y seguridad de tu cuenta.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <FormularioPerfil initialData={perfil} />
        <FormarioCambiarContrasena />
      </div>
    </div>
  );
}
