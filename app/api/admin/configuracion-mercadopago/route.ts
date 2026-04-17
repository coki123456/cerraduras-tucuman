import { createClient } from "@/lib/supabase/server";
import { schemaMercadopagoConfig } from "@/lib/validations/mercadopago-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    const { data: perfil } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // @ts-ignore
    if (perfil?.role !== "admin") {
      return NextResponse.json(
        { error: "Solo los administradores pueden hacer esto" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validar datos
    const validationResult = schemaMercadopagoConfig.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar si ya existe configuración
    const { data: configExistente } = await supabase
      .from("mercadopago_config")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (configExistente) {
      // Actualizar
      const { error } = await (supabase
        .from("mercadopago_config") as any)
        .update({
          access_token: validationResult.data.access_token,
          public_key: validationResult.data.public_key ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json(
          { error: "Error al actualizar configuración" },
          { status: 500 }
        );
      }
    } else {
      // Crear
      const { error } = await (supabase
        .from("mercadopago_config") as any)
        .insert({
          user_id: user.id,
          access_token: validationResult.data.access_token,
          public_key: validationResult.data.public_key,
        });

      if (error) {
        return NextResponse.json(
          { error: "Error al guardar configuración" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Configuración guardada correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en POST /api/admin/configuracion-mercadopago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
