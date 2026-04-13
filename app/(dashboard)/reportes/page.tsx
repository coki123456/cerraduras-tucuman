"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraficoVentas } from "@/components/reportes/GraficoVentas";
import { GraficoProductos } from "@/components/reportes/GraficoProductos";
import { TablaTopClientes } from "@/components/reportes/TablaTopClientes";
import { formatARS } from "@/lib/utils";
import { exportarPDF, exportarCSV } from "@/lib/export-pdf";
import { Download, FileText, Loader2 } from "lucide-react";

function primerDiaDelMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function PaginaReportes() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoy());
  const [cargando, setCargando] = useState(false);

  const [datosVentas, setDatosVentas] = useState<
    { semana: string; total: number; cantidad: number }[]
  >([]);
  const [datosProductos, setDatosProductos] = useState<
    { nombre: string; cantidad: number; total: number }[]
  >([]);
  const [datosClientes, setDatosClientes] = useState<
    {
      nombre_completo: string;
      email: string;
      total_compras: number;
      cantidad_ventas: number;
    }[]
  >([]);
  const [resumen, setResumen] = useState({
    totalVentas: 0,
    cantidadOrdenes: 0,
    ticketPromedio: 0,
  });

  const reporteRef = useRef<HTMLDivElement>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    const params = `desde=${desde}T00:00:00&hasta=${hasta}T23:59:59`;

    const [rVentas, rProductos, rClientes] = await Promise.all([
      fetch(`/api/reportes/ventas?${params}`).then((r) => r.json()),
      fetch(`/api/reportes/productos?${params}`).then((r) => r.json()),
      fetch(`/api/reportes/clientes?${params}`).then((r) => r.json()),
    ]);

    setDatosVentas(Array.isArray(rVentas) ? rVentas : []);
    setDatosProductos(Array.isArray(rProductos) ? rProductos : []);
    setDatosClientes(Array.isArray(rClientes) ? rClientes : []);

    if (Array.isArray(rVentas) && rVentas.length > 0) {
      const totalVentas = rVentas.reduce(
        (sum: number, d: { total: number }) => sum + (d.total ?? 0),
        0
      );
      const cantidadOrdenes = rVentas.reduce(
        (sum: number, d: { cantidad: number }) => sum + (d.cantidad ?? 0),
        0
      );
      setResumen({
        totalVentas,
        cantidadOrdenes,
        ticketPromedio: cantidadOrdenes > 0 ? totalVentas / cantidadOrdenes : 0,
      });
    } else {
      setResumen({ totalVentas: 0, cantidadOrdenes: 0, ticketPromedio: 0 });
    }

    setCargando(false);
  }, [desde, hasta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function handleExportarPDF() {
    await exportarPDF("contenido-reporte", "reporte-cerraduras-tucuman");
  }

  function handleExportarCSVProductos() {
    exportarCSV(datosProductos, "top-productos");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold">Reportes</h2>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarPDF}
            disabled={cargando}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div id="contenido-reporte" ref={reporteRef} className="space-y-6">
          {/* KPIs resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Total facturado
                </p>
                <p className="text-2xl font-bold text-primary tabular-nums">
                  {formatARS(resumen.totalVentas)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Órdenes confirmadas
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {resumen.cantidadOrdenes}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground mb-1">
                  Ticket promedio
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatARS(resumen.ticketPromedio)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="ventas">
            <TabsList>
              <TabsTrigger value="ventas">Ventas</TabsTrigger>
              <TabsTrigger value="productos">Top productos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>

            {/* Ventas */}
            <TabsContent value="ventas" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Tendencia de ventas por semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GraficoVentas datos={datosVentas} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Productos */}
            <TabsContent value="productos" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">
                    Top 5 productos más vendidos
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportarCSVProductos}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <GraficoProductos datos={datosProductos} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clientes */}
            <TabsContent value="clientes" className="mt-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Clientes con más compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TablaTopClientes datos={datosClientes} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
