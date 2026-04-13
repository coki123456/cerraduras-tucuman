"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { esquemaVisita, type EntradaVisita } from "@/lib/validations/visita";
import { ETIQUETAS_TIPO_SERVICIO } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Visita } from "@/types/database";

interface FormularioVisitaProps {
  visita?: Visita;
}

const TIPOS_SERVICIO = ["instalacion", "reparacion", "consulta"] as const;

export function FormularioVisita({ visita }: FormularioVisitaProps) {
  const router = useRouter();
  const esEdicion = !!visita;

  const form = useForm<EntradaVisita>({
    resolver: zodResolver(esquemaVisita),
    defaultValues: {
      fecha: visita?.fecha ?? "",
      hora_inicio: visita?.hora_inicio?.slice(0, 5) ?? "",
      duracion_estimada: visita?.duracion_estimada ?? 60,
      cliente_nombre: visita?.cliente_nombre ?? "",
      cliente_telefono: visita?.cliente_telefono ?? "",
      tipo_servicio: visita?.tipo_servicio ?? "instalacion",
      notas: visita?.notas ?? "",
    },
  });

  async function onSubmit(valores: EntradaVisita) {
    const url = esEdicion
      ? `/api/visitas/${visita!.id}`
      : "/api/visitas";
    const method = esEdicion ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? "Error al guardar la visita");
      return;
    }

    toast.success(esEdicion ? "Visita actualizada" : "Visita creada");
    router.push("/dashboard/visitas");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha */}
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hora */}
          <FormField
            control={form.control}
            name="hora_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duración */}
          <FormField
            control={form.control}
            name="duracion_estimada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración estimada (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" min={15} max={480} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo servicio */}
          <FormField
            control={form.control}
            name="tipo_servicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de servicio</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná el servicio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_SERVICIO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {ETIQUETAS_TIPO_SERVICIO[tipo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre cliente */}
          <FormField
            control={form.control}
            name="cliente_nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teléfono */}
          <FormField
            control={form.control}
            name="cliente_telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del cliente</FormLabel>
                <FormControl>
                  <Input placeholder="3814001234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notas */}
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Indicaciones especiales, dirección, referencias..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {esEdicion ? "Guardar cambios" : "Crear visita"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
