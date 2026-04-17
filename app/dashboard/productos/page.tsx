import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaginaProductosCliente } from "./PaginaProductosCliente";
import type { CategoriaProducto, Rol } from "@/types/database";

type PerfilRol = { role: Rol };

export const metadata = { title: "Productos" };

const CATEGORIAS_VALIDAS: CategoriaProducto[] = ["cerraduras", "herrajes", "accesorios"];

type Props = {
  searchParams: Promise<{ busqueda?: string; categoria?: string }>;
};

export default async function PaginaProductos({ searchParams }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfilRaw } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as PerfilRol | null;

  const esAdmin = perfil?.role === "admin";

  // Leer filtros de la URL
  const { busqueda, categoria: categoriaRaw } = await searchParams;
  const categoria = CATEGORIAS_VALIDAS.includes(categoriaRaw as CategoriaProducto)
    ? (categoriaRaw as CategoriaProducto)
    : undefined;

  // Construir query con filtros aplicados en Supabase (no en el cliente)
  let query = supabase.from("productos").select("*").order("nombre");

  if (!esAdmin) {
    query = query.eq("activo", true) as typeof query;
  }
  if (busqueda) {
    query = query.or(`nombre.ilike.%${busqueda}%,sku.ilike.%${busqueda}%`) as typeof query;
  }
  if (categoria) {
    query = query.eq("categoria", categoria) as typeof query;
  }

  const { data: productos } = await query;

  return (
    <PaginaProductosCliente
      productos={productos ?? []}
      esAdmin={esAdmin}
      busquedaActual={busqueda ?? ""}
      categoriaActual={categoriaRaw ?? "todas"}
    />
  );
}
