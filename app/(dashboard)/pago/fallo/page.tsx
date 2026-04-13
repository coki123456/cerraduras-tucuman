import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PagoFallido() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <XCircle className="h-16 w-16 text-destructive" />
      <div className="space-y-1">
        <h2 className="text-xl font-bold">El pago no se completó</h2>
        <p className="text-muted-foreground text-sm">
          El pago fue rechazado o cancelado. Podés intentarlo de nuevo.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/carrito">Volver al carrito</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/productos">Ver productos</Link>
        </Button>
      </div>
    </div>
  );
}
