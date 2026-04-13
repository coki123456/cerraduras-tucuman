import { z } from "zod";

export const esquemaVisita = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora_inicio: z.string().min(1, "La hora es obligatoria"),
  duracion_estimada: z.coerce
    .number()
    .int()
    .min(15, "Mínimo 15 minutos")
    .max(480, "Máximo 8 horas"),
  cliente_nombre: z
    .string()
    .min(2, "El nombre del cliente es obligatorio")
    .max(100),
  cliente_telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(20),
  tipo_servicio: z.enum(["instalacion", "reparacion", "consulta"], {
    required_error: "Seleccioná el tipo de servicio",
  }),
  notas: z.string().max(500).optional(),
});

export type EntradaVisita = z.infer<typeof esquemaVisita>;
