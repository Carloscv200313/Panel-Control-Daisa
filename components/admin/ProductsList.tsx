"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonStyles } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Table } from "@/components/admin/Table";
import {
  fetchProducts,
  getErrorMessage,
  toggleProductActive,
  type ProductListItem,
} from "@/lib/admin/data";
import { formatDate, formatNumber } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/client";

export function ProductsList() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const data = await fetchProducts(supabase);
      setProducts(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar productos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, search]);

  async function handleToggle(product: ProductListItem) {
    try {
      setBusyId(product.id);
      const supabase = createClient();
      await toggleProductActive(supabase, product.id, !product.is_active);
      await loadProducts();
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, "No se pudo actualizar el estado del producto."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Gestiona nombre, tipo, estado y volumen de solicitudes de cada producto del catálogo."
        actions={
          <>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="min-w-[220px] rounded-2xl border border-[rgba(96,74,56,0.1)] bg-[rgba(255,250,244,0.72)] px-4 py-3 text-sm text-[var(--color-paper)] outline-none placeholder:text-[rgba(96,74,56,0.34)]"
            />
            <Link href="/admin/products/new" className={buttonStyles({ variant: "primary" })}>
              Nuevo producto
            </Link>
          </>
        }
      />

      {loading ? <LoadingState label="Cargando productos..." /> : null}
      {error && !loading ? <EmptyState title="No se pudo cargar productos" description={error} /> : null}

      {!loading && !error ? (
        <Table
          rows={filtered}
          rowKey={(row) => row.id}
          empty={
            <EmptyState
              title="Sin productos"
              description="Todavía no hay productos cargados en la tabla `products`."
              action={
                <Link href="/admin/products/new" className={buttonStyles({ variant: "primary" })}>
                  Crear primer producto
                </Link>
              }
            />
          }
          columns={[
            {
              header: "Producto",
              render: (product) => (
                <div>
                  <div className="text-lg font-semibold text-[var(--color-paper)]">{product.name}</div>
                  <div className="mt-1 text-xs text-[rgba(96,74,56,0.5)]">
                    Actualizado {formatDate(product.updated_at)}
                  </div>
                </div>
              ),
            },
              {
                header: "Tipo",
                render: (product) => (
                <StatusBadge tone="neutral">{product.product_type === "single" ? "individual" : "paquete"}</StatusBadge>
                ),
              },
            {
              header: "Estado",
              render: (product) => (
                <StatusBadge tone={product.is_active ? "success" : "danger"}>
                  {product.is_active ? "activo" : "inactivo"}
                </StatusBadge>
              ),
            },
            {
                header: "Solicitudes",
              render: (product) => (
                <span className="text-sm text-[var(--color-paper)]">{formatNumber(product.requested_count)}</span>
              ),
            },
            {
              header: "Acciones",
              render: (product) => (
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/products/${product.id}`} className={buttonStyles({ variant: "secondary" })}>
                    Editar
                  </Link>
                  <Button
                    type="button"
                    variant={product.is_active ? "danger" : "secondary"}
                    onClick={() => void handleToggle(product)}
                    disabled={busyId === product.id}
                  >
                    {busyId === product.id
                      ? "Procesando..."
                      : product.is_active
                        ? "Dar de baja"
                        : "Activar"}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
}
