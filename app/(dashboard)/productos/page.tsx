import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaginaProductosCliente } from "./PaginaProductosCliente";

export const metadata = { title: "Productos" };

export default async function PaginaProductos() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const esAdmin = perfil?.role === "admin";

  // Obtener productos (admin ve todos, el resto solo activos)
  let query = supabase
    .from("productos")
    .select("*")
    .order("nombre");

  if (!esAdmin) {
    query = query.eq("activo", true);
  }

  const { data: productos } = await query;

  return (
    <PaginaProductosCliente
      productos={productos ?? []}
      esAdmin={esAdmin}
    />
  );
}
