"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface ItemCarrito {
  producto_id: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  sku: string;
}

interface CarritoContextValue {
  items: ItemCarrito[];
  totalItems: number;
  totalMonto: number;
  agregar: (item: Omit<ItemCarrito, "cantidad"> & { cantidad?: number }) => void;
  quitar: (producto_id: string) => void;
  actualizarCantidad: (producto_id: string, cantidad: number) => void;
  vaciar: () => void;
}

const STORAGE_KEY = "cerraduras-carrito";

const CarritoContext = createContext<CarritoContextValue | null>(null);

function parsearItems(raw: string | null): ItemCarrito[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ItemCarrito[];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  // Cargar desde localStorage al montar
  useEffect(() => {
    setItems(parsearItems(localStorage.getItem(STORAGE_KEY)));
  }, []);

  // Persistir en localStorage al cambiar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sin-op
    }
  }, [items]);

  // Sincronización entre pestañas: escuchar cambios de localStorage en otras ventanas
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setItems(parsearItems(e.newValue));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const agregar = useCallback(
    (nuevoItem: Omit<ItemCarrito, "cantidad"> & { cantidad?: number }) => {
      const cantidad = nuevoItem.cantidad ?? 1;
      setItems((prev) => {
        const existente = prev.find((i) => i.producto_id === nuevoItem.producto_id);
        if (existente) {
          return prev.map((i) =>
            i.producto_id === nuevoItem.producto_id
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i
          );
        }
        return [...prev, { ...nuevoItem, cantidad }];
      });
    },
    []
  );

  const quitar = useCallback((producto_id: string) => {
    setItems((prev) => prev.filter((i) => i.producto_id !== producto_id));
  }, []);

  const actualizarCantidad = useCallback(
    (producto_id: string, cantidad: number) => {
      if (cantidad < 1) {
        quitar(producto_id);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.producto_id === producto_id ? { ...i, cantidad } : i
        )
      );
    },
    [quitar]
  );

  const vaciar = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalMonto = items.reduce(
    (acc, i) => acc + i.precio_unitario * i.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{ items, totalItems, totalMonto, agregar, quitar, actualizarCantidad, vaciar }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
