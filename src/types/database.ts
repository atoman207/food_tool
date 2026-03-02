export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { username?: string | null; avatar_url?: string };
        Update: Partial<Profile>;
      };
      suppliers: {
        Row: SupplierRow;
        Insert: Omit<SupplierRow, "id" | "created_at">;
        Update: Partial<SupplierRow>;
      };
      supplier_products: {
        Row: SupplierProductRow;
        Insert: Omit<SupplierProductRow, "id">;
        Update: Partial<SupplierProductRow>;
      };
      marketplace_items: {
        Row: MarketplaceItemRow;
        Insert: Omit<MarketplaceItemRow, "id" | "created_at">;
        Update: Partial<MarketplaceItemRow>;
      };
      news_articles: {
        Row: NewsArticleRow;
        Insert: Omit<NewsArticleRow, "id" | "created_at">;
        Update: Partial<NewsArticleRow>;
      };
      categories: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, "id">;
        Update: Partial<CategoryRow>;
      };
      site_settings: {
        Row: SiteSettingRow;
        Insert: SiteSettingRow;
        Update: Partial<SiteSettingRow>;
      };
      reports: {
        Row: ReportRow;
        Insert: Omit<ReportRow, "id" | "created_at">;
        Update: Partial<ReportRow>;
      };
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatar_url: string;
  role: "user" | "admin";
  whatsapp: string;
  company: string;
  created_at: string;
  banned: boolean;
}

export interface SupplierRow {
  id: string;
  slug: string;
  name: string;
  name_ja: string;
  logo: string;
  category: string;
  category_ja: string;
  category_2?: string;
  category_2_ja?: string;
  category_3?: string;
  category_3_ja?: string;
  catalog_url?: string;
  image_2?: string;
  image_3?: string;
  whatsapp_contact_name?: string;
  tags: string[];
  area: string;
  area_ja: string;
  description: string;
  description_ja: string;
  whatsapp: string;
  views: number;
  certifications: string[];
  about: string;
  featured: boolean;
  plan: "basic" | "standard" | "premium";
  plan_expires_at: string | null;
  created_at: string;
}

export interface SupplierProductRow {
  id: string;
  supplier_id: string;
  name: string;
  image: string;
  moq: string;
}

export interface MarketplaceItemRow {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  area: string;
  condition: string;
  years_used: number;
  description: string;
  category: string;
  seller_id: string;
  seller_name: string;
  seller_whatsapp: string;
  created_at: string;
  status: "approved" | "pending" | "rejected";
  delivery: string;
  reject_reason: string | null;
}

export interface NewsArticleRow {
  id: string;
  slug: string;
  title: string;
  title_ja: string;
  excerpt: string;
  excerpt_ja: string;
  content: string;
  content_ja: string;
  image: string;
  category: string;
  author: string;
  published: boolean;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  type: "supplier" | "marketplace" | "news";
  value: string;
  label: string;
  sort_order: number;
}

export interface SiteSettingRow {
  key: string;
  value: string;
}

export interface ReportRow {
  id: string;
  item_type: "marketplace_item" | "supplier";
  item_id: string;
  reporter_id: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
}
