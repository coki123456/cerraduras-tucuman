import { createClient } from "@/lib/supabase/server";
import { TiendaLayout } from "@/components/tienda/TiendaLayout";
import { CabeceraPublica } from "@/components/tienda/CabeceraPublica";
import { CatalogoPublico } from "@/components/tienda/CatalogoPublico";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Cerraduras, herrajes y accesorios de seguridad — Cerraduras Tucumán",
};

export default async function PaginaTienda() {
  const supabase = await createClient();

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <TiendaLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <CabeceraPublica />

        <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
          <CatalogoPublico productos={productos ?? []} />
        </main>

        <footer className="border-t border-border/50 py-6">
          <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cerraduras Tucumán — Todos los
            derechos reservados
          </div>
        </footer>
      </div>
    </TiendaLayout>
  );
}
