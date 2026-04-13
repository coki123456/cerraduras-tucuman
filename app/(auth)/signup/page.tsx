import type { Metadata } from "next";
import Image from "next/image";
import { FormularioRegistro } from "@/components/auth/FormularioRegistro";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function PaginaRegistro() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="Cerraduras Tucumán"
            width={100}
            height={100}
            className="rounded-xl"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registrate para comprar en Cerraduras Tucumán
            </p>
          </div>
        </div>

        {/* Formulario */}
        <FormularioRegistro />
      </div>
    </div>
  );
}
