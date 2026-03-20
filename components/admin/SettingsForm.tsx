"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/admin/Button";
import { CatalogSettings } from "@/components/admin/CatalogSettings";
import { EmptyState } from "@/components/admin/EmptyState";
import { useFeedbackModal } from "@/components/admin/FeedbackModalProvider";
import { Field, FormActions, FormCard, Input, Textarea } from "@/components/admin/Form";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Uploader, type UploadedAsset } from "@/components/admin/Uploader";
import { fetchSettings, getErrorMessage, saveSettings } from "@/lib/admin/data";
import { settingsSchema } from "@/lib/admin/schemas";
import { createClient } from "@/lib/supabase/client";

interface SettingsState {
  business_name: string;
  whatsapp_number_e164: string;
  whatsapp_message_template: string;
  promo_title: string;
  promo_text: string;
  admin_logo: UploadedAsset | null;
  promo_image: UploadedAsset | null;
}

const initialState: SettingsState = {
  business_name: "",
  whatsapp_number_e164: "",
  whatsapp_message_template: "",
  promo_title: "",
  promo_text: "",
  admin_logo: null,
  promo_image: null,
};

const SETTINGS_TABS = [
  {
    id: "business",
    label: "Negocio",
    description: "Identidad principal, WhatsApp y logo del panel.",
  },
  {
    id: "promo",
    label: "Promoción",
    description: "Título, copy e imagen del bloque promocional.",
  },
  {
    id: "catalog",
    label: "Catálogo",
    description: "Marcas y categorías disponibles para productos.",
  },
] as const;

type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

export function SettingsForm() {
  const feedback = useFeedbackModal();
  const [form, setForm] = useState<SettingsState>(initialState);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const data = await fetchSettings(supabase);
      setForm({
        business_name: data.business_name ?? "",
        whatsapp_number_e164: data.whatsapp_number_e164 ?? "",
        whatsapp_message_template: data.whatsapp_message_template ?? "",
        promo_title: data.promo_title ?? "",
        promo_text: data.promo_text ?? "",
        admin_logo: data.admin_logo_url
          ? {
            url: data.admin_logo_url,
            publicId: "",
          }
          : null,
        promo_image: data.promo_image_url
          ? {
            url: data.promo_image_url,
            publicId: "",
          }
          : null,
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar settings."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setError(null);
    setSuccess(null);

    const parsed = settingsSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      );
      setFieldErrors(nextErrors);
      void feedback.showWarning({
        title: "Revisa la configuración",
        description: "Hay campos incompletos o inválidos antes de guardar los cambios.",
      });
      return;
    }

    try {
      setSaving(true);
      feedback.showLoading({
        title: "Guardando configuración",
        description: "Estamos actualizando la identidad del negocio y los contenidos del catálogo.",
      });
      const supabase = createClient();
      await saveSettings(supabase, parsed.data);
      setSuccess("Configuración actualizada correctamente.");
      await loadSettings();
      feedback.close();
      await feedback.showSuccess({
        title: "Configuración actualizada",
        description: "Los cambios ya están disponibles en el panel administrativo.",
      });
    } catch (saveError) {
      const message = getErrorMessage(saveError, "No se pudo guardar la configuración.");
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
        eyebrow="Contenido"
        title="Configuración"
        description="Edita la información principal del negocio, WhatsApp y la promoción visible en el catálogo."
      />

      {loading ? <LoadingState label="Cargando configuración..." /> : null}
      {error && !loading ? (
        <EmptyState title="No se pudo cargar la configuración" description={error} />
      ) : null}

      {!loading && !error ? (
        <div className="space-y-5">
          <div className="rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.84)] p-3 shadow-[0_12px_30px_rgba(85,63,44,0.05)]">
            <div className="flex flex-wrap gap-2">
              {SETTINGS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-4 py-3 text-left transition ${isActive
                        ? "bg-[rgba(242,166,90,0.14)] text-[var(--color-paper)] shadow-[inset_0_0_0_1px_rgba(242,166,90,0.24)]"
                        : "bg-transparent text-[rgba(96,74,56,0.68)] hover:bg-[rgba(96,74,56,0.05)] hover:text-[var(--color-paper)]"
                      }`}
                  >
                    <div className="text-sm font-semibold">{tab.label}</div>
                    <div className="mt-1 text-xs text-[inherit] opacity-75">{tab.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "catalog" ? (
            <CatalogSettings />
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {activeTab === "business" ? (
                <FormCard
                  title="Negocio y WhatsApp"
                  description="Estos datos se usan para el CTA comercial y la identidad principal del catálogo."
                >
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Field label="Nombre del negocio" error={fieldErrors.business_name}>
                      <Input
                        value={form.business_name}
                        onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))}
                        placeholder="Daiza"
                      />
                    </Field>
                    <Field
                      label="WhatsApp en formato E.164"
                      hint="Incluye prefijo internacional, por ejemplo +51999999999"
                      error={fieldErrors.whatsapp_number_e164}
                    >
                      <Input
                        value={form.whatsapp_number_e164}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, whatsapp_number_e164: event.target.value }))
                        }
                        placeholder="+51999999999"
                      />
                    </Field>
                  </div>

                  <Field
                    label="Plantilla de mensaje para WhatsApp"
                    error={fieldErrors.whatsapp_message_template}
                    hint="Sirve como base del mensaje que llega desde el catálogo."
                  >
                    <Textarea
                      rows={4}
                      value={form.whatsapp_message_template}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, whatsapp_message_template: event.target.value }))
                      }
                      placeholder="Hola, quiero cotizar estos modelos..."
                    />
                  </Field>

                  <Uploader
                    label="Logo del panel"
                    description="Se muestra en el bloque superior del sidebar administrativo."
                    folder="daisa/settings"
                    multiple={false}
                    maxFiles={1}
                    value={form.admin_logo ? [form.admin_logo] : []}
                    onChange={(images) => setForm((current) => ({ ...current, admin_logo: images[0] ?? null }))}
                  />
                </FormCard>
              ) : null}

              {activeTab === "promo" ? (
                <FormCard
                  title="Promoción"
                  description="Controla el bloque promocional principal del catálogo."
                >
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Field label="Título promocional" error={fieldErrors.promo_title}>
                      <Input
                        value={form.promo_title}
                        onChange={(event) => setForm((current) => ({ ...current, promo_title: event.target.value }))}
                        placeholder="Nueva promo semanal"
                      />
                    </Field>
                    <Field label="Texto promocional" error={fieldErrors.promo_text}>
                      <Textarea
                        rows={4}
                        value={form.promo_text}
                        onChange={(event) => setForm((current) => ({ ...current, promo_text: event.target.value }))}
                        placeholder="Llévate más por menos con las nuevas combinaciones..."
                      />
                    </Field>
                  </div>

                  <Uploader
                    label="Imagen promo"
                    description="La subida se firma vía `/api/cloudinary/sign`; no expone secretos en cliente."
                    folder="daisa/settings"
                    multiple={false}
                    maxFiles={1}
                    value={form.promo_image ? [form.promo_image] : []}
                    onChange={(images) => setForm((current) => ({ ...current, promo_image: images[0] ?? null }))}
                  />
                </FormCard>
              ) : null}

              {success ? <div className="text-sm text-[var(--color-success)]">{success}</div> : null}
              {error ? <div className="text-sm text-[var(--color-danger)]">{error}</div> : null}

              <FormActions>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar configuración"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => void loadSettings()} disabled={saving}>
                  Recargar
                </Button>
              </FormActions>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
