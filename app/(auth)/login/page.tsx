import type { Metadata } from "next";
import Image from "next/image";
import { FormularioLogin } from "@/components/auth/FormularioLogin";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function PaginaLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="Cerraduras Tucumán"
            width={120}
            height={120}
            className="rounded-xl"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresá a tu cuenta de Cerraduras Tucumán
            </p>
          </div>
        </div>

        {/* Formulario */}
        <FormularioLogin />
      </div>
    </div>
  );
}
