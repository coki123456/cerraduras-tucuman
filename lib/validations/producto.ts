import { z } from "zod";

export const schemaProducto = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  descripcion: z.string().max(500, "Máximo 500 caracteres").optional(),
  precio: z
    .number({ message: "Ingresá un precio válido" })
    .positive("El precio debe ser mayor a 0"),
  stock: z
    .number({ message: "Ingresá una cantidad válida" })
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  stock_minimo: z
    .number({ message: "Ingresá un mínimo válido" })
    .int()
    .min(0, "El mínimo no puede ser negativo")
    .default(5),
  categoria: z.enum(["cerraduras", "herrajes", "accesorios"], {
    message: "Seleccioná una categoría válida",
  }),
  sku: z
    .string()
    .min(3, "El SKU debe tener al menos 3 caracteres")
    .max(20, "El SKU no puede superar 20 caracteres")
    .regex(/^[A-Z0-9\-]+$/, "El SKU solo puede contener letras mayúsculas, números y guiones"),
  imagen_url: z.string().url("La URL de la imagen no es válida").optional().nullable(),
  activo: z.boolean().default(true),
});

export type ProductoInput = z.infer<typeof schemaProducto>;
