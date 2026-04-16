// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, Pencil } from "lucide-react";
import { formatFechaHora, ETIQUETAS_CATEGORIA } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Alerta {
  id: string;
  stock_actual: number;
  stock_minimo: number;
  triggered_at: string;
  leido: boolean;
  productos: {
    id: string;
    nombre: string;
    sku: string;
    categoria: "cerraduras" | "herrajes" | "accesorios";
  } | null;
}

export function AlertasStockCliente({ alertas }: { alertas: Alerta[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [resolviendo, setResolviendo] = useState<string | null>(null);

  async function resolverAlerta(id: string) {
    setResolviendo(id);
    const { error } = await supabase
      .from("stock_alerts")
      .update({ resuelto: true, leido: true } as any)
      .eq("id", id);

    if (error) {
      toast.error("No se pudo resolver la alerta");
    } else {
      toast.success("Alerta marcada como resuelta");
      router.refresh();
    }
    setResolviendo(null);
  }

  if (alertas.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
          <p className="text-sm font-medium">¡Todo el stock está en orden!</p>
          <p className="text-xs">No hay alertas pendientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <Card
          key={alerta.id}
          className="border-destructive/30 bg-destructive/5"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    {alerta.productos?.nombre ?? "Producto eliminado"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {alerta.productos?.sku}
                    </span>
                    {alerta.productos?.categoria && (
                      <Badge variant="outline" className="text-xs py-0">
                        {ETIQUETAS_CATEGORIA[alerta.productos.categoria]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stock actual:{" "}
                    <span className="text-destructive font-bold">
                      {alerta.stock_actual}
                    </span>{" "}
                    / mínimo: {alerta.stock_minimo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFechaHora(alerta.triggered_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {alerta.productos && (
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={`/dashboard/productos/${alerta.productos.id}/edit`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Ajustar stock</span>
                    </Link>
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                      disabled={resolviendo === alerta.id}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="sr-only">Resolver</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Resolver alerta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esto marcará la alerta como resuelta. Asegurate de haber
                        ajustado el stock del producto.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => resolverAlerta(alerta.id)}>
                        Resolver
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
