// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { crearPreferenciaMP } from "@/lib/services/mercadopago.service";
import { z } from "zod";

const schemaCheckout = z.object({
  items: z.array(
    z.object({
      producto_id: z.string().uuid(),
      nombre: z.string(),
      cantidad: z.number().int().min(1),
      precio_unitario: z.number().positive(),
    })
  ).min(1, "El carrito está vacío"),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Debés iniciar sesión para comprar" }, { status: 401 });

  const { data: perfil } = await supabase
    .from("users").select("role, email, nombre_completo").eq("id", user.id).single();
  if (perfil?.role !== "cliente") {
    return NextResponse.json({ error: "Solo los clientes pueden comprar" }, { status: 403 });
  }

  const body = await request.json();
  const validacion = schemaCheckout.safeParse(body);
  if (!validacion.success) {
    return NextResponse.json({ error: validacion.error.errors[0].message }, { status: 400 });
  }

  const { items } = validacion.data;

  // Verificar stock disponible
  for (const item of items) {
    const { data: producto } = await supabase
      .from("productos")
      .select("stock, activo")
      .eq("id", item.producto_id)
      .single();

    if (!producto?.activo) {
      return NextResponse.json({ error: `El producto "${item.nombre}" ya no está disponible` }, { status: 400 });
    }
    if ((producto?.stock ?? 0) < item.cantidad) {
      return NextResponse.json(
        { error: `Stock insuficiente para "${item.nombre}". Disponible: ${producto?.stock}` },
        { status: 400 }
      );
    }
  }

  const totalMonto = items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);

  // Crear venta en estado pendiente
  const { data: venta, error: errorVenta } = await supabase
    .from("ventas")
    .insert({
      cliente_id: user.id,
      total_monto: totalMonto,
      estado: "pendiente",
      metodo_pago: "mercadopago",
    })
    .select()
    .single();

  if (errorVenta || !venta) {
    return NextResponse.json({ error: "No se pudo crear la venta" }, { status: 500 });
  }

  // Insertar items
  const { error: errorItems } = await supabase.from("venta_items").insert(
    items.map((i) => ({
      venta_id: venta.id,
      producto_id: i.producto_id,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      subtotal: i.precio_unitario * i.cantidad,
    }))
  );

  if (errorItems) {
    // Limpiar venta huérfana
    await supabase.from("ventas").delete().eq("id", venta.id);
    return NextResponse.json({ error: "Error al procesar el carrito" }, { status: 500 });
  }

  // Crear preference de MercadoPago
  try {
    const { preferenceId, initPoint } = await crearPreferenciaMP(
      items,
      venta.id,
      perfil.email
    );

    // Guardar preference_id en la venta
    await supabase
      .from("ventas")
      .update({ mercadopago_preference_id: preferenceId })
      .eq("id", venta.id);

    return NextResponse.json({ ventaId: venta.id, preferenceId, initPoint });
  } catch (err) {
    console.error("Error MercadoPago:", err);
    return NextResponse.json({ error: "Error al conectar con MercadoPago" }, { status: 500 });
  }
}
