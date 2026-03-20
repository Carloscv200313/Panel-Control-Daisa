import { z } from "zod";

const uploadedImageSchema = z.object({
  url: z.string().url("La URL de la imagen es inválida"),
  publicId: z.string().default(""),
});

export const settingsSchema = z.object({
  business_name: z.string().trim().min(2, "Ingresa el nombre del negocio"),
  whatsapp_number_e164: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Usa formato E.164, por ejemplo +51999999999"),
  whatsapp_message_template: z
    .string()
    .trim()
    .min(5, "Escribe el mensaje base para WhatsApp"),
  promo_title: z.string().trim().min(2, "Ingresa un título de promoción"),
  promo_text: z.string().trim().min(4, "Ingresa el texto promocional"),
  admin_logo: uploadedImageSchema.nullable(),
  promo_image: uploadedImageSchema.nullable(),
});

export const priceTierSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  min_qty: z.coerce.number().int().min(1, "La cantidad mínima debe ser mayor a 0"),
  unit_price: z.coerce.number().positive("El precio unitario debe ser positivo"),
});

export const brandSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre de marca"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre de categoría"),
  sort_order: z.coerce.number().int().min(0, "El orden no puede ser negativo"),
  is_active: z.boolean().default(true),
});

const variantSizeSchema = z.enum(["S", "M", "L", "XL", "XXL"]);

export const bundleVariantSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().trim().min(1, "Cada variante necesita un nombre"),
  color: z.string().trim().optional(),
  pattern: z.string().trim().optional(),
  image: uploadedImageSchema.nullable().optional(),
  isActive: z.boolean().default(true),
  sizes: z.array(variantSizeSchema).min(1, "Selecciona al menos una talla"),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre es obligatorio"),
    description: z.string().trim().min(4, "Agrega una descripción mínima"),
    brand_id: z.union([z.literal(""), z.string().uuid("Selecciona una marca válida")]),
    category_id: z.union([z.literal(""), z.string().uuid("Selecciona una categoría válida")]),
    product_type: z.enum(["single", "bundle"]),
    is_active: z.boolean().default(true),
    images: z.array(uploadedImageSchema).min(1, "Sube al menos una imagen"),
    singleSizes: z.array(variantSizeSchema),
    variants: z.array(bundleVariantSchema),
  })
  .superRefine((value, ctx) => {
    if (value.product_type === "single" && value.singleSizes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona al menos una talla para la variante Único",
        path: ["singleSizes"],
      });
    }

    if (value.product_type === "bundle" && value.variants.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agrega al menos una variante para el bundle",
        path: ["variants"],
      });
    }
  });

export type UploadedImageInput = z.infer<typeof uploadedImageSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type PriceTierInput = z.infer<typeof priceTierSchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BundleVariantInput = z.infer<typeof bundleVariantSchema>;
export type ProductInput = z.infer<typeof productSchema>;
