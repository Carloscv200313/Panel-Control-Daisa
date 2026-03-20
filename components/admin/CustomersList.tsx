"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table } from "@/components/admin/Table";
import { fetchCustomers, getErrorMessage } from "@/lib/admin/data";
import { formatDate } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/client";

interface CustomerRow {
  id: string | number;
  name: string | null;
  phone_e164: string | null;
  last_seen_at: string | null;
}

export function CustomersList() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const data = await fetchCustomers(supabase);
      setCustomers(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar clientes."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Base comercial"
        title="Clientes"
        description="Consulta la base de clientes identificados y su último momento de actividad."
      />

      {loading ? <LoadingState label="Cargando clientes..." /> : null}
      {error && !loading ? <EmptyState title="No se pudo cargar clientes" description={error} /> : null}

      {!loading && !error ? (
        <Table
          rows={customers}
          rowKey={(row) => row.id}
          empty={<EmptyState title="Sin clientes" description="Todavía no hay registros en la tabla `customers`." />}
          columns={[
            {
              header: "Nombre",
              render: (customer) => (
                <span className="text-sm font-semibold text-[var(--color-paper)]">{customer.name ?? "Sin nombre"}</span>
              ),
            },
            {
              header: "Teléfono",
              render: (customer) => <span className="text-sm text-[var(--color-paper)]">{customer.phone_e164 ?? "-"}</span>,
            },
            {
              header: "Última actividad",
              render: (customer) => <span className="text-sm text-[var(--color-paper)]">{formatDate(customer.last_seen_at)}</span>,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
