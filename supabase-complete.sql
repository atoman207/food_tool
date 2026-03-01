-- ================================================================
-- Singapore F&B Portal — Complete Database Setup v3.0
-- Combines: schema + migration (username/avatar) + seed data
--
-- ✅ Safe to run on a brand-new project
-- ✅ Safe to re-run on an existing project (fully idempotent)
--
-- How to run:
--   Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- 1. TABLES
-- ──────────────────────────────────────────────────────────────

-- Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email       text        NOT NULL,
  name        text        NOT NULL DEFAULT '',
  username    text        UNIQUE,
  avatar_url  text        DEFAULT '',
  role        text        NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  whatsapp    text        DEFAULT '',
  company     text        DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  banned      boolean     DEFAULT false
);
-- Add new columns if the table already existed without them
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username   text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '';
-- Unique index on username (NULLs are not considered duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (username) WHERE username IS NOT NULL;

-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            text        UNIQUE NOT NULL,
  name            text        NOT NULL,
  name_ja         text        NOT NULL,
  logo            text        DEFAULT '',
  category        text        NOT NULL,
  category_ja     text        DEFAULT '',
  tags            text[]      DEFAULT '{}',
  area            text        NOT NULL,
  area_ja         text        DEFAULT '',
  description     text        DEFAULT '',
  description_ja  text        DEFAULT '',
  whatsapp        text        DEFAULT '',
  views           integer     DEFAULT 0,
  certifications  text[]      DEFAULT '{}',
  about           text        DEFAULT '',
  featured        boolean     DEFAULT false,
  plan            text        NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic','standard','premium')),
  plan_expires_at timestamptz,
  created_at      timestamptz DEFAULT now()
);
-- Add plan columns if table already existed without them
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS plan            text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic','standard','premium'));
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- Supplier Products
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id uuid REFERENCES public.suppliers ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  image       text DEFAULT '',
  moq         text DEFAULT ''
);

-- Marketplace Items
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             text        UNIQUE NOT NULL,
  title            text        NOT NULL,
  price            numeric     NOT NULL DEFAULT 0,
  image            text        DEFAULT '',
  images           text[]      DEFAULT '{}',
  area             text        DEFAULT '',
  condition        text        DEFAULT '',
  years_used       integer     DEFAULT 0,
  description      text        DEFAULT '',
  category         text        DEFAULT '',
  seller_id        uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_name      text        DEFAULT '',
  seller_whatsapp  text        DEFAULT '',
  created_at       timestamptz DEFAULT now(),
  status           text        DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  delivery         text        DEFAULT '',
  reject_reason    text
);

-- News Articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text        UNIQUE NOT NULL,
  title       text        NOT NULL,
  title_ja    text        DEFAULT '',
  excerpt     text        DEFAULT '',
  excerpt_ja  text        DEFAULT '',
  content     text        DEFAULT '',
  content_ja  text        DEFAULT '',
  image       text        DEFAULT '',
  category    text        DEFAULT '',
  author      text        DEFAULT '',
  published   boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  type       text    NOT NULL CHECK (type IN ('supplier','marketplace','news')),
  value      text    NOT NULL,
  label      text    NOT NULL,
  sort_order integer DEFAULT 0
);

-- Site Settings (key-value store)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type   text        NOT NULL CHECK (item_type IN ('marketplace_item','supplier')),
  item_id     uuid        NOT NULL,
  reporter_id uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason      text        NOT NULL,
  status      text        DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY — enable on every table
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 3. RLS POLICIES (drop first → idempotent re-run)
-- ──────────────────────────────────────────────────────────────

