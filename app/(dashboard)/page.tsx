// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TarjetaKpi } from "@/components/dashboard/TarjetaKpi";
import {
  ShoppingBag,
  AlertTriangle,
  CalendarCheck,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import { formatARS } from "@/lib/utils";

export default async function PaginaDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users")
    .select("role, nombre_completo")
    .eq("id", user.id)
    .single();

  const rol = perfil?.role ?? "cliente";
  const nombre = perfil?.nombre_completo ?? "";

  // ── Datos según el rol ──────────────────────────────────────
  let totalVentasMes = 0;
  let cantidadAlertasStock = 0;
  let visitasHoy = 0;
  let clientesNuevosMes = 0;
  let misComprasMes = 0;
  let misVisitasHoy = 0;
  let productosActivos = 0;

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const hoyStr = hoy.toISOString().split("T")[0];

  if (rol === "admin") {
    const [ventasRes, alertasRes, visitasRes, clientesRes, productosRes] =
      await Promise.all([
        supabase
          .from("ventas")
          .select("total_monto")
          .eq("estado", "confirmada")
          .gte("fecha_compra", inicioMes),
        supabase
          .from("stock_alerts")
          .select("id", { count: "exact" })
          .eq("resuelto", false),
        supabase
          .from("visitas")
          .select("id", { count: "exact" })
          .eq("fecha", hoyStr),
        supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "cliente")
          .gte("created_at", inicioMes),
        supabase
          .from("productos")
          .select("id", { count: "exact" })
          .eq("activo", true),
      ]);

    totalVentasMes =
      ventasRes.data?.reduce((acc, v) => acc + (v.total_monto ?? 0), 0) ?? 0;
    cantidadAlertasStock = alertasRes.count ?? 0;
    visitasHoy = visitasRes.count ?? 0;
    clientesNuevosMes = clientesRes.count ?? 0;
    productosActivos = productosRes.count ?? 0;
  } else if (rol === "empleado") {
    const visitasRes = await supabase
      .from("visitas")
      .select("id", { count: "exact" })
      .eq("created_by", user.id)
      .eq("fecha", hoyStr);

    misVisitasHoy = visitasRes.count ?? 0;

    const { count: pendientes } = await supabase
      .from("visitas")
      .select("id", { count: "exact" })
      .eq("created_by", user.id)
      .eq("estado", "pendiente");

    visitasHoy = pendientes ?? 0;
  } else {
    // cliente
    const comprasRes = await supabase
      .from("ventas")
      .select("total_monto")
      .eq("cliente_id", user.id)
      .eq("estado", "confirmada")
      .gte("fecha_compra", inicioMes);

    misComprasMes =
      comprasRes.data?.reduce((acc, v) => acc + (v.total_monto ?? 0), 0) ?? 0;
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h2 className="text-xl font-bold">
          Hola, {nombre.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Intl.DateTimeFormat("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(hoy)}
        </p>
      </div>

      {/* KPIs según rol */}
      {rol === "admin" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <TarjetaKpi
            titulo="Ventas del mes"
            valor={formatARS(totalVentasMes)}
            descripcion="Ventas confirmadas"
            icono={TrendingUp}
            variante="amarillo"
          />
          <TarjetaKpi
            titulo="Alertas de stock"
            valor={cantidadAlertasStock}
            descripcion={cantidadAlertasStock === 0 ? "Todo ok" : "Sin resolver"}
            icono={AlertTriangle}
            variante={cantidadAlertasStock > 0 ? "rojo" : "verde"}
          />
          <TarjetaKpi
            titulo="Visitas hoy"
            valor={visitasHoy}
            icono={CalendarCheck}
            variante="default"
          />
          <TarjetaKpi
            titulo="Clientes nuevos"
            valor={clientesNuevosMes}
            descripcion="Este mes"
            icono={Users}
            variante="verde"
          />
          <TarjetaKpi
            titulo="Productos activos"
            valor={productosActivos}
            icono={Package}
            variante="default"
          />
        </div>
      )}

      {rol === "empleado" && (
        <div className="grid grid-cols-2 gap-4">
          <TarjetaKpi
            titulo="Visitas hoy"
            valor={misVisitasHoy}
            descripcion="Tus visitas programadas"
            icono={CalendarCheck}
            variante="amarillo"
          />
          <TarjetaKpi
            titulo="Pendientes"
            valor={visitasHoy}
            descripcion="Por confirmar"
            icono={AlertTriangle}
            variante={visitasHoy > 0 ? "rojo" : "verde"}
          />
        </div>
      )}

      {rol === "cliente" && (
        <div className="grid grid-cols-2 gap-4">
          <TarjetaKpi
            titulo="Compras del mes"
            valor={formatARS(misComprasMes)}
            descripcion="Total gastado"
            icono={ShoppingBag}
            variante="amarillo"
          />
          <TarjetaKpi
            titulo="Ver catálogo"
            valor="→ Productos"
            descripcion="Cerraduras y herrajes"
            icono={Package}
            variante="default"
          />
        </div>
      )}
    </div>
  );
}
