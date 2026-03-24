"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonStyles } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  Field,
  FormActions,
  FormCard,
  Input,
  Select,
  Textarea,
  Toggle,
} from "@/components/admin/Form";
import { LoadingState } from "@/components/admin/LoadingState";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Uploader, type UploadedAsset } from "@/components/admin/Uploader";
import { PRODUCT_SIZES } from "@/lib/admin/constants";
import {
  fetchProductFormCatalogs,
  fetchProductDetail,
  getErrorMessage,
  saveProduct,
  type ProductFormCatalogs,
  type ProductVariantFormValue,
} from "@/lib/admin/data";
import type { DbId, ProductGender, ProductSize, ProductType } from "@/lib/database.types";
import { productSchema } from "@/lib/admin/schemas";
import { createClient } from "@/lib/supabase/client";

interface VariantDraft extends ProductVariantFormValue {
  key: string;
}

interface ProductFormState {
  brand_id: string;
  category_id: string;
  gender: ProductGender;
  name: string;
  description: string;
  product_type: ProductType;
  is_active: boolean;
  images: UploadedAsset[];
  singleSizes: ProductSize[];
  variants: VariantDraft[];
}

const initialState: ProductFormState = {
  brand_id: "",
  category_id: "",
  gender: "unisex",
  name: "",
  description: "",
  product_type: "single",
  is_active: true,
  images: [],
  singleSizes: [],
  variants: [],
};

function createVariantKey() {
  return Math.random().toString(36).slice(2, 10);
}

function toggleSize(current: ProductSize[], size: ProductSize) {
  return current.includes(size)
    ? current.filter((value) => value !== size)
    : [...current, size];
}

