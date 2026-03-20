import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_PRICE_TIERS } from "@/lib/admin/constants";
import type {
  Database,
  DbId,
  Json,
  ProductSize,
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/database.types";
import type {
  BrandInput,
  CategoryInput,
  PriceTierInput,
  ProductInput,
  SettingsInput,
  UploadedImageInput,
} from "@/lib/admin/schemas";

export type BrowserSupabaseClient = SupabaseClient<Database>;

export interface DashboardSnapshot {
  activeProducts: number;
  ordersLast7Days: number;
  ordersLast30Days: number;
  promoTitle: string | null;
  promoText: string | null;
  topProducts: Array<Pick<TableRow<"products">, "id" | "name" | "requested_count" | "is_active">>;
}

export type ProductListItem = Pick<
  TableRow<"products">,
  "id" | "name" | "product_type" | "is_active" | "requested_count" | "updated_at"
>;

export type BrandListItem = Pick<TableRow<"brands">, "id" | "name" | "created_at">;
export type CategoryListItem = Pick<
  TableRow<"categories">,
  "id" | "name" | "sort_order" | "is_active" | "updated_at"
>;

export interface ProductFormCatalogs {
  brands: Array<Pick<TableRow<"brands">, "id" | "name">>;
  categories: Array<Pick<TableRow<"categories">, "id" | "name" | "is_active" | "sort_order">>;
}

export interface ProductVariantFormValue {
  id?: DbId;
  name: string;
  color?: string;
  pattern?: string;
  image: UploadedImageInput | null;
  isActive: boolean;
  sizes: ProductSize[];
}

export interface ProductEditorSnapshot {
  product: TableRow<"products">;
  images: UploadedImageInput[];
  variants: ProductVariantFormValue[];
}

export type OrderListItem = TableRow<"orders">;

export interface OrderItemDetail {
  id: DbId;
  productName: string;
  variantName: string;
  size: string | null;
  qty: number;
}

function asErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return asErrorMessage(error, fallback);
}

async function unwrap<T>(promise: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await promise;
  if (error) {
    throw new Error(error.message ?? "Ocurrió un error inesperado con Supabase.");
  }
  return data as NonNullable<T>;
}

async function unwrapNullable<T>(
  promise: PromiseLike<{ data: T; error: { message?: string } | null }>,
) {
  const { data, error } = await promise;
  if (error) {
    throw new Error(error.message ?? "Ocurrió un error inesperado con Supabase.");
  }

  return data;
}

function toUploadedImage(
  row: Pick<TableRow<"product_images">, "url" | "cloudinary_public_id">,
): UploadedImageInput {
  return {
    url: row.url,
    publicId: row.cloudinary_public_id ?? "",
  };
}

function isProductSize(value: string): value is ProductSize {
  return ["S", "M", "L", "XL", "XXL"].includes(value);
}

function cleanAttributes(input: { color?: string; pattern?: string }): Json {
  const attributes: Record<string, string> = {};
  const color = input.color?.trim();
  const pattern = input.pattern?.trim();

  if (color) {
    attributes.color = color;
  }

  if (pattern) {
    attributes.pattern = pattern;
  }

  return attributes;
}

function buildPriceTierLabel(minQty: number) {
  return minQty === 1 ? "1 unidad" : `Desde ${minQty} unidades`;
}

export async function fetchDashboardData(
  supabase: BrowserSupabaseClient,
): Promise<DashboardSnapshot> {
  const now = new Date();
  const last7Days = new Date(now);
  last7Days.setDate(now.getDate() - 7);
  const last30Days = new Date(now);
  last30Days.setDate(now.getDate() - 30);

  const [activeProductsCount, orders7Count, orders30Count, topProducts, settings] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last7Days.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last30Days.toISOString()),
    supabase
      .from("products")
      .select("id, name, requested_count, is_active")
      .order("requested_count", { ascending: false })
      .limit(5),
    supabase
      .from("settings")
      .select("promo_title, promo_text")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (activeProductsCount.error) throw new Error(activeProductsCount.error.message);
  if (orders7Count.error) throw new Error(orders7Count.error.message);
  if (orders30Count.error) throw new Error(orders30Count.error.message);
  if (topProducts.error) throw new Error(topProducts.error.message);
  if (settings.error) throw new Error(settings.error.message);

  return {
    activeProducts: activeProductsCount.count ?? 0,
    ordersLast7Days: orders7Count.count ?? 0,
    ordersLast30Days: orders30Count.count ?? 0,
    promoTitle: settings.data?.promo_title ?? null,
    promoText: settings.data?.promo_text ?? null,
    topProducts: topProducts.data ?? [],
  };
}

