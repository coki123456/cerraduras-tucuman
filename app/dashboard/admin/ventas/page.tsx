import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { InsigniaEstadoPago } from "@/components/ventas/InsigniaEstadoPago";
import { InsigniaEstadoCompra } from "@/components/ventas/InsigniaEstadoCompra";
import { formatARS, formatFechaHora } from "@/lib/utils";
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { VentaConCliente, Rol } from "@/types/database";

type PerfilRol = { role: Rol };

const LIMITE = 50;

export default async function PaginaVentasAdmin({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRaw } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileRaw as PerfilRol | null;

  if (profile?.role !== "admin") redirect("/dashboard");

  const { pagina: paginaStr } = await searchParams;
  const pagina = Math.max(1, parseInt(paginaStr ?? "1"));
  const desde = (pagina - 1) * LIMITE;

  const { data: ventasRaw, count } = await supabase
    .from("ventas")
    .select("*, users(nombre_completo, email, telefono)", { count: "exact" })
    .order("fecha_compra", { ascending: false })
    .range(desde, desde + LIMITE - 1);

  const ventas = (ventasRaw ?? []) as unknown as VentaConCliente[];
  const totalPaginas = Math.ceil((count ?? 0) / LIMITE);

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
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium border border-primary/20">
            Total ventas: {count ?? 0}
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {ventas.length === 0 ? (
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
                  <TableHead>Pago</TableHead>
                  <TableHead>Compra</TableHead>
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
                          {venta.users?.nombre_completo ?? "Usuario Desconocido"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {venta.users?.email}
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
                      <InsigniaEstadoPago estado={venta.estado_pago} />
                    </TableCell>
                    <TableCell>
                      <InsigniaEstadoCompra estado={venta.estado_compra} />
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagina} de {totalPaginas} · {count} ventas en total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild disabled={pagina <= 1}>
              <Link href={`?pagina=${pagina - 1}`}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={pagina >= totalPaginas}>
              <Link href={`?pagina=${pagina + 1}`}>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
