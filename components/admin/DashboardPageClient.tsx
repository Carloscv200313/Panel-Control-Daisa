"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { fetchDashboardData, getErrorMessage, type DashboardSnapshot } from "@/lib/admin/data";
import { formatNumber } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/client";

function StatCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.48)] uppercase">{label}</div>
      <div className="text-4xl font-semibold leading-none tracking-[-0.03em] text-[var(--color-paper)]">{value}</div>
      <div className="text-sm leading-6 text-[rgba(96,74,56,0.62)]">{caption}</div>
    </div>
  );
}

export function DashboardPageClient() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const data = await fetchDashboardData(supabase);
      setSnapshot(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar el dashboard."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const topProducts = useMemo(() => snapshot?.topProducts ?? [], [snapshot]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resumen"
        title="Resumen general"
        description="Vista rápida del catálogo, la demanda y el texto promocional activo en la vitrina comercial."
      />

      {loading ? <LoadingState label="Cargando métricas del negocio..." /> : null}
      {error ? (
        <EmptyState
          title="No se pudo cargar el resumen"
          description={error}
        />
      ) : null}

      {!loading && !error && snapshot ? (
        <>
          <section className="overflow-hidden rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.84)] shadow-[0_12px_32px_rgba(85,63,44,0.05)]">
            <div className="grid gap-0 md:grid-cols-3">
              <div className="border-b border-[rgba(96,74,56,0.08)] px-5 py-5 md:border-b-0 md:border-r">
                <StatCard
                  label="Productos activos"
                  value={formatNumber(snapshot.activeProducts)}
                  caption="Items visibles actualmente en el catálogo."
                />
              </div>
              <div className="border-b border-[rgba(96,74,56,0.08)] px-5 py-5 md:border-b-0 md:border-r">
                <StatCard
                  label="Pedidos últimos 7 días"
                  value={formatNumber(snapshot.ordersLast7Days)}
                  caption="Nuevos pedidos capturados en la última semana."
                />
              </div>
              <div className="px-5 py-5">
                <StatCard
                  label="Pedidos últimos 30 días"
                  value={formatNumber(snapshot.ordersLast30Days)}
                  caption="Tendencia agregada del último mes."
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.84)] shadow-[0_12px_32px_rgba(85,63,44,0.05)]">
            <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
              <section className="border-b border-[rgba(96,74,56,0.08)] px-6 py-6 xl:border-b-0 xl:border-r">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.48)] uppercase">
                      Top 5 productos
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-paper)]">
                      Más solicitados
                    </h2>
                  </div>
                  <StatusBadge tone="info">solicitudes</StatusBadge>
                </div>

                {topProducts.length > 0 ? (
                  <div className="mt-5 divide-y divide-[rgba(96,74,56,0.08)]">
                    {topProducts.map((product, index) => (
                      <div key={String(product.id)} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.42)] uppercase">
                            #{index + 1}
                          </div>
                          <div className="mt-1 text-base font-semibold text-[var(--color-paper)]">{product.name}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge tone={product.is_active ? "success" : "neutral"}>
                            {product.is_active ? "activo" : "inactivo"}
                          </StatusBadge>
                          <div className="text-sm font-semibold text-[var(--color-highlight-strong)]">
                            {formatNumber(product.requested_count)} solicitudes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 text-sm text-[rgba(96,74,56,0.62)]">
                    Todavía no hay productos con demanda registrada.
                  </div>
                )}
              </section>

              <section className="px-6 py-6">
                <div className="text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.48)] uppercase">
                  Promo actual
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-paper)]">
                  {snapshot.promoTitle ?? "Sin título promocional"}
                </h2>
                <p className="mt-4 text-sm leading-6 text-[rgba(96,74,56,0.68)]">
                  {snapshot.promoText ?? "Todavía no hay texto promocional configurado."}
                </p>
              </section>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
