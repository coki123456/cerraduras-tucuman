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
import { InsigniaEstadoVenta } from "@/components/ventas/InsigniaEstadoVenta";
import { formatARS, formatFechaHora } from "@/lib/utils";
import { ShoppingBag, Search, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PaginaVentasAdmin() {
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

  // Obtener todas las ventas con información del cliente
  const { data: ventas } = await supabase
    .from("ventas")
    .select(`
      *,
      users(nombre_completo, email, telefono)
    `)
    .order("fecha_compra", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas Totales</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de todos los pedidos y pagos del sistema.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Aquí podrían ir filtros rápidos en el futuro */}
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium border border-primary/20">
            Total ventas: {ventas?.length || 0}
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {!ventas || ventas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-20" />
              <p>No se encontraron ventas registradas.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px]">Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta) => (
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
                          {(venta.users as any)?.email}
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
                      <InsigniaEstadoVenta estado={venta.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/compras/${venta.id}`}>
                          Ver detalle
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