export async function fetchSettings(supabase: BrowserSupabaseClient) {
  const data = await unwrapNullable(
    supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle(),
  );

  return (
    data ?? {
      id: 1,
      business_name: null,
      currency: null,
      admin_logo_url: null,
      whatsapp_number_e164: null,
      whatsapp_message_template: null,
      promo_title: null,
      promo_text: null,
      promo_image_url: null,
      created_at: null,
      updated_at: null,
    }
  );
}

export async function saveSettings(
  supabase: BrowserSupabaseClient,
  payload: SettingsInput,
) {
  const baseRow = {
    business_name: payload.business_name,
    whatsapp_number_e164: payload.whatsapp_number_e164,
    whatsapp_message_template: payload.whatsapp_message_template,
    promo_title: payload.promo_title,
    promo_text: payload.promo_text,
    promo_image_url: payload.promo_image?.url ?? null,
  } satisfies TableUpdate<"settings">;

  const rowWithLogo = {
    ...baseRow,
    admin_logo_url: payload.admin_logo?.url ?? null,
  } satisfies TableUpdate<"settings">;

  let updated: TableRow<"settings"> | null = null;

  try {
    updated = await unwrapNullable(
      supabase
        .from("settings")
        .update(rowWithLogo)
        .eq("id", 1)
        .select("*")
        .maybeSingle(),
    );
  } catch (error) {
    const message = asErrorMessage(error, "");

    if (!message.includes("admin_logo_url")) {
      throw error;
    }

    updated = await unwrapNullable(
      supabase
        .from("settings")
        .update(baseRow)
        .eq("id", 1)
        .select("*")
        .maybeSingle(),
    );

    if (payload.admin_logo?.url) {
      throw new Error(
        "Falta la columna `settings.admin_logo_url` en Supabase. Ejecuta la migración SQL del logo del panel y vuelve a intentar.",
      );
    }
  }

  if (!updated) {
    throw new Error(
      "La fila base de settings con id=1 no existe. Créala una vez en Supabase antes de guardar.",
    );
  }

  return updated;
}

export async function fetchPriceTiers(supabase: BrowserSupabaseClient) {
  const data = await unwrap(
    supabase
      .from("price_tiers")
      .select("*")
      .order("min_qty", { ascending: true }),
  );

  if (data.length > 0) {
    return data;
  }

  await unwrap(
    supabase.from("price_tiers").insert(
      DEFAULT_PRICE_TIERS.map((item) => ({
        ...item,
        label: buildPriceTierLabel(item.min_qty),
      })),
    ),
  );
  return unwrap(
    supabase
      .from("price_tiers")
      .select("*")
      .order("min_qty", { ascending: true }),
  );
}

export async function savePriceTiers(
  supabase: BrowserSupabaseClient,
  rows: PriceTierInput[],
  removedIds: DbId[],
) {
  if (removedIds.length > 0) {
    await unwrap(supabase.from("price_tiers").delete().in("id", removedIds));
  }

  for (const row of rows) {
    if (row.id) {
      await unwrap(
        supabase
          .from("price_tiers")
          .update({
            min_qty: row.min_qty,
            unit_price: row.unit_price,
            label: buildPriceTierLabel(row.min_qty),
          })
          .eq("id", row.id),
      );
      continue;
    }

    await unwrap(
      supabase.from("price_tiers").insert({
        min_qty: row.min_qty,
        unit_price: row.unit_price,
        label: buildPriceTierLabel(row.min_qty),
      }),
    );
  }

  return fetchPriceTiers(supabase);
}

export async function fetchProducts(supabase: BrowserSupabaseClient) {
  return unwrap(
    supabase
      .from("products")
      .select("id, name, product_type, is_active, requested_count, updated_at")
      .order("updated_at", { ascending: false }),
  ) as Promise<ProductListItem[]>;
}

