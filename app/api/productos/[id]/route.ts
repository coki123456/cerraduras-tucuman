import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { schemaProducto } from "@/lib/validations/producto";
import type { Rol, TablesUpdate } from "@/types/database";

type Props = { params: Promise<{ id: string }> };
// Supabase-js no infiere correctamente el tipo de select("columna") con el genérico Database
// cuando hay discrepancias de tipos (string vs string | null). Se usa select("*") para evitarlo.
type PerfilRol = { role: Rol };

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: perfilRaw } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  const perfil = perfilRaw as PerfilRol | null;

  if (perfil?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json() as unknown;
  const validacion = schemaProducto.partial().safeParse(body);

  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0].message },
      { status: 400 }
    );
  }

  // Cast necesario: Zod infiere `string | undefined` para campos opcionales, pero el tipo
  // Update de Supabase espera `string | null | undefined`. Los valores son correctos.
  const payload = {
    ...validacion.data,
    updated_at: new Date().toISOString(),
  } as TablesUpdate<"productos">;

  const { data, error } = await supabase
    .from("productos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: perfilRaw } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  const perfil = perfilRaw as PerfilRol | null;

  if (perfil?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  // Obtener la imagen antes de desactivar para poder borrarla del storage
  const { data: producto } = await supabase
    .from("productos")
    .select("imagen_url")
    .eq("id", id)
    .single();

  // Soft delete: marcar inactivo
  const { error } = await supabase
    .from("productos")
    .update({ activo: false, updated_at: new Date().toISOString() } as TablesUpdate<"productos">)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Eliminar imagen del storage si existe
  if (producto?.imagen_url) {
    const marker = "/object/public/productos/";
    const url = new URL(producto.imagen_url);
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex !== -1) {
      const filePath = url.pathname.slice(markerIndex + marker.length);
      const { error: storageError } = await supabase.storage
        .from("productos")
        .remove([filePath]);

      if (storageError) {
        console.warn(`[DELETE producto] No se pudo borrar imagen "${filePath}":`, storageError.message);
      }
    }
  }

  return new Response(null, { status: 204 });
}
