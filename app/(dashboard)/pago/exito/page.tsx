// @ts-nocheck
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function PagoExitoso() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-400" />
      <div className="space-y-1">
        <h2 className="text-xl font-bold">¡Pago recibido!</h2>
        <p className="text-muted-foreground text-sm">
          Tu pedido fue confirmado. Recibirás un email con los detalles.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/compras">Ver mis compras</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/productos">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