-- profiles
DROP POLICY IF EXISTS "Public read"      ON public.profiles;
DROP POLICY IF EXISTS "Users insert own" ON public.profiles;
DROP POLICY IF EXISTS "Users update own" ON public.profiles;
CREATE POLICY "Public read"      ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- suppliers
DROP POLICY IF EXISTS "Public read" ON public.suppliers;
DROP POLICY IF EXISTS "Admin full"  ON public.suppliers;
CREATE POLICY "Public read" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Admin full"  ON public.suppliers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- supplier_products
DROP POLICY IF EXISTS "Public read" ON public.supplier_products;
DROP POLICY IF EXISTS "Admin full"  ON public.supplier_products;
CREATE POLICY "Public read" ON public.supplier_products FOR SELECT USING (true);
CREATE POLICY "Admin full"  ON public.supplier_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- marketplace_items
DROP POLICY IF EXISTS "Public read approved" ON public.marketplace_items;
DROP POLICY IF EXISTS "Users insert own"     ON public.marketplace_items;
DROP POLICY IF EXISTS "Users update own"     ON public.marketplace_items;
DROP POLICY IF EXISTS "Users delete own"     ON public.marketplace_items;
CREATE POLICY "Public read approved" ON public.marketplace_items FOR SELECT USING (
  status = 'approved' OR seller_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users insert own" ON public.marketplace_items FOR INSERT
  WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Users update own" ON public.marketplace_items FOR UPDATE USING (
  seller_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users delete own" ON public.marketplace_items FOR DELETE USING (
  seller_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- news_articles
DROP POLICY IF EXISTS "Public read published" ON public.news_articles;
DROP POLICY IF EXISTS "Admin full"            ON public.news_articles;
CREATE POLICY "Public read published" ON public.news_articles FOR SELECT USING (
  published = true OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full" ON public.news_articles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- categories
DROP POLICY IF EXISTS "Public read" ON public.categories;
DROP POLICY IF EXISTS "Admin full"  ON public.categories;
CREATE POLICY "Public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin full"  ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- site_settings
DROP POLICY IF EXISTS "Public read" ON public.site_settings;
DROP POLICY IF EXISTS "Admin full"  ON public.site_settings;
CREATE POLICY "Public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full"  ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- reports
DROP POLICY IF EXISTS "Users insert" ON public.reports;
DROP POLICY IF EXISTS "Admin read"   ON public.reports;
DROP POLICY IF EXISTS "Admin update" ON public.reports;
CREATE POLICY "Users insert" ON public.reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admin read"   ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ──────────────────────────────────────────────────────────────
-- 4. FUNCTION + TRIGGER — auto-create profile on signup
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name       = COALESCE(EXCLUDED.name,       public.profiles.name),
    username   = COALESCE(EXCLUDED.username,   public.profiles.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 5. STORAGE — avatars bucket + policies
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Avatar public read"           ON storage.objects;
DROP POLICY IF EXISTS "Avatar authenticated upload"  ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner update"          ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner delete"          ON storage.objects;

CREATE POLICY "Avatar public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Avatar owner update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatar owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ──────────────────────────────────────────────────────────────
-- 6. SEED — settings & categories
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.site_settings (key, value) VALUES
  ('qr_redirect_url',  '/suppliers'),
  ('banner_title',     'シンガポールF&Bポータルへようこそ'),
  ('banner_subtitle',  '信頼できるサプライヤーを見つけましょう'),
  ('daily_post_limit', '5'),
  ('areas', '[{"value":"central","label":"中央エリア"},{"value":"east","label":"東部エリア"},{"value":"west","label":"西部エリア"},{"value":"north","label":"北部エリア"},{"value":"south","label":"南部エリア"}]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.categories (type, value, label, sort_order) VALUES
  ('supplier',     'seafood',           '海鮮・鮮魚',  1),
  ('supplier',     'meat',              '肉類',        2),
  ('supplier',     'vegetables',        '野菜・青果',  3),
  ('supplier',     'dairy',             '乳製品',      4),
  ('supplier',     'dry-goods',         '乾物・調味料',5),
  ('supplier',     'beverages',         '飲料・酒類',  6),
  ('supplier',     'equipment',         '厨房機器',    7),
  ('supplier',     'packaging',         '包装・容器',  8),
  ('marketplace',  'kitchen-equipment', '厨房機器',    1),
  ('marketplace',  'tableware',         '食器・備品',  2),
  ('marketplace',  'tools',             '調理器具',    3),
  ('marketplace',  'furniture',         '家具',        4),
  ('marketplace',  'other',             'その他',      5),
  ('news',         'industry',          '業界ニュース',1),
  ('news',         'regulation',        '規制・法律',  2),
  ('news',         'trend',             'トレンド',    3),
  ('news',         'event',             'イベント',    4)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 7. SEED — suppliers
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.suppliers
  (id, slug, name, name_ja, logo, category, category_ja,
   tags, area, area_ja, description, description_ja,
   whatsapp, views, certifications, about, featured, plan)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'tokyo-seafood', 'Tokyo Seafood Co.', '東京シーフード株式会社',
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    'seafood', '海鮮・鮮魚',
    ARRAY['少量対応','日本語対応','ハラール'],
    'central', '中央エリア',
    'Premium seafood supplier with daily fresh catches',
    '毎日新鮮な魚介類を提供する高品質シーフードサプライヤー。築地から直送。',
    '6512345678', 1250, ARRAY['HACCP','ISO 22000','ハラール認証'],
    '2005年創業。シンガポールの日本料理店を中心に、最高品質の鮮魚を毎日お届けしています。築地市場との直接取引により、常に新鮮な商品をご提供いたします。',
    true, 'premium'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'green-harvest', 'Green Harvest Pte Ltd', 'グリーンハーベスト',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=200&fit=crop',
    'vegetables', '野菜・青果',
    ARRAY['少量対応','オーガニック'],
    'north', '北部エリア',
    'Organic vegetables and herbs supplier',
    'オーガニック野菜とハーブの専門サプライヤー。地元農園から新鮮直送。',
    '6523456789', 980, ARRAY['有機JAS','GlobalGAP'],
    'シンガポール北部の自社農園で栽培したオーガニック野菜を、レストランやカフェに直接お届けしています。',
    false, 'standard'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'asia-meat-supply', 'Asia Meat Supply', 'アジアミートサプライ',
    'https://images.unsplash.com/photo-1588347818036-558601350947?w=200&h=200&fit=crop',
    'meat', '肉類',
    ARRAY['ハラール','大量注文可','翌日配送'],
    'west', '西部エリア',
    'Halal certified meat supplier',
    'ハラール認証済み。和牛からチキンまで幅広い肉類を取り扱い。',
    '6534567890', 1500, ARRAY['ハラール認証','HACCP'],
    'アジア各国から厳選した肉類を、シンガポール全土のレストランにお届けしています。ハラール認証取得済み。',
    true, 'premium'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'sakura-beverages', 'Sakura Beverages', 'さくらビバレッジ',
    'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop',
    'beverages', '飲料・酒類',
    ARRAY['日本語対応','少量対応','日本酒専門'],
    'central', '中央エリア',
    'Japanese sake and beverages specialist',
    '日本酒・焼酎を中心とした飲料の専門卸。蔵元直送の希少銘柄も取扱。',
    '6545678901', 870, ARRAY['酒類販売免許'],
    '日本全国の蔵元と直接取引し、シンガポールの日本料理店に最高品質の日本酒をお届けしています。',
    false, 'standard'
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'pacific-dry-goods', 'Pacific Dry Goods', 'パシフィック乾物',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop',
    'dry-goods', '乾物・調味料',
    ARRAY['少量対応','日本語対応'],
    'east', '東部エリア',
    'Japanese condiments and dry goods',
    '味噌、醤油、だし等の和食調味料と乾物を幅広く取り扱い。',
    '6556789012', 720, ARRAY['食品衛生管理者'],
    '日本の伝統的な調味料と乾物を専門に取り扱う卸売業者です。シンガポール在住の日本人シェフに愛用されています。',
    false, 'basic'
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'kitchen-pro-equipment', 'Kitchen Pro Equipment', 'キッチンプロ機器',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    'equipment', '厨房機器',
    ARRAY['設置サポート','メンテナンス対応'],
    'south', '南部エリア',
    'Commercial kitchen equipment supplier',
    '業務用厨房機器の販売・設置・メンテナンスまでワンストップで対応。',
    '6567890123', 650, ARRAY['ISO 9001'],
    'シンガポール全土のレストラン・ホテルに業務用厨房機器を提供しています。設置からアフターメンテナンスまで一貫サポート。',
    false, 'basic'
  )
ON CONFLICT (slug) DO UPDATE SET
  views    = EXCLUDED.views,
  featured = EXCLUDED.featured,
  plan     = EXCLUDED.plan;

-- ──────────────────────────────────────────────────────────────
-- 8. SEED — supplier products
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.supplier_products (supplier_id, name, image, moq)
SELECT s.id, p.name, p.image, p.moq
FROM (VALUES
  ('tokyo-seafood',        'マグロ（本マグロ）',       'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop', '1kg〜'),
  ('tokyo-seafood',        'サーモン（ノルウェー産）', 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop', '2kg〜'),
  ('tokyo-seafood',        'エビ（ブラックタイガー）', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop', '1kg〜'),
  ('green-harvest',        '有機レタスミックス',       'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop', '500g〜'),
  ('green-harvest',        'フレッシュハーブセット',   'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=400&h=300&fit=crop', '100g〜'),
  ('asia-meat-supply',     'A5和牛サーロイン',         'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=400&h=300&fit=crop', '500g〜'),
  ('asia-meat-supply',     'ハラールチキン',           'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop', '2kg〜'),
  ('sakura-beverages',     '純米大吟醸セット',         'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop', '6本〜'),
  ('pacific-dry-goods',    '有機醤油（1L）',           'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=400&h=300&fit=crop', '6本〜'),
  ('pacific-dry-goods',    '信州味噌',                 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?w=400&h=300&fit=crop', '1kg〜'),
  ('kitchen-pro-equipment','業務用冷蔵庫',             'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop', '1台〜')
) AS p(slug, name, image, moq)
JOIN public.suppliers s ON s.slug = p.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.supplier_products sp WHERE sp.supplier_id = s.id AND sp.name = p.name
);

-- ──────────────────────────────────────────────────────────────
-- 9. SEED — marketplace items
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.marketplace_items
  (slug, title, price, image, images, area, condition, years_used,
   description, category, seller_id, seller_name, seller_whatsapp,
   created_at, status, delivery)
VALUES
  ('commercial-oven-used',  '業務用コンベクションオーブン', 2500,
   'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&h=450&fit=crop',
   ARRAY['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&h=600&fit=crop',
         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'],
   '中央エリア','良好',2,'閉店のため出品。まだまだ使えます。定期メンテナンス済み。即日引き取り可能。',
   '厨房機器',NULL,'田中シェフ','6512345678','2024-01-15 00:00:00+00','approved','引き取りのみ'),

  ('sushi-counter-set',     '寿司カウンターセット（檜製）', 4800,
   'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=450&fit=crop',
   ARRAY['https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop'],
   '東部エリア','良好',3,'檜の寿司カウンター。8席分。移転のためお譲りします。',
   '厨房機器',NULL,'佐藤','6523456789','2024-01-12 00:00:00+00','approved','配送可能'),

  ('ramen-bowls-set',       'ラーメン丼セット（50個）', 350,
   'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=450&fit=crop',
   ARRAY['https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&h=600&fit=crop'],
   '西部エリア','新品同様',0,'未使用のラーメン丼50個セット。メニュー変更のため出品。',
   '食器・備品',NULL,'鈴木','6534567890','2024-01-10 00:00:00+00','approved','引き取り・配送可'),

  ('ice-cream-machine',     '業務用アイスクリームマシン', 1800,
   'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600&h=450&fit=crop',
   ARRAY['https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800&h=600&fit=crop'],
   '北部エリア','使用感あり',4,'まだ動作します。メンテナンス記録あり。',
   '厨房機器',NULL,'山田','6545678901','2024-01-08 00:00:00+00','approved','引き取りのみ'),

  ('chef-knives-set',       '包丁セット（堺製）5本', 890,
   'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=450&fit=crop',
   ARRAY['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&h=600&fit=crop'],
   '中央エリア','良好',1,'堺の職人が作った和包丁5本セット。出刃、柳刃、薄刃、菜切、牛刀。',
   '調理器具',NULL,'高橋シェフ','6556789012','2024-01-05 00:00:00+00','approved','配送可能'),

  ('restaurant-tables',     'レストランテーブル4台セット', 600,
   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=450&fit=crop',
   ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'],
   '南部エリア','良好',2,'4人掛けテーブル4台。木製天板、鉄脚。店舗改装のため出品。',
   '家具',NULL,'中村','6567890123','2024-01-03 00:00:00+00','approved','引き取りのみ')

ON CONFLICT (slug) DO UPDATE SET
  status = EXCLUDED.status,
  price  = EXCLUDED.price;

-- ──────────────────────────────────────────────────────────────
-- 10. SEED — news articles
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.news_articles
  (slug, title, title_ja, excerpt, excerpt_ja, content, content_ja,
   image, category, author, published)
VALUES
  (
    'singapore-fb-trends-2024',
    'Singapore F&B Industry Trends 2024',
    '2024年シンガポールF&B業界トレンド',
    'Key trends shaping Singapore food service in 2024.',
    '2024年のシンガポール外食産業を形成する主要トレンドを解説します。',
    'The Singapore F&B industry continues to evolve rapidly. Plant-based foods and sustainable sourcing are gaining traction across restaurants and cafes.',
    'シンガポールのF&B業界は急速に進化を続けています。日本料理の需要が高まる中、高品質な食材の安定供給が業界全体の課題となっています。特に2024年は植物性食品と持続可能な調達への関心が高まっています。',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop',
    'industry', '編集部', true
  ),
  (
    'halal-certification-guide',
    'Halal Certification Guide for F&B Suppliers',
    'F&Bサプライヤーのためのハラール認証ガイド',
    'Everything you need to know about halal certification in Singapore.',
    'シンガポールでのハラール認証取得に関する完全ガイドです。',
    'Halal certification is essential for reaching Muslim consumers in Singapore. MUIS oversees halal certification and suppliers must meet specific standards.',
    'ハラール認証は、シンガポールのムスリム消費者にリーチするために不可欠です。シンガポールではMUISがハラール認証を管轄しており、取得には一定の基準を満たす必要があります。',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=450&fit=crop',
    'regulation', '編集部', true
  ),
  (
    'japanese-cuisine-demand-surge',
    'Surge in Japanese Cuisine Demand in Singapore',
    'シンガポールでの日本料理需要急増',
    'Japanese restaurant openings hit record numbers in Singapore.',
    'シンガポールでの日本料理レストランの開業が過去最高を記録しました。',
    'Demand for authentic Japanese cuisine is growing significantly. The first half of 2024 saw record new openings of Japanese restaurants.',
    'シンガポールでの本格的な日本料理への需要が急増しています。2024年上半期の日本料理レストランの新規開業数は過去最高を記録。和食食材の安定調達を求めるレストランオーナーからの問い合わせも増加しています。',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=450&fit=crop',
    'trend', '編集部', true
  )
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 11. ADMIN USER SETUP
-- Confirms email + creates admin profile for Admin@gmail.com
-- (Create the user first: Supabase Dashboard → Auth → Users → Add user,
--  or register at /register with Admin@gmail.com and your password, then run this.)
-- Avatar: Japanese woman in her 20s (professional portrait).
-- ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_uid uuid;
  v_avatar text := 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&facepad=2';
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'Admin@gmail.com';

  IF v_uid IS NULL THEN
    RAISE NOTICE 'Admin user not found in auth.users. Create Admin@gmail.com in Dashboard (Auth → Users → Add user) or register at /register first, then re-run this script.';
  ELSE
    -- Confirm the email so login works without clicking an email link
    UPDATE auth.users
    SET
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = '',
      updated_at         = now()
    WHERE id = v_uid;

    -- Create / update the profile with admin role and avatar (Japanese woman in her 20s)
    INSERT INTO public.profiles (id, email, name, username, avatar_url, role, whatsapp, company, banned)
    VALUES (v_uid, 'Admin@gmail.com', 'Admin', 'admin', v_avatar, 'admin', '', '', false)
    ON CONFLICT (id) DO UPDATE SET
      email     = 'Admin@gmail.com',
      name      = 'Admin',
      username  = 'admin',
      avatar_url = v_avatar,
      role      = 'admin';

    RAISE NOTICE 'Admin setup complete. User ID: %', v_uid;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 12. VERIFY — row counts after setup
-- ──────────────────────────────────────────────────────────────
SELECT table_name, rows FROM (
  SELECT 'profiles'          AS table_name, COUNT(*) AS rows FROM public.profiles          UNION ALL
  SELECT 'suppliers',                       COUNT(*)         FROM public.suppliers          UNION ALL
  SELECT 'supplier_products',               COUNT(*)         FROM public.supplier_products  UNION ALL
  SELECT 'marketplace_items',               COUNT(*)         FROM public.marketplace_items  UNION ALL
  SELECT 'news_articles',                   COUNT(*)         FROM public.news_articles      UNION ALL
  SELECT 'categories',                      COUNT(*)         FROM public.categories         UNION ALL
  SELECT 'site_settings',                   COUNT(*)         FROM public.site_settings      UNION ALL
  SELECT 'reports',                         COUNT(*)         FROM public.reports
) t ORDER BY table_name;
