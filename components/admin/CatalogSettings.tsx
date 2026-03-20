"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { useFeedbackModal } from "@/components/admin/FeedbackModalProvider";
import { Field, FormActions, FormCard, Input, Toggle } from "@/components/admin/Form";
import { LoadingState } from "@/components/admin/LoadingState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Table } from "@/components/admin/Table";
import {
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  fetchBrands,
  fetchCategories,
  getErrorMessage,
  updateBrand,
  updateCategory,
  type BrandListItem,
  type CategoryListItem,
} from "@/lib/admin/data";
import { formatDate } from "@/lib/admin/format";
import { brandSchema, categorySchema } from "@/lib/admin/schemas";
import { createClient } from "@/lib/supabase/client";

interface BrandFormState {
  name: string;
}

interface CategoryFormState {
  name: string;
  sort_order: string;
  is_active: boolean;
}

const initialBrandForm: BrandFormState = {
  name: "",
};

const initialCategoryForm: CategoryFormState = {
  name: "",
  sort_order: "0",
  is_active: true,
};

export function CatalogSettings() {
  const feedback = useFeedbackModal();
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [brandForm, setBrandForm] = useState<BrandFormState>(initialBrandForm);
  const [editingBrandId, setEditingBrandId] = useState<string | number | null>(null);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandDeletingId, setBrandDeletingId] = useState<string | number | null>(null);
  const [brandFieldError, setBrandFieldError] = useState<string | null>(null);
  const [brandMessage, setBrandMessage] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | number | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryDeletingId, setCategoryDeletingId] = useState<string | number | null>(null);
  const [categoryFieldErrors, setCategoryFieldErrors] = useState<Record<string, string>>({});
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);

  async function loadCatalogs() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const [brandsData, categoriesData] = await Promise.all([
        fetchBrands(supabase),
        fetchCategories(supabase),
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudo cargar marcas y categorías."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalogs();
  }, []);

  function resetBrandForm() {
    setBrandForm(initialBrandForm);
    setEditingBrandId(null);
    setBrandFieldError(null);
  }

  function resetCategoryForm() {
    setCategoryForm(initialCategoryForm);
    setEditingCategoryId(null);
    setCategoryFieldErrors({});
  }

  async function handleBrandSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBrandFieldError(null);
    setBrandMessage(null);

    const parsed = brandSchema.safeParse(brandForm);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Ingresa una marca válida.";
      setBrandFieldError(message);
      void feedback.showWarning({
        title: "Marca inválida",
        description: message,
      });
      return;
    }

    try {
      setBrandSaving(true);
      feedback.showLoading({
        title: editingBrandId ? "Actualizando marca" : "Creando marca",
        description: "Estamos guardando la información de la marca seleccionada.",
      });
      const supabase = createClient();

      if (editingBrandId) {
        await updateBrand(supabase, editingBrandId, parsed.data);
        setBrandMessage("Marca actualizada correctamente.");
      } else {
        await createBrand(supabase, parsed.data);
        setBrandMessage("Marca creada correctamente.");
      }

      resetBrandForm();
      await loadCatalogs();
      feedback.close();
      await feedback.showSuccess({
        title: editingBrandId ? "Marca actualizada" : "Marca creada",
        description: "La lista de marcas ya fue actualizada.",
      });
    } catch (saveError) {
      const message = getErrorMessage(saveError, "No se pudo guardar la marca.");
      setBrandFieldError(message);
      feedback.close();
      await feedback.showError({
        title: "No se pudo guardar la marca",
        description: message,
      });
    } finally {
      setBrandSaving(false);
    }
  }

  async function handleDeleteBrand(brandId: string | number) {
    const confirmed = await feedback.showWarning({
      title: "Eliminar marca",
      description: "Esta acción quitará la marca del catálogo. Si está asociada a productos, la base puede rechazar la operación.",
      confirmLabel: "Eliminar marca",
    });

    if (!confirmed) {
      return;
    }

    try {
      setBrandDeletingId(brandId);
      setBrandFieldError(null);
      setBrandMessage(null);
      feedback.showLoading({
        title: "Eliminando marca",
        description: "Estamos quitando la marca del catálogo.",
      });
      const supabase = createClient();
      await deleteBrand(supabase, brandId);

      if (editingBrandId === brandId) {
        resetBrandForm();
      }

      setBrandMessage("Marca eliminada correctamente.");
      await loadCatalogs();
      feedback.close();
      await feedback.showSuccess({
        title: "Marca eliminada",
        description: "La marca ya no aparece en el catálogo.",
      });
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, "No se pudo eliminar la marca.");
      setBrandFieldError(message);
      feedback.close();
      await feedback.showError({
        title: "No se pudo eliminar la marca",
        description: message,
      });
    } finally {
      setBrandDeletingId(null);
    }
  }

  async function handleCategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryFieldErrors({});
    setCategoryMessage(null);

    const parsed = categorySchema.safeParse(categoryForm);
    if (!parsed.success) {
      const nextErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      );
      setCategoryFieldErrors(nextErrors);
      void feedback.showWarning({
        title: "Revisa la categoría",
        description: "Hay datos incompletos o inválidos antes de guardar.",
      });
      return;
    }

    try {
      setCategorySaving(true);
      feedback.showLoading({
        title: editingCategoryId ? "Actualizando categoría" : "Creando categoría",
        description: "Estamos guardando la configuración de la categoría.",
      });
      const supabase = createClient();

      if (editingCategoryId) {
        await updateCategory(supabase, editingCategoryId, parsed.data);
        setCategoryMessage("Categoría actualizada correctamente.");
      } else {
        await createCategory(supabase, parsed.data);
        setCategoryMessage("Categoría creada correctamente.");
      }

      resetCategoryForm();
      await loadCatalogs();
      feedback.close();
      await feedback.showSuccess({
        title: editingCategoryId ? "Categoría actualizada" : "Categoría creada",
        description: "La lista de categorías ya fue actualizada.",
      });
    } catch (saveError) {
      const message = getErrorMessage(saveError, "No se pudo guardar la categoría.");
      setCategoryFieldErrors({
        name: message,
      });
      feedback.close();
      await feedback.showError({
        title: "No se pudo guardar la categoría",
        description: message,
      });
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleDeleteCategory(categoryId: string | number) {
    const confirmed = await feedback.showWarning({
      title: "Eliminar categoría",
      description: "Esta acción quitará la categoría del catálogo. Si está asociada a productos, la base puede rechazar la operación.",
      confirmLabel: "Eliminar categoría",
    });

    if (!confirmed) {
      return;
    }

    try {
      setCategoryDeletingId(categoryId);
      setCategoryFieldErrors({});
      setCategoryMessage(null);
      feedback.showLoading({
        title: "Eliminando categoría",
        description: "Estamos quitando la categoría seleccionada.",
      });
      const supabase = createClient();
      await deleteCategory(supabase, categoryId);

      if (editingCategoryId === categoryId) {
        resetCategoryForm();
      }

      setCategoryMessage("Categoría eliminada correctamente.");
      await loadCatalogs();
      feedback.close();
      await feedback.showSuccess({
        title: "Categoría eliminada",
        description: "La categoría ya no aparece en el catálogo.",
      });
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, "No se pudo eliminar la categoría.");
      setCategoryFieldErrors({
        name: message,
      });
      feedback.close();
      await feedback.showError({
        title: "No se pudo eliminar la categoría",
        description: message,
      });
    } finally {
      setCategoryDeletingId(null);
    }
  }

  if (loading) {
    return <LoadingState label="Cargando marcas y categorías..." />;
  }

  if (error) {
    return <EmptyState title="No se pudo cargar catálogos" description={error} />;
  }

  return (
    <div className="space-y-5">
      <FormCard
        title="Marcas"
        description="Crea y mantiene las marcas disponibles para asociar a los productos."
      >
        <form className="space-y-5" onSubmit={handleBrandSubmit}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Field label="Nombre de marca" error={brandFieldError ?? undefined}>
              <Input
                value={brandForm.name}
                onChange={(event) => setBrandForm({ name: event.target.value })}
                placeholder="Daiza Basic"
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={brandSaving}>
                {brandSaving ? "Guardando..." : editingBrandId ? "Guardar marca" : "Crear marca"}
              </Button>
            </div>
          </div>

          {brandMessage ? <div className="text-sm text-[var(--color-success)]">{brandMessage}</div> : null}

          <FormActions>
            {editingBrandId ? (
              <Button type="button" variant="secondary" onClick={resetBrandForm} disabled={brandSaving}>
                Cancelar edición
              </Button>
            ) : null}
          </FormActions>
        </form>

        <Table
          rows={brands}
          rowKey={(brand) => brand.id}
          empty={<EmptyState title="Sin marcas" description="Todavía no hay marcas cargadas." />}
          columns={[
            {
              header: "Marca",
              render: (brand) => <span className="text-sm font-semibold text-[var(--color-paper)]">{brand.name}</span>,
            },
            {
              header: "Creada",
              render: (brand) => <span className="text-sm text-[var(--color-paper)]">{formatDate(brand.created_at)}</span>,
            },
            {
              header: "Acciones",
              render: (brand) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingBrandId(brand.id);
                      setBrandForm({ name: brand.name });
                      setBrandFieldError(null);
                      setBrandMessage(null);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDeleteBrand(brand.id)}
                    disabled={brandDeletingId === brand.id}
                  >
                    {brandDeletingId === brand.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </FormCard>

      <FormCard
        title="Categorías"
        description="Gestiona las categorías del catálogo, su orden visual y si están activas."
      >
        <form className="space-y-5" onSubmit={handleCategorySubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Nombre de categoría" error={categoryFieldErrors.name}>
              <Input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Varón"
              />
            </Field>
            <Field label="Orden" error={categoryFieldErrors.sort_order}>
              <Input
                type="number"
                min={0}
                value={categoryForm.sort_order}
                onChange={(event) => setCategoryForm((current) => ({ ...current, sort_order: event.target.value }))}
                placeholder="0"
              />
            </Field>
          </div>

          <Toggle
            checked={categoryForm.is_active}
            onChange={(nextValue) => setCategoryForm((current) => ({ ...current, is_active: nextValue }))}
            label="Categoría activa"
          />

          {categoryFieldErrors.name && !categoryFieldErrors.sort_order ? (
            <div className="text-sm text-[var(--color-danger)]">{categoryFieldErrors.name}</div>
          ) : null}
          {categoryMessage ? <div className="text-sm text-[var(--color-success)]">{categoryMessage}</div> : null}

          <FormActions>
            <Button type="submit" disabled={categorySaving}>
              {categorySaving ? "Guardando..." : editingCategoryId ? "Guardar categoría" : "Crear categoría"}
            </Button>
            {editingCategoryId ? (
              <Button type="button" variant="secondary" onClick={resetCategoryForm} disabled={categorySaving}>
                Cancelar edición
              </Button>
            ) : null}
          </FormActions>
        </form>

        <Table
          rows={categories}
          rowKey={(category) => category.id}
          empty={<EmptyState title="Sin categorías" description="Todavía no hay categorías cargadas." />}
          columns={[
            {
              header: "Categoría",
              render: (category) => <span className="text-sm font-semibold text-[var(--color-paper)]">{category.name}</span>,
            },
            {
              header: "Orden",
              render: (category) => <span className="text-sm text-[var(--color-paper)]">{category.sort_order}</span>,
            },
            {
              header: "Estado",
              render: (category) => (
                <StatusBadge tone={category.is_active ? "success" : "danger"}>
                  {category.is_active ? "activa" : "inactiva"}
                </StatusBadge>
              ),
            },
            {
              header: "Actualizada",
              render: (category) => (
                <span className="text-sm text-[var(--color-paper)]">{formatDate(category.updated_at)}</span>
              ),
            },
            {
              header: "Acciones",
              render: (category) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingCategoryId(category.id);
                      setCategoryForm({
                        name: category.name,
                        sort_order: String(category.sort_order),
                        is_active: category.is_active,
                      });
                      setCategoryFieldErrors({});
                      setCategoryMessage(null);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDeleteCategory(category.id)}
                    disabled={categoryDeletingId === category.id}
                  >
                    {categoryDeletingId === category.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </FormCard>
    </div>
  );
}
