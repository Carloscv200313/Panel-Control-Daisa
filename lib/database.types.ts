export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DbId = string | number;

export type ProductCategory = "Varón" | "Mujer" | "Unisex";
export type ProductType = "single" | "bundle";
export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          role: "owner" | "admin" | "editor" | "viewer";
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          role?: "owner" | "admin" | "editor" | "viewer";
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          role?: "owner" | "admin" | "editor" | "viewer";
          created_at?: string | null;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          id: DbId;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          name?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: DbId;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: DbId;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: DbId;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          business_name: string | null;
          currency: string | null;
          admin_logo_url: string | null;
          whatsapp_number_e164: string | null;
          whatsapp_message_template: string | null;
          promo_title: string | null;
          promo_text: string | null;
          promo_image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          business_name?: string | null;
          currency?: string | null;
          admin_logo_url?: string | null;
          whatsapp_number_e164?: string | null;
          whatsapp_message_template?: string | null;
          promo_title?: string | null;
          promo_text?: string | null;
          promo_image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          business_name?: string | null;
          currency?: string | null;
          admin_logo_url?: string | null;
          whatsapp_number_e164?: string | null;
          whatsapp_message_template?: string | null;
          promo_title?: string | null;
          promo_text?: string | null;
          promo_image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      price_tiers: {
        Row: {
          id: DbId;
          min_qty: number;
          unit_price: number;
          label: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          min_qty: number;
          unit_price: number;
          label?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          min_qty?: number;
          unit_price?: number;
          label?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: DbId;
          brand_id: DbId | null;
          category_id: DbId | null;
          name: string;
          description: string | null;
          product_type: ProductType;
          is_active: boolean;
          requested_count: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: DbId;
          brand_id?: DbId | null;
          category_id?: DbId | null;
          name: string;
          description?: string | null;
          product_type?: ProductType;
          is_active?: boolean;
          requested_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: DbId;
          brand_id?: DbId | null;
          category_id?: DbId | null;
          name?: string;
          description?: string | null;
          product_type?: ProductType;
          is_active?: boolean;
          requested_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: DbId;
          product_id: DbId;
          url: string;
          cloudinary_public_id: string | null;
          alt: string | null;
          sort_order: number;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          product_id: DbId;
          url: string;
          cloudinary_public_id?: string | null;
          alt?: string | null;
          sort_order?: number;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          product_id?: DbId;
          url?: string;
          cloudinary_public_id?: string | null;
          alt?: string | null;
          sort_order?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: DbId;
          product_id: DbId;
          name: string;
          attributes: Json;
          image_url: string | null;
          is_active: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          product_id: DbId;
          name: string;
          attributes?: Json;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          product_id?: DbId;
          name?: string;
          attributes?: Json;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string | null;
        };
        Relationships: [];
      };
      variant_sizes: {
        Row: {
          variant_id: DbId;
          size_code: string;
          is_available: boolean | null;
          stock: number | null;
        };
        Insert: {
          variant_id: DbId;
          size_code: string;
          is_available?: boolean | null;
          stock?: number | null;
        };
        Update: {
          variant_id?: DbId;
          size_code?: string;
          is_available?: boolean | null;
          stock?: number | null;
        };
        Relationships: [];
      };
      sizes: {
        Row: {
          code: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          label: string;
          sort_order: number;
        };
        Update: {
          code?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      product_variant_images: {
        Row: {
          id: DbId;
          variant_id: DbId;
          url: string;
          cloudinary_public_id: string | null;
          alt: string | null;
          sort_order: number;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          variant_id: DbId;
          url: string;
          cloudinary_public_id?: string | null;
          alt?: string | null;
          sort_order?: number;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          variant_id?: DbId;
          url?: string;
          cloudinary_public_id?: string | null;
          alt?: string | null;
          sort_order?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: DbId;
          customer_id: DbId | null;
          customer_name: string | null;
          customer_phone: string | null;
          total_qty: number;
          unit_price_applied: number | null;
          total_amount_estimate: number | null;
          whatsapp_text: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          customer_id?: DbId | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          total_qty?: number;
          unit_price_applied?: number | null;
          total_amount_estimate?: number | null;
          whatsapp_text?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          customer_id?: DbId | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          total_qty?: number;
          unit_price_applied?: number | null;
          total_amount_estimate?: number | null;
          whatsapp_text?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: DbId;
          order_id: DbId;
          product_id: DbId | null;
          variant_id: DbId | null;
          size_code: string | null;
          quantity: number;
          unit_price: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: DbId;
          order_id: DbId;
          product_id?: DbId | null;
          variant_id?: DbId | null;
          size_code?: string | null;
          quantity: number;
          unit_price?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: DbId;
          order_id?: DbId;
          product_id?: DbId | null;
          variant_id?: DbId | null;
          size_code?: string | null;
          quantity?: number;
          unit_price?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: DbId;
          name: string | null;
          phone_e164: string | null;
          first_seen_at: string | null;
          last_seen_at: string | null;
        };
        Insert: {
          id?: DbId;
          name?: string | null;
          phone_e164?: string | null;
          first_seen_at?: string | null;
          last_seen_at?: string | null;
        };
        Update: {
          id?: DbId;
          name?: string;
          phone_e164?: string | null;
          first_seen_at?: string | null;
          last_seen_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];
