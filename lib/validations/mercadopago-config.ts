import { z } from "zod";

export const schemaMercadopagoConfig = z.object({
  access_token: z
    .string()
    .min(10, "El token de acceso es obligatorio")
    .max(500, "El token no parece válido"),
  public_key: z
    .string()
    .optional()
    .nullable(),
});

export type MercadopagoConfigInput = z.infer<typeof schemaMercadopagoConfig>;
