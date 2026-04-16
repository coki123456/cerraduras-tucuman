export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "cliente" | "empleado" | "admin";
          nombre_completo: string;
          telefono: string | null;
          empresa: string | null;
          created_at: string;
          updated_at: string;
          direccion: string | null;
          ciudad: string | null;
          activo: boolean;
        };
        Insert: {
          id: string;
          email: string;
          role?: "cliente" | "empleado" | "admin";
          nombre_completo: string;
          telefono?: string | null;
          empresa?: string | null;
          created_at?: string;
          updated_at?: string;
          direccion?: string | null;
          ciudad?: string | null;
          activo?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "cliente" | "empleado" | "admin";
          nombre_completo?: string;
          telefono?: string | null;
          empresa?: string | null;
          updated_at?: string;
          direccion?: string | null;
          ciudad?: string | null;
          activo?: boolean;
        };
      };
      productos: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          precio: number;
          stock: number;
          stock_minimo: number;
          categoria: "cerraduras" | "herrajes" | "accesorios";
          sku: string;
          imagen_url: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          precio: number;
          stock?: number;
          stock_minimo?: number;
          categoria: "cerraduras" | "herrajes" | "accesorios";
          sku: string;
          imagen_url?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          nombre?: string;
          descripcion?: string | null;
          precio?: number;
          stock?: number;
          stock_minimo?: number;
          categoria?: "cerraduras" | "herrajes" | "accesorios";
          sku?: string;
          imagen_url?: string | null;
          activo?: boolean;
          updated_at?: string;
        };
      };
      visitas: {
        Row: {
          id: string;
          fecha: string;
          hora_inicio: string;
          duracion_estimada: number | null;
          cliente_nombre: string;
          cliente_telefono: string;
          tipo_servicio: "instalacion" | "reparacion" | "consulta";
          estado: "pendiente" | "en_proceso" | "completada" | "cancelada";
          notas: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          fecha: string;
          hora_inicio: string;
          duracion_estimada?: number | null;
          cliente_nombre: string;
          cliente_telefono: string;
          tipo_servicio: "instalacion" | "reparacion" | "consulta";
          estado?: "pendiente" | "en_proceso" | "completada" | "cancelada";
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          fecha?: string;
          hora_inicio?: string;
          duracion_estimada?: number | null;
          cliente_nombre?: string;
          cliente_telefono?: string;
          tipo_servicio?: "instalacion" | "reparacion" | "consulta";
          estado?: "pendiente" | "en_proceso" | "completada" | "cancelada";
          notas?: string | null;
          updated_at?: string;
        };
      };
      ventas: {
        Row: {
          id: string;
          cliente_id: string | null;
          fecha_compra: string;
          total_monto: number;
          estado: "pendiente" | "confirmada" | "cancelada";
          metodo_pago: "mercadopago" | "efectivo";
          mercadopago_payment_id: string | null;
          mercadopago_preference_id: string | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id?: string | null;
          fecha_compra?: string;
          total_monto: number;
          estado?: "pendiente" | "confirmada" | "cancelada";
          metodo_pago?: "mercadopago" | "efectivo";
          mercadopago_payment_id?: string | null;
          mercadopago_preference_id?: string | null;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          estado?: "pendiente" | "confirmada" | "cancelada";
          mercadopago_payment_id?: string | null;
          mercadopago_preference_id?: string | null;
          notas?: string | null;
          updated_at?: string;
        };
      };
      venta_items: {
        Row: {
          id: string;
          venta_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          venta_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
          created_at?: string;
        };
        Update: never;
      };
      stock_alerts: {
        Row: {
          id: string;
          producto_id: string;
          stock_actual: number;
          stock_minimo: number;
          triggered_at: string;
          notified_to: string;
          leido: boolean;
          resuelto: boolean;
        };
        Insert: {
          id?: string;
          producto_id: string;
          stock_actual: number;
          stock_minimo: number;
          triggered_at?: string;
          notified_to: string;
          leido?: boolean;
          resuelto?: boolean;
        };
        Update: {
          leido?: boolean;
          resuelto?: boolean;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          updated_at?: string;
          updated_by: string;
        };
        Update: {
          value?: string;
          updated_at?: string;
          updated_by?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_stock: {
        Args: { p_producto_id: string; p_cantidad: number };
        Returns: number;
      };
      get_user_role: {
        Args: { user_id: string };
        Returns: "cliente" | "empleado" | "admin";
      };
    };
    Enums: {
      user_role: "cliente" | "empleado" | "admin";
      categoria_producto: "cerraduras" | "herrajes" | "accesorios";
      tipo_servicio: "instalacion" | "reparacion" | "consulta";
      estado_visita: "pendiente" | "en_proceso" | "completada" | "cancelada";
      estado_venta: "pendiente" | "confirmada" | "cancelada";
      metodo_pago: "mercadopago" | "efectivo";
    };
  };
};

// Tipos de conveniencia
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Usuario = Tables<"users">;
export type Producto = Tables<"productos">;
export type Visita = Tables<"visitas">;
export type Venta = Tables<"ventas">;
export type VentaItem = Tables<"venta_items">;
export type StockAlert = Tables<"stock_alerts">;
export type AdminSetting = Tables<"admin_settings">;

export type Rol = "cliente" | "empleado" | "admin";
export type CategoriaProducto = "cerraduras" | "herrajes" | "accesorios";
export type EstadoVisita =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "cancelada";
export type EstadoVenta = "pendiente" | "confirmada" | "cancelada";
