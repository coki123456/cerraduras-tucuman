"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface SelectorImagenProps {
  urlActual?: string | null;
  onImagenSeleccionada: (url: string | null) => void;
}

export function SelectorImagen({ urlActual, onImagenSeleccionada }: SelectorImagenProps) {
  const [cargando, setCargando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(urlActual || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 2MB");
      return;
    }

    try {
      setCargando(true);

      // Generar un nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("productos")
        .getPublicUrl(filePath);

      setVistaPrevia(publicUrl);
      onImagenSeleccionada(publicUrl);
      toast.success("Imagen subida correctamente");
    } catch (error: any) {
      console.error("Error subiendo imagen:", error);
      toast.error(`Error: ${error.message || "No se pudo subir la imagen"}`);
    } finally {
      setCargando(false);
    }
  };

  const eliminarImagen = () => {
    setVistaPrevia(null);
    onImagenSeleccionada(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label>Imagen del producto</Label>
      
      <div className="flex flex-col items-center gap-4">
        {vistaPrevia ? (
          <div className="relative group w-full max-w-[300px] aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted/30">
            <Image
              src={vistaPrevia}
              alt="Vista previa del producto"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={eliminarImagen}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[300px] aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/10"
          >
            {cargando ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div className="text-center px-4">
                  <p className="text-sm font-medium">Hacé clic para subir</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG o WebP (Máx. 2MB)</p>
                </div>
              </>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={cargando}
        />
        
        {vistaPrevia && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={cargando}
          >
            {cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
            Cambiar imagen
          </Button>
        )}
      </div>
    </div>
  );
}
