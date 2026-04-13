"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { truncar } from "@/lib/utils";

interface DatoProducto {
  nombre: string;
  cantidad: number;
  total: number;
}

interface GraficoProductosProps {
  datos: DatoProducto[];
}

const COLORES = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.45)",
  "hsl(var(--primary) / 0.3)",
];

export function GraficoProductos({ datos }: GraficoProductosProps) {
  if (!datos || datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={datos}
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="nombre"
          tickFormatter={(v) => truncar(v, 18)}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [value, "Unidades vendidas"]}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
        />
        <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
          {datos.map((_, index) => (
            <Cell key={index} fill={COLORES[index % COLORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