export async function fetchProductFormCatalogs(
  supabase: BrowserSupabaseClient,
): Promise<ProductFormCatalogs> {
  const [brands, categories] = await Promise.all([
    unwrap(
      supabase
        .from("brands")
        .select("id, name")
        .order("name", { ascending: true }),
    ),
    unwrap(
      supabase
        .from("categories")
        .select("id, name, is_active, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ),
  ]);

  return {
    brands,
    categories,
  };
}

export async function fetchBrands(supabase: BrowserSupabaseClient) {
  return unwrap(
    supabase
      .from("brands")
      .select("id, name, created_at")
      .order("name", { ascending: true }),
  ) as Promise<BrandListItem[]>;
}

export async function createBrand(
  supabase: BrowserSupabaseClient,
  payload: BrandInput,
) {
  return unwrap(
    supabase
      .from("brands")
      .insert({ name: payload.name })
      .select("id, name, created_at")
      .single(),
  );
}

export async function updateBrand(
  supabase: BrowserSupabaseClient,
  brandId: DbId,
  payload: BrandInput,
) {
  return unwrap(
    supabase
      .from("brands")
      .update({ name: payload.name })
      .eq("id", brandId)
      .select("id, name, created_at")
      .single(),
  );
}

export async function deleteBrand(
  supabase: BrowserSupabaseClient,
  brandId: DbId,
) {
  await unwrap(supabase.from("brands").delete().eq("id", brandId));
}

export async function fetchCategories(supabase: BrowserSupabaseClient) {
  return unwrap(
    supabase
      .from("categories")
      .select("id, name, sort_order, is_active, updated_at")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ) as Promise<CategoryListItem[]>;
}

export async function createCategory(
  supabase: BrowserSupabaseClient,
  payload: CategoryInput,
) {
  return unwrap(
    supabase
      .from("categories")
      .insert({
        name: payload.name,
        sort_order: payload.sort_order,
        is_active: payload.is_active,
      })
      .select("id, name, sort_order, is_active, updated_at")
      .single(),
  );
}

export async function updateCategory(
  supabase: BrowserSupabaseClient,
  categoryId: DbId,
  payload: CategoryInput,
) {
  return unwrap(
    supabase
      .from("categories")
      .update({
        name: payload.name,
        sort_order: payload.sort_order,
        is_active: payload.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select("id, name, sort_order, is_active, updated_at")
      .single(),
  );
}

export async function deleteCategory(
  supabase: BrowserSupabaseClient,
  categoryId: DbId,
) {
  await unwrap(supabase.from("categories").delete().eq("id", categoryId));
}

export async function toggleProductActive(
  supabase: BrowserSupabaseClient,
  productId: DbId,
  isActive: boolean,
) {
  await unwrap(
    supabase
      .from("products")
      .update({ is_active: isActive })
      .eq("id", productId),
  );
}

export async function fetchProductDetail(
  supabase: BrowserSupabaseClient,
  productId: DbId,
): Promise<ProductEditorSnapshot | null> {
  const [product, images, variants] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).maybeSingle(),
    supabase
      .from("product_images")
      .select("id, product_id, url, cloudinary_public_id, alt, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true }),
  ]);

  if (product.error) throw new Error(product.error.message);
  if (images.error) throw new Error(images.error.message);
  if (variants.error) throw new Error(variants.error.message);

  if (!product.data) {
    return null;
  }

  const variantIds = (variants.data ?? []).map((variant) => variant.id);
  const sizeRows = variantIds.length
    ? await unwrap(
        supabase
          .from("variant_sizes")
          .select("variant_id, size_code, is_available")
          .in("variant_id", variantIds),
      )
    : [];

  const sizesByVariant = new Map<string, ProductSize[]>();
  sizeRows.forEach((row) => {
    if (row.is_available === false || !isProductSize(row.size_code)) {
      return;
    }

    const key = String(row.variant_id);
    const current = sizesByVariant.get(key) ?? [];
    current.push(row.size_code);
    sizesByVariant.set(key, current);
  });

  return {
    product: product.data,
    images: (images.data ?? []).map(toUploadedImage),
    variants: (variants.data ?? []).map((variant) => {
      const attributes = (variant.attributes ?? {}) as { color?: string | null; pattern?: string | null };
      return {
        id: variant.id,
        name: variant.name,
        color: attributes.color ?? "",
        pattern: attributes.pattern ?? "",
        image: variant.image_url
          ? {
              url: variant.image_url,
              publicId: "",
            }
          : null,
        isActive: variant.is_active,
        sizes: sizesByVariant.get(String(variant.id)) ?? [],
      } satisfies ProductVariantFormValue;
    }),
  };
}

async function replaceProductImages(
  supabase: BrowserSupabaseClient,
  productId: DbId,
  images: UploadedImageInput[],
) {
  await unwrap(supabase.from("product_images").delete().eq("product_id", productId));

  if (images.length === 0) {
    return;
  }

  await unwrap(
    supabase.from("product_images").insert(
      images.map((image, index) => ({
        product_id: productId,
        url: image.url,
        cloudinary_public_id: image.publicId || null,
        alt: null,
        sort_order: index,
      })),
    ),
  );
}

async function replaceVariantSizes(
  supabase: BrowserSupabaseClient,
  variantId: DbId,
  sizes: ProductSize[],
) {
  await unwrap(supabase.from("variant_sizes").delete().eq("variant_id", variantId));

  if (sizes.length === 0) {
    return;
  }

  await unwrap(
    supabase.from("variant_sizes").insert(
      sizes.map((size) => ({
        variant_id: variantId,
        size_code: size,
        is_available: true,
        stock: 0,
      })),
    ),
  );
}

export async function saveProduct(
  supabase: BrowserSupabaseClient,
  payload: ProductInput,
  productId?: DbId,
) {
  const row: TableInsert<"products"> = {
    brand_id: payload.brand_id || null,
    category_id: payload.category_id || null,
    name: payload.name,
    description: payload.description,
    product_type: payload.product_type,
    is_active: payload.is_active,
  };

  const product = productId
    ? await unwrap(
        supabase
          .from("products")
          .update(row)
          .eq("id", productId)
          .select("*")
          .single(),
      )
    : await unwrap(
        supabase
          .from("products")
          .insert(row)
          .select("*")
          .single(),
      );

  const resolvedProductId = product.id;
  await replaceProductImages(supabase, resolvedProductId, payload.images);

  const existingVariants = await unwrap(
    supabase
      .from("product_variants")
      .select("id, name")
      .eq("product_id", resolvedProductId),
  );

  if (payload.product_type === "single") {
    const uniqueVariant = existingVariants.find((variant) => variant.name === "Único") ?? existingVariants[0];
    const savedUniqueVariant = uniqueVariant
      ? await unwrap(
          supabase
            .from("product_variants")
            .update({
              name: "Único",
              attributes: {},
              is_active: true,
            })
            .eq("id", uniqueVariant.id)
            .select("*")
            .single(),
        )
      : await unwrap(
          supabase
            .from("product_variants")
            .insert({
              product_id: resolvedProductId,
              name: "Único",
              attributes: {},
              is_active: true,
            })
            .select("*")
            .single(),
        );

    const inactiveIds = existingVariants
      .filter((variant) => String(variant.id) !== String(savedUniqueVariant.id))
      .map((variant) => variant.id);

    if (inactiveIds.length > 0) {
      await unwrap(
        supabase
          .from("product_variants")
          .update({ is_active: false })
          .in("id", inactiveIds),
      );
    }

    await replaceVariantSizes(supabase, savedUniqueVariant.id, payload.singleSizes);
  }

  if (payload.product_type === "bundle") {
    const persistedIds: DbId[] = [];

    for (const variant of payload.variants) {
      const variantRow = {
        product_id: resolvedProductId,
        name: variant.name,
        attributes: cleanAttributes({ color: variant.color, pattern: variant.pattern }),
        image_url: variant.image?.url ?? null,
        is_active: variant.isActive,
      };

      const savedVariant = variant.id
        ? await unwrap(
            supabase
              .from("product_variants")
              .update(variantRow)
              .eq("id", variant.id)
              .select("*")
              .single(),
          )
        : await unwrap(
            supabase
              .from("product_variants")
              .insert(variantRow)
              .select("*")
              .single(),
          );

      persistedIds.push(savedVariant.id);
      await replaceVariantSizes(supabase, savedVariant.id, variant.sizes);
    }

    const removedIds = existingVariants
      .map((variant) => variant.id)
      .filter((id) => !persistedIds.some((persistedId) => String(persistedId) === String(id)));

    if (removedIds.length > 0) {
      await unwrap(
        supabase
          .from("product_variants")
          .update({ is_active: false })
          .in("id", removedIds),
      );
    }
  }

  return product;
}

export async function fetchOrders(supabase: BrowserSupabaseClient) {
  return unwrap(
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }),
  ) as Promise<OrderListItem[]>;
}

export async function fetchOrderItems(
  supabase: BrowserSupabaseClient,
  orderId: DbId,
): Promise<OrderItemDetail[]> {
  const data = await unwrap(
    supabase
      .from("order_items")
      .select("*, products(name), product_variants(name)")
      .eq("order_id", orderId),
  );

  return (data as Array<
    TableRow<"order_items"> & {
      products?: { name?: string | null } | null;
      product_variants?: { name?: string | null } | null;
    }
  >).map((item) => ({
    id: item.id,
    productName: item.products?.name ?? `#${item.product_id ?? "-"}`,
    variantName: item.product_variants?.name ?? "Sin variante",
    size: item.size_code,
    qty: item.quantity ?? 0,
  }));
}

export async function fetchCustomers(supabase: BrowserSupabaseClient) {
  return unwrap(
    supabase
      .from("customers")
      .select("id, name, phone_e164, last_seen_at")
      .order("last_seen_at", { ascending: false, nullsFirst: false }),
  ) as Promise<NonNullable<TableRow<"customers">[]> >;
}
