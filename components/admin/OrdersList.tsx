"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table } from "@/components/admin/Table";
import {
  fetchOrderItems,
  fetchOrders,
  getErrorMessage,
  type OrderItemDetail,
  type OrderListItem,
} from "@/lib/admin/data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/client";

export function OrdersList() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);
  const [detailItems, setDetailItems] = useState<OrderItemDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const data = await fetchOrders(supabase);
      setOrders(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar pedidos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function openDetail(order: OrderListItem) {
    try {
      setSelectedOrder(order);
      setDetailLoading(true);
      setDetailError(null);
      const supabase = createClient();
      const data = await fetchOrderItems(supabase, order.id);
      setDetailItems(data);
    } catch (loadError) {
      setDetailError(getErrorMessage(loadError, "No se pudo cargar el detalle del pedido."));
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operación"
        title="Pedidos"
        description="Consulta los pedidos capturados con total estimado, precio aplicado y detalle por ítems."
      />

      {loading ? <LoadingState label="Cargando pedidos..." /> : null}
      {error && !loading ? <EmptyState title="No se pudo cargar pedidos" description={error} /> : null}

      {!loading && !error ? (
        <Table
          rows={orders}
          rowKey={(row) => row.id}
          empty={<EmptyState title="Sin pedidos" description="Todavía no hay registros en la tabla `orders`." />}
          columns={[
            {
              header: "Fecha",
              render: (order) => <span className="text-sm text-[var(--color-paper)]">{formatDate(order.created_at)}</span>,
            },
            {
              header: "Cliente",
              render: (order) => (
                <div>
                  <div className="text-sm font-semibold text-[var(--color-paper)]">{order.customer_name ?? "Sin nombre"}</div>
                  <div className="mt-1 text-xs text-[rgba(96,74,56,0.52)]">{order.customer_phone ?? "Sin teléfono"}</div>
                </div>
              ),
            },
            {
              header: "Cantidades",
              render: (order) => <span className="text-sm text-[var(--color-paper)]">{formatNumber(order.total_qty)}</span>,
            },
            {
              header: "Precio aplicado",
              render: (order) => <span className="text-sm text-[var(--color-paper)]">{formatCurrency(order.unit_price_applied)}</span>,
            },
            {
              header: "Monto estimado",
              render: (order) => <span className="text-sm text-[var(--color-paper)]">{formatCurrency(order.total_amount_estimate)}</span>,
            },
            {
              header: "Acciones",
              render: (order) => (
                <Button type="button" variant="secondary" onClick={() => void openDetail(order)}>
                  Ver detalle
                </Button>
              ),
            },
          ]}
        />
      ) : null}

      <Modal
        title={selectedOrder ? `Pedido #${selectedOrder.id}` : "Detalle pedido"}
        open={Boolean(selectedOrder)}
        onClose={() => {
          setSelectedOrder(null);
          setDetailItems([]);
          setDetailError(null);
        }}
      >
        {selectedOrder ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.55)] p-4">
                <div className="text-xs font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.5)] uppercase">Cliente</div>
                <div className="mt-2 text-sm text-[var(--color-paper)]">{selectedOrder.customer_name ?? "Sin nombre"}</div>
                <div className="mt-1 text-xs text-[rgba(96,74,56,0.56)]">{selectedOrder.customer_phone ?? "Sin teléfono"}</div>
              </div>
              <div className="rounded-[22px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.55)] p-4">
                <div className="text-xs font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.5)] uppercase">Cantidad total</div>
                <div className="mt-2 font-display text-3xl text-[var(--color-paper)]">{formatNumber(selectedOrder.total_qty)}</div>
              </div>
              <div className="rounded-[22px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.55)] p-4">
                <div className="text-xs font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.5)] uppercase">Monto estimado</div>
                <div className="mt-2 font-display text-3xl text-[var(--color-paper)]">
                  {formatCurrency(selectedOrder.total_amount_estimate)}
                </div>
              </div>
            </div>

            {detailLoading ? <LoadingState label="Cargando ítems del pedido..." /> : null}
            {detailError ? <div className="text-sm text-[var(--color-danger)]">{detailError}</div> : null}

            {!detailLoading && !detailError ? (
              <Table
                rows={detailItems}
                rowKey={(row) => row.id}
                empty={<EmptyState title="Sin ítems" description="Este pedido no tiene items relacionados." />}
                columns={[
                  {
                    header: "Producto",
                    render: (item) => <span className="text-sm font-semibold text-[var(--color-paper)]">{item.productName}</span>,
                  },
                  {
                    header: "Variante",
                    render: (item) => <span className="text-sm text-[var(--color-paper)]">{item.variantName}</span>,
                  },
                  {
                    header: "Talla",
                    render: (item) => <span className="text-sm text-[var(--color-paper)]">{item.size ?? "-"}</span>,
                  },
                  {
                    header: "Cantidad",
                    render: (item) => <span className="text-sm text-[var(--color-paper)]">{formatNumber(item.qty)}</span>,
                  },
                ]}
              />
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
