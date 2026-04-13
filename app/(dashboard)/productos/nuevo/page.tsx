import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FormularioProducto } from "@/components/productos/FormularioProducto";

export const metadata = { title: "Nuevo producto" };

export default async function PaginaNuevoProducto() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users").select("role").eq("id", user.id).single();

  if (perfil?.role !== "admin") redirect("/dashboard/productos");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Nuevo producto</h2>
        <p className="text-sm text-muted-foreground">Completá los datos del nuevo producto</p>
      </div>
      <FormularioProducto modo="crear" />
    </div>
  );
}
