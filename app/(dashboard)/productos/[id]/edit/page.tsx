// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { FormularioProducto } from "@/components/productos/FormularioProducto";

export const metadata = { title: "Editar producto" };

export default async function PaginaEditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") redirect("/dashboard/productos");

  const { data: producto } = await supabase
    .from("productos").select("*").eq("id", id).single();
  if (!producto) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Editar producto</h2>
        <p className="text-sm text-muted-foreground">{producto.nombre}</p>
      </div>
      <FormularioProducto modo="editar" producto={producto} />
    </div>
  );
}