function SizeSelector({
  value,
  onChange,
}: {
  value: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRODUCT_SIZES.map((size) => {
        const active = value.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(toggleSize(value, size))}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-[rgba(242,166,90,0.48)] bg-[rgba(242,166,90,0.16)] text-[var(--color-highlight-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "border-[rgba(96,74,56,0.1)] bg-[rgba(255,250,244,0.66)] text-[rgba(96,74,56,0.76)] hover:border-[rgba(242,166,90,0.34)]"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

function mapVariantDraft(variant: ProductVariantFormValue): VariantDraft {
  return {
    ...variant,
    key: createVariantKey(),
  };
}

function formatGenderLabel(gender: ProductGender) {
  return (
    {
      male: "Varón",
      female: "Mujer",
      unisex: "Unisex",
    }[gender]
  );
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEditing = Boolean(productId);
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [catalogs, setCatalogs] = useState<ProductFormCatalogs>({ brands: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function loadEditor(targetId?: DbId) {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const [nextCatalogs, data] = await Promise.all([
        fetchProductFormCatalogs(supabase),
        targetId ? fetchProductDetail(supabase, targetId) : Promise.resolve(null),
      ]);

      setCatalogs(nextCatalogs);

      if (targetId && !data) {
        setForm(initialState);
        setError("El producto no existe o no se pudo leer.");
        return;
      }

      if (!data) {
        setForm(initialState);
        return;
      }

      const uniqueVariant = data.variants.find((variant) => variant.name === "Único") ?? data.variants[0];
      setForm({
        brand_id: data.product.brand_id ? String(data.product.brand_id) : "",
        category_id: data.product.category_id ? String(data.product.category_id) : "",
        gender: data.product.gender ?? "unisex",
        name: data.product.name,
        description: data.product.description ?? "",
        product_type: data.product.product_type,
        is_active: data.product.is_active,
        images: data.images,
        singleSizes: uniqueVariant?.sizes ?? [],
        variants: data.variants.map(mapVariantDraft),
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar el producto."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEditor(productId);
  }, [productId]);

  const visibleBundleVariants = useMemo(
    () => form.variants.filter((variant) => variant.name !== "Único" || form.product_type === "bundle"),
    [form.product_type, form.variants],
  );

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.key === key ? { ...variant, ...patch } : variant,
      ),
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          key: createVariantKey(),
          name: "",
          color: "",
          pattern: "",
          image: null,
          isActive: true,
          sizes: [],
        },
      ],
    }));
  }

  function removeVariant(key: string) {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((variant) => variant.key !== key),
    }));
  }

  function handleTypeChange(nextType: ProductType) {
    setForm((current) => ({
      ...current,
      product_type: nextType,
      variants:
        nextType === "bundle" && current.variants.length === 0
          ? [
              {
                key: createVariantKey(),
                name: "",
                color: "",
                pattern: "",
                image: null,
                isActive: true,
                sizes: [],
              },
            ]
          : current.variants,
    }));
  }

  function handleSuccessClose() {
    setSuccessModalOpen(false);
    router.replace("/admin/products");
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setError(null);
    setSuccess(null);
    setSuccessModalOpen(false);

    const parsed = productSchema.safeParse({
      ...form,
      variants: visibleBundleVariants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        color: variant.color,
        pattern: variant.pattern,
        image: variant.image,
        isActive: variant.isActive,
        sizes: variant.sizes,
      })),
    });

    if (!parsed.success) {
      const nextErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      );
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      await saveProduct(supabase, parsed.data, productId);
      setSuccess(
        isEditing
          ? "Los cambios del producto se guardaron correctamente."
          : "El producto se creó correctamente.",
      );
      setSuccessModalOpen(true);
    } catch (saveError) {
      setError(getErrorMessage(saveError, "No se pudo guardar el producto."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState label="Cargando editor de producto..." />;
  }

  if (error && isEditing) {
    return <EmptyState title="No se pudo cargar el producto" description={error} />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={isEditing ? "Editar" : "Nuevo"}
        title={isEditing ? form.name || "Editar producto" : "Nuevo producto"}
        description="Define información base, imágenes, tallas y variantes según el tipo de producto."
        actions={
          <Link
            href="/admin/products"
            className={buttonStyles({ variant: "secondary" })}
          >
            Volver al listado
          </Link>
        }
      />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormCard
          title="Información base"
          description="Campos principales de la ficha del producto en catálogo."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Género"
              error={fieldErrors.gender}
              hint="Identifica si el producto está orientado a varón, mujer o unisex."
            >
              <Select
                value={form.gender}
                onChange={(event) =>
                  setForm((current) => ({ ...current, gender: event.target.value as ProductGender }))
                }
              >
                <option value="male">Varón</option>
                <option value="female">Mujer</option>
                <option value="unisex">Unisex</option>
              </Select>
            </Field>
            <Field
              label="Marca"
              hint={catalogs.brands.length === 0 ? "No hay marcas disponibles todavía." : undefined}
              error={fieldErrors.brand_id}
            >
              <Select
                value={form.brand_id}
                onChange={(event) => setForm((current) => ({ ...current, brand_id: event.target.value }))}
              >
                <option value="">Sin marca</option>
                {catalogs.brands.map((brand) => (
                  <option key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Categoría"
              hint={catalogs.categories.length === 0 ? "No hay categorías disponibles todavía." : undefined}
              error={fieldErrors.category_id}
            >
              <Select
                value={form.category_id}
                onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
              >
                <option value="">Sin categoría</option>
                {catalogs.categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}{category.is_active ? "" : " (inactiva)"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nombre" error={fieldErrors.name}>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Boxer clásico pack x3"
              />
            </Field>
            <Field label="Tipo de producto">
              <Select
                value={form.product_type}
                onChange={(event) => handleTypeChange(event.target.value as ProductType)}
              >
                <option value="single">Individual</option>
                <option value="bundle">Paquete</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <Field label="Descripción" error={fieldErrors.description}>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe telas, beneficio comercial y composición visual del producto."
              />
            </Field>

            <div className="rounded-[18px] border border-[rgba(96,74,56,0.08)] bg-[rgba(248,239,229,0.38)] px-4 py-4">
              <div className="text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.5)] uppercase">
                Resumen
              </div>
              <div className="mt-3 space-y-3 text-sm text-[rgba(96,74,56,0.72)]">
                <div>
                  <div className="font-semibold text-[var(--color-paper)]">Género</div>
                  <div>{formatGenderLabel(form.gender)}</div>
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-paper)]">Tipo</div>
                  <div>{form.product_type === "single" ? "Individual" : "Paquete"}</div>
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-paper)]">Estado</div>
                  <div>{form.is_active ? "Activo" : "Inactivo"}</div>
                </div>
              </div>
            </div>
          </div>

          <Toggle
            checked={form.is_active}
            onChange={(nextValue) => setForm((current) => ({ ...current, is_active: nextValue }))}
            label="Visibilidad del producto"
          />
        </FormCard>

        <FormCard
          title="Galería principal"
          description="Sube múltiples imágenes a Cloudinary, ordénalas y guarda en `product_images` con `sort_order`."
        >
          <Uploader
            label="Imágenes del producto"
            description="La primera imagen queda en la posición #1. Puedes reordenar y eliminar antes de guardar."
            folder="daisa/products"
            value={form.images}
            onChange={(images) => setForm((current) => ({ ...current, images }))}
          />
          {fieldErrors.images ? <div className="text-sm text-[var(--color-danger)]">{fieldErrors.images}</div> : null}
        </FormCard>

        {form.product_type === "single" ? (
          <FormCard
            title="Tallas para variante Único"
            description="No se muestra selector complejo. Al guardar se asegura que exista una variante llamada “Único”."
          >
            <SizeSelector
              value={form.singleSizes}
              onChange={(sizes) => setForm((current) => ({ ...current, singleSizes: sizes }))}
            />
            {fieldErrors.singleSizes ? (
              <div className="text-sm text-[var(--color-danger)]">{fieldErrors.singleSizes}</div>
            ) : null}
          </FormCard>
        ) : (
          <FormCard
            title="Variantes del paquete"
            description="Cada variante puede representar color/diseño, una imagen principal y sus tallas disponibles."
          >
            <div className="space-y-4">
              {visibleBundleVariants.map((variant, index) => (
                <div
                  key={variant.key}
                  className="rounded-[24px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.58)] p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge tone={variant.isActive ? "success" : "danger"}>
                        {variant.isActive ? "activa" : "baja"}
                      </StatusBadge>
                      <div className="text-sm text-[rgba(96,74,56,0.62)]">Variante {index + 1}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={variant.isActive ? "danger" : "secondary"}
                        onClick={() => updateVariant(variant.key, { isActive: !variant.isActive })}
                      >
                        {variant.isActive ? "Dar de baja" : "Reactivar"}
                      </Button>
                      {!variant.id ? (
                        <Button type="button" variant="ghost" onClick={() => removeVariant(variant.key)}>
                          Quitar
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-3">
                    <Field label="Nombre variante">
                      <Input
                        value={variant.name}
                        onChange={(event) => updateVariant(variant.key, { name: event.target.value })}
                        placeholder="Rayado azul"
                      />
                    </Field>
                    <Field label="Color">
                      <Input
                        value={variant.color ?? ""}
                        onChange={(event) => updateVariant(variant.key, { color: event.target.value })}
                        placeholder="Azul marino"
                      />
                    </Field>
                    <Field label="Diseño">
                      <Input
                        value={variant.pattern ?? ""}
                        onChange={(event) => updateVariant(variant.key, { pattern: event.target.value })}
                        placeholder="Rayas finas"
                      />
                    </Field>
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                    <Uploader
                      label="Imagen principal variante"
                      description="Opcional. Se guarda como `image_url` en `product_variants`."
                      folder="daisa/variants"
                      value={variant.image ? [variant.image] : []}
                      onChange={(images) => updateVariant(variant.key, { image: images[0] ?? null })}
                      multiple={false}
                      maxFiles={1}
                    />
                    <div className="rounded-[24px] border border-[var(--color-line)] bg-[rgba(242,232,221,0.76)] p-4">
                      <div className="text-sm font-semibold text-[var(--color-paper)]">Tallas</div>
                      <div className="mt-3">
                        <SizeSelector
                          value={variant.sizes}
                          onChange={(sizes) => updateVariant(variant.key, { sizes })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {visibleBundleVariants.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[var(--color-line)] px-4 py-6 text-sm text-[rgba(96,74,56,0.52)]">
                  No hay variantes todavía. Agrega la primera para el paquete.
                </div>
              ) : null}

              <Button type="button" onClick={addVariant}>
                Agregar variante
              </Button>
              {fieldErrors.variants ? <div className="text-sm text-[var(--color-danger)]">{fieldErrors.variants}</div> : null}
            </div>
          </FormCard>
        )}

        {error ? <div className="text-sm text-[var(--color-danger)]">{error}</div> : null}

        <FormActions>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>Cancelar</Button>
        </FormActions>
      </form>

      <Modal
        title="Producto guardado"
        open={successModalOpen}
        onClose={handleSuccessClose}
      >
        <div className="space-y-5">
          <p className="text-sm leading-7 text-[rgba(96,74,56,0.74)]">
            {success ?? "El producto se guardó correctamente en el catálogo."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSuccessClose}>
              Volver al listado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
