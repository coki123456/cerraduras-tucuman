// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatARS, formatFechaHora } from "@/lib/utils";
import { ShoppingBag, Truck, MapPin, CheckCircle } from "lucide-react";
import { ActualizadorEstadoEntrega } from "@/components/admin/ActualizadorEstadoEntrega";

export const metadata = {
  title: "Ventas Pendientes de Entrega | Admin",
};

export default async function PaginaVentasPendientes() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar que sea admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Obtener ventas pendientes de entrega (pagadas pero no entregadas)
  const { data: ventasPendientes } = await supabase
    .from("ventas")
    .select(`
      *,
      users(nombre_completo, email, telefono),
      items_venta(
        cantidad,
        precio_unitario,
        productos(nombre, sku)
      )
    `)
    .in("estado", ["pagado", "preparando"])
    .order("fecha_compra", { ascending: false });

  // Obtener ventas entregadas/enviadas
  const { data: ventasEntregadas } = await supabase
    .from("ventas")
    .select(`
      *,
      users(nombre_completo, email, telefono)
    `)
    .in("estado", ["entregado", "enviado"])
    .order("fecha_entrega", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      {/* Sección de Ventas Pendientes */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Ventas Pendientes de Entrega
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona pedidos pagados que aún no han sido entregados
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Pendientes: {ventasPendientes?.length || 0}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Últimas actualizaciones
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!ventasPendientes || ventasPendientes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 opacity-20" />
                <p>No hay ventas pendientes de entrega.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[100px]">Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Tipo Entrega</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventasPendientes.map((venta) => (
                      <TableRow key={venta.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-mono text-xs font-bold uppercase">
                          #{venta.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {(venta.users as any)?.nombre_completo || "Usuario Desconocido"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(venta.users as any)?.telefono}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFechaHora(venta.fecha_compra)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatARS(venta.total_monto)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {venta.metodo_entrega === "local" ? (
                              <>
                                <MapPin className="h-4 w-4 text-orange-500" />
                                <span className="text-sm">Retirar al local</span>
                              </>
                            ) : (
                              <>
                                <Truck className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Envío</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ActualizadorEstadoEntrega
                            ventaId={venta.id}
                            metodoEntrega={venta.metodo_entrega}
                            clienteNombre={(venta.users as any)?.nombre_completo}
                            clienteEmail={(venta.users as any)?.email}
                            clienteTelefono={(venta.users as any)?.telefono}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección de Últimas Entregas/Envíos */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight">
            Últimas Entregas Registradas
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Últimos 10 pedidos entregados o enviados
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            {!ventasEntregadas || ventasEntregadas.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 opacity-20" />
                <p className="text-sm">Sin entregas registradas aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[100px]">Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Entrega</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventasEntregadas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-mono text-xs font-bold uppercase">
                          #{venta.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {(venta.users as any)?.nombre_completo}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatARS(venta.total_monto)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                            {venta.estado === "entregado" ? "✓ Entregado" : "📦 Enviado"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {venta.fecha_entrega ? formatFechaHora(venta.fecha_entrega) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
