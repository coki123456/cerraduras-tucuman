import { formatARS } from "@/lib/utils";

interface DatoCliente {
  nombre_completo: string;
  email: string;
  total_compras: number;
  cantidad_ventas: number;
}

interface TablaTopClientesProps {
  datos: DatoCliente[];
}

export function TablaTopClientes({ datos }: TablaTopClientesProps) {
  if (!datos || datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-2 px-3 font-medium text-muted-foreground">
              Cliente
            </th>
            <th className="text-right py-2 px-3 font-medium text-muted-foreground">
              Órdenes
            </th>
            <th className="text-right py-2 px-3 font-medium text-muted-foreground">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {datos.map((cliente, i) => (
            <tr
              key={i}
              className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td className="py-2.5 px-3">
                <p className="font-medium">{cliente.nombre_completo}</p>
                <p className="text-xs text-muted-foreground">{cliente.email}</p>
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {cliente.cantidad_ventas}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums font-bold text-primary">
                {formatARS(cliente.total_compras)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
