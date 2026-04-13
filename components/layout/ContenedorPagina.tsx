import { cn } from "@/lib/utils";

interface ContenedorPaginaProps {
  children: React.ReactNode;
  className?: string;
}

/** Átomo: wrapper de contenido de página con padding estándar */
export function ContenedorPagina({ children, className }: ContenedorPaginaProps) {
  return (
    <main className={cn("flex-1 overflow-y-auto p-4 lg:p-6", className)}>
      {children}
    </main>
  );
}
