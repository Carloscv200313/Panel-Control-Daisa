"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { useFeedbackModal } from "@/components/admin/FeedbackModalProvider";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table } from "@/components/admin/Table";
import { DEFAULT_PRICE_TIERS } from "@/lib/admin/constants";
import { fetchPriceTiers, getErrorMessage, savePriceTiers } from "@/lib/admin/data";
import { formatCurrency } from "@/lib/admin/format";
import { priceTierSchema } from "@/lib/admin/schemas";
import { createClient } from "@/lib/supabase/client";

interface TierRow {
  id?: string | number;
  min_qty: number;
  unit_price: number;
}

export function PricingManager() {
  const feedback = useFeedbackModal();
  const [rows, setRows] = useState<TierRow[]>([]);
  const [removedIds, setRemovedIds] = useState<Array<string | number>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadPricing() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const data = await fetchPriceTiers(supabase);
      setRows(data.map((item) => ({ id: item.id, min_qty: item.min_qty, unit_price: item.unit_price })));
      setRemovedIds([]);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudieron cargar los tramos de precio."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPricing();
  }, []);

  function updateRow(index: number, patch: Partial<TierRow>) {
    setRows((current) => current.map((row, currentIndex) => (currentIndex === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    setRows((current) => {
      const target = current[index];
      if (target?.id) {
        setRemovedIds((previous) => [...previous, target.id!]);
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  function restoreDefaults() {
    setRows(DEFAULT_PRICE_TIERS.map((item) => ({ ...item })));
    setRemovedIds([]);
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    const parsedRows = rows.map((row) => priceTierSchema.safeParse(row));
    const invalid = parsedRows.find((result) => !result.success);
    if (invalid && !invalid.success) {
      const message = invalid.error.issues[0]?.message ?? "Hay filas inválidas en la configuración de precios.";
      setError(message);
      void feedback.showWarning({
        title: "Revisa los tramos",
        description: message,
      });
      return;
    }

    try {
      setSaving(true);
      feedback.showLoading({
        title: "Guardando precios",
        description: "Estamos actualizando la configuración comercial por volumen.",
      });
      const supabase = createClient();
      const data = await savePriceTiers(
        supabase,
        parsedRows.map((result) => result.success ? result.data : undefined).filter(Boolean) as TierRow[],
        removedIds,
      );
      setRows(data.map((item) => ({ id: item.id, min_qty: item.min_qty, unit_price: item.unit_price })));
      setRemovedIds([]);
      setSuccess("Precios actualizados correctamente.");
      feedback.close();
      await feedback.showSuccess({
        title: "Precios actualizados",
        description: "Los tramos comerciales se guardaron correctamente.",
      });
    } catch (saveError) {
      const message = getErrorMessage(saveError, "No se pudo guardar la configuración de precios.");
      setError(message);
      feedback.close();
      await feedback.showError({
        title: "No se pudo guardar",
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Reglas comerciales"
        title="Precios"
        description="Administra los tiers de precio unitario aplicados por cantidad."
        actions={<Button onClick={() => setRows((current) => [...current, { min_qty: 1, unit_price: 0 }])}>Agregar tier</Button>}
      />

      {loading ? <LoadingState label="Cargando precios..." /> : null}
      {error && !loading ? <EmptyState title="No se pudo cargar precios" description={error} /> : null}

      {!loading && !error ? (
        <div className="space-y-5">
          <Table
            rowKey={(row) => String(row.id ?? `${row.min_qty}-${row.unit_price}`)}
            rows={rows}
            empty={<EmptyState title="Sin tramos" description="Agrega el primer tramo o restaura la configuración base." />}
            columns={[
              {
                header: "Cantidad mínima",
                render: (row) => {
                  const index = rows.indexOf(row);
                  return (
                    <input
                      type="number"
                      min={1}
                      value={row.min_qty}
                      onChange={(event) => updateRow(index, { min_qty: Number(event.target.value) })}
                      className="w-full rounded-2xl border border-[var(--color-line)] bg-[rgba(252,245,237,0.65)] px-4 py-3 text-sm outline-none"
                    />
                  );
                },
              },
              {
                header: "Precio unitario",
                render: (row) => {
                  const index = rows.indexOf(row);
                  return (
                    <div className="space-y-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.unit_price}
                        onChange={(event) => updateRow(index, { unit_price: Number(event.target.value) })}
                        className="w-full rounded-2xl border border-[var(--color-line)] bg-[rgba(252,245,237,0.65)] px-4 py-3 text-sm outline-none"
                      />
                      <div className="text-xs text-[rgba(96,74,56,0.54)]">Vista previa: {formatCurrency(row.unit_price)}</div>
                    </div>
                  );
                },
              },
              {
                header: "Acciones",
                render: (row) => {
                  const index = rows.indexOf(row);
                  return (
                    <Button type="button" variant="danger" onClick={() => removeRow(index)}>
                      Eliminar
                    </Button>
                  );
                },
              },
            ]}
          />

          {success ? <div className="text-sm text-[var(--color-success)]">{success}</div> : null}
          {error ? <div className="text-sm text-[var(--color-danger)]">{error}</div> : null}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar precios"}
            </Button>
            <Button variant="secondary" onClick={restoreDefaults} disabled={saving}>
              Restaurar base 1/2/3/6
            </Button>
            <Button variant="ghost" onClick={() => void loadPricing()} disabled={saving}>
              Recargar desde DB
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
