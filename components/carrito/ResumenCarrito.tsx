import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatARS } from "@/lib/utils";

interface ResumenCarritoProps {
  totalItems: number;
  totalMonto: number;
  children?: React.ReactNode;
}

/** Molécula: resumen del total del carrito */
export function ResumenCarrito({ totalItems, totalMonto, children }: ResumenCarritoProps) {
  return (
    <Card className="border-border/50 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {totalItems} producto{totalItems !== 1 ? "s" : ""}
          </span>
          <span className="font-medium tabular-nums">{formatARS(totalMonto)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary text-lg tabular-nums">
            {formatARS(totalMonto)}
          </span>
        </div>
      </CardContent>
      {children && <CardFooter className="pt-0">{children}</CardFooter>}
    </Card>
  );
}
