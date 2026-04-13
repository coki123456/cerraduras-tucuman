import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database";

export async function listarProductos(soloActivos = true) {
  const supabase = await createClient();
  let query = supabase
    .from("productos")
    .select("*")
    .order("nombre");

  if (soloActivos) {
    query = query.eq("activo", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function obtenerProducto(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function crearProducto(
  payload: Omit<TablesInsert<"productos">, "created_by">,
  adminId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .insert({ ...payload, created_by: adminId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function actualizarProducto(
  id: string,
  payload: TablesUpdate<"productos">
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function desactivarProducto(id: string) {
  return actualizarProducto(id, { activo: false });
}
