import type { ProductSize } from "@/lib/database.types";

export const PRODUCT_SIZES: ProductSize[] = ["S", "M", "L", "XL", "XXL"];

export const DEFAULT_PRICE_TIERS = [
  { min_qty: 1, unit_price: 27 },
  { min_qty: 2, unit_price: 25 },
  { min_qty: 3, unit_price: 24 },
  { min_qty: 6, unit_price: 23 },
] as const;

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Resumen general" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/pricing", label: "Precios" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/settings", label: "Configuración" },
] as const;
