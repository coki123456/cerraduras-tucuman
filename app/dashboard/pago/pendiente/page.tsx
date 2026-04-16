// @ts-nocheck
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PagoPendiente() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <Clock className="h-16 w-16 text-amber-400" />
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Pago en proceso</h2>
        <p className="text-muted-foreground text-sm">
          Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/dashboard/compras">Ver mis compras</Link>
      </Button>
    </div>
  );
}
