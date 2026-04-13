import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertasStockCliente } from "./AlertasStockCliente";

export const metadata = { title: "Alertas de stock" };

export default async function PaginaAlertasStock() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") redirect("/dashboard");

  const { data: alertas } = await supabase
    .from("stock_alerts")
    .select(`
      *,
      productos (id, nombre, sku, categoria)
    `)
    .eq("resuelto", false)
    .order("triggered_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Alertas de stock</h2>
        <p className="text-sm text-muted-foreground">
          Productos que están por debajo del stock mínimo
        </p>
      </div>
      <AlertasStockCliente alertas={alertas ?? []} />
    </div>
  );
}
