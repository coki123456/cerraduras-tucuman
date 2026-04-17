import { Metadata } from "next";
import { FormularioPerfil } from "@/components/dashboard/perfil/FormularioPerfil";
import { FormarioCambiarContrasena } from "@/components/dashboard/perfil/FormarioCambiarContrasena";

export const metadata: Metadata = {
  title: "Mi Perfil | Cerraduras Tucumán",
  description: "Gestioná tu información personal y de contacto.",
};

export default function PaginaPerfil() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Actualizá tus datos de contacto, dirección y seguridad de tu cuenta.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <FormularioPerfil />
        <FormarioCambiarContrasena />
      </div>
    </div>
  );
}
