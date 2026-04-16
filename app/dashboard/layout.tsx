// @ts-nocheck
import { AuthProvider } from "@/lib/auth-context";
import { CarritoProvider } from "@/lib/carrito-context";
import { BarraLateral } from "@/components/layout/BarraLateral";
import { Encabezado } from "@/components/layout/Encabezado";

export default function LayoutDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CarritoProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar — oculto en mobile */}
          <div className="hidden lg:flex h-full">
            <BarraLateral />
          </div>

          {/* Contenido principal */}
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <Encabezado />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </CarritoProvider>
    </AuthProvider>
  );
}
