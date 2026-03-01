export interface Supplier {
  id: string;
  slug: string;
  name: string;
  nameJa: string;
  logo: string;
  category: string;
  categoryJa: string;
  tags: string[];
  area: string;
  areaJa: string;
  description: string;
  descriptionJa: string;
  whatsapp: string;
  views: number;
  products: Product[];
  certifications: string[];
  about: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  moq: string;
}

export interface MarketplaceItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  images: string[];
  area: string;
  condition: string;
  yearsUsed: number;
  description: string;
  category: string;
  sellerId: string;
  sellerName: string;
  sellerWhatsapp: string;
  createdAt: string;
  status: 'approved' | 'pending';
  delivery: string;
}

export const categories = [
  { value: 'seafood', label: '海鮮・鮮魚' },
  { value: 'meat', label: '肉類' },
  { value: 'vegetables', label: '野菜・青果' },
  { value: 'dairy', label: '乳製品' },
  { value: 'dry-goods', label: '乾物・調味料' },
  { value: 'beverages', label: '飲料・酒類' },
  { value: 'equipment', label: '厨房機器' },
  { value: 'packaging', label: '包装・容器' },
];

export const areas = [
  { value: 'central', label: '中央エリア' },
  { value: 'east', label: '東部エリア' },
  { value: 'west', label: '西部エリア' },
  { value: 'north', label: '北部エリア' },
  { value: 'south', label: '南部エリア' },
];

export const suppliers: Supplier[] = [
  {
    id: '1',
    slug: 'tokyo-seafood',
    name: 'Tokyo Seafood Co.',
    nameJa: '東京シーフード株式会社',
    logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop',
    category: 'seafood',
    categoryJa: '海鮮・鮮魚',
    tags: ['少量対応', '日本語対応', 'ハラール'],
    area: 'central',
    areaJa: '中央エリア',
    description: 'Premium seafood supplier with daily fresh catches',
    descriptionJa: '毎日新鮮な魚介類を提供する高品質シーフードサプライヤー。築地から直送。',
    whatsapp: '6512345678',
    views: 1250,
    products: [
      { id: 'p1', name: 'マグロ（本マグロ）', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop', moq: '1kg〜' },
      { id: 'p2', name: 'サーモン（ノルウェー産）', image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop', moq: '2kg〜' },
      { id: 'p3', name: 'エビ（ブラックタイガー）', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop', moq: '1kg〜' },
    ],
    certifications: ['HACCP', 'ISO 22000', 'ハラール認証'],
    about: '2005年創業。シンガポールの日本料理店を中心に、最高品質の鮮魚を毎日お届けしています。築地市場との直接取引により、常に新鮮な商品をご提供いたします。',
  },
  {
    id: '2',
    slug: 'green-harvest',
    name: 'Green Harvest Pte Ltd',
    nameJa: 'グリーンハーベスト',
    logo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=200&fit=crop',
    category: 'vegetables',
    categoryJa: '野菜・青果',
    tags: ['少量対応', 'オーガニック'],
    area: 'north',
    areaJa: '北部エリア',
    description: 'Organic vegetables and herbs supplier',
    descriptionJa: 'オーガニック野菜とハーブの専門サプライヤー。地元農園から新鮮直送。',
    whatsapp: '6523456789',
    views: 980,
    products: [
      { id: 'p4', name: '有機レタスミックス', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop', moq: '500g〜' },
      { id: 'p5', name: 'フレッシュハーブセット', image: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=400&h=300&fit=crop', moq: '100g〜' },
    ],
    certifications: ['有機JAS', 'GlobalGAP'],
    about: 'シンガポール北部の自社農園で栽培したオーガニック野菜を、レストランやカフェに直接お届けしています。',
  },
  {
    id: '3',
    slug: 'asia-meat-supply',
    name: 'Asia Meat Supply',
    nameJa: 'アジアミートサプライ',
    logo: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=200&h=200&fit=crop',
    category: 'meat',
    categoryJa: '肉類',
    tags: ['ハラール', '大量注文可', '翌日配送'],
    area: 'west',
    areaJa: '西部エリア',
    description: 'Halal certified meat supplier',
    descriptionJa: 'ハラール認証済み。和牛からチキンまで幅広い肉類を取り扱い。',
    whatsapp: '6534567890',
    views: 1500,
    products: [
      { id: 'p6', name: 'A5和牛サーロイン', image: 'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=400&h=300&fit=crop', moq: '500g〜' },
      { id: 'p7', name: 'ハラールチキン', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop', moq: '2kg〜' },
    ],
    certifications: ['ハラール認証', 'HACCP'],
    about: 'アジア各国から厳選した肉類を、シンガポール全土のレストランにお届けしています。ハラール認証取得済み。',
  },
  {
    id: '4',
    slug: 'sakura-beverages',
    name: 'Sakura Beverages',
    nameJa: 'さくらビバレッジ',
    logo: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&h=200&fit=crop',
    category: 'beverages',
    categoryJa: '飲料・酒類',
    tags: ['日本語対応', '少量対応', '日本酒専門'],
    area: 'central',
    areaJa: '中央エリア',
    description: 'Japanese sake and beverages specialist',
    descriptionJa: '日本酒・焼酎を中心とした飲料の専門卸。蔵元直送の希少銘柄も取扱。',
    whatsapp: '6545678901',
    views: 870,
    products: [
      { id: 'p8', name: '純米大吟醸セット', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop', moq: '6本〜' },
    ],
    certifications: ['酒類販売免許'],
    about: '日本全国の蔵元と直接取引し、シンガポールの日本料理店に最高品質の日本酒をお届けしています。',
  },
  {
    id: '5',
    slug: 'pacific-dry-goods',
    name: 'Pacific Dry Goods',
    nameJa: 'パシフィック乾物',
    logo: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop',
    category: 'dry-goods',
    categoryJa: '乾物・調味料',
    tags: ['少量対応', '日本語対応'],
    area: 'east',
    areaJa: '東部エリア',
    description: 'Japanese condiments and dry goods',
    descriptionJa: '味噌、醤油、だし等の和食調味料と乾物を幅広く取り扱い。',
    whatsapp: '6556789012',
    views: 720,
    products: [
      { id: 'p9', name: '有機醤油（1L）', image: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=400&h=300&fit=crop', moq: '6本〜' },
      { id: 'p10', name: '信州味噌', image: 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?w=400&h=300&fit=crop', moq: '1kg〜' },
    ],
    certifications: ['食品衛生管理者'],
    about: '日本の伝統的な調味料と乾物を専門に取り扱う卸売業者です。シンガポール在住の日本人シェフに愛用されています。',
  },
  {
    id: '6',
    slug: 'kitchen-pro-equipment',
    name: 'Kitchen Pro Equipment',
    nameJa: 'キッチンプロ機器',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    category: 'equipment',
    categoryJa: '厨房機器',
    tags: ['設置サポート', 'メンテナンス対応'],
    area: 'south',
    areaJa: '南部エリア',
    description: 'Commercial kitchen equipment supplier',
    descriptionJa: '業務用厨房機器の販売・設置・メンテナンスまでワンストップで対応。',
    whatsapp: '6567890123',
    views: 650,
    products: [
      { id: 'p11', name: '業務用冷蔵庫', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop', moq: '1台〜' },
    ],
    certifications: ['ISO 9001'],
    about: 'シンガポール全土のレストラン・ホテルに業務用厨房機器を提供しています。設置からアフターメンテナンスまで一貫サポート。',
  },
];

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 'm1',
    slug: 'commercial-oven-used',
    title: '業務用コンベクションオーブン',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&h=450&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    ],
    area: '中央エリア',
    condition: '良好',
    yearsUsed: 2,
    description: '閉店のため出品。まだまだ使えます。定期メンテナンス済み。即日引き取り可能。',
    category: '厨房機器',
    sellerId: 'u1',
    sellerName: '田中シェフ',
    sellerWhatsapp: '6512345678',
    createdAt: '2024-01-15',
    status: 'approved',
    delivery: '引き取りのみ',
  },
  {
    id: 'm2',
    slug: 'sushi-counter-set',
    title: '寿司カウンターセット（檜製）',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=450&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop',
    ],
    area: '東部エリア',
    condition: '良好',
    yearsUsed: 3,
    description: '檜の寿司カウンター。8席分。移転のためお譲りします。',
    category: '厨房機器',
    sellerId: 'u2',
    sellerName: '佐藤',
    sellerWhatsapp: '6523456789',
    createdAt: '2024-01-12',
    status: 'approved',
    delivery: '配送可能',
  },
  {
    id: 'm3',
    slug: 'ramen-bowls-set',
    title: 'ラーメン丼セット（50個）',
    price: 350,
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=450&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&h=600&fit=crop',
    ],
    area: '西部エリア',
    condition: '新品同様',
    yearsUsed: 0,
    description: '未使用のラーメン丼50個セット。メニュー変更のため出品。',
    category: '食器・備品',
    sellerId: 'u3',
    sellerName: '鈴木',
    sellerWhatsapp: '6534567890',
    createdAt: '2024-01-10',
    status: 'approved',
    delivery: '引き取り・配送可',
  },
  {
    id: 'm4',
    slug: 'ice-cream-machine',
    title: '業務用アイスクリームマシン',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600&h=450&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800&h=600&fit=crop',
    ],
    area: '北部エリア',
    condition: '使用感あり',
    yearsUsed: 4,
    description: 'まだ動作します。メンテナンス記録あり。',
    category: '厨房機器',
    sellerId: 'u4',
    sellerName: '山田',
    sellerWhatsapp: '6545678901',
    createdAt: '2024-01-08',
    status: 'approved',
    delivery: '引き取りのみ',
  },
  {
    id: 'm5',
    slug: 'chef-knives-set',
    title: '包丁セット（堺製）5本',
    price: 890,
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=450&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&h=600&fit=crop',
    ],
    area: '中央エリア',
    condition: '良好',
    yearsUsed: 1,
    description: '堺の職人が作った和包丁5本セット。出刃、柳刃、薄刃、菜切、牛刀。',
    category: '調理器具',
    sellerId: 'u5',
    sellerName: '高橋シェフ',
    sellerWhatsapp: '6556789012',
    createdAt: '2024-01-05',
    status: 'approved',
    delivery: '配送可能',
  },
  {
    id: 'm6',
    slug: 'restaurant-tables',
    title: 'レストランテーブル4台セット',
    price: 600,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=450&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    ],
    area: '南部エリア',
    condition: '良好',
    yearsUsed: 2,
    description: '4人掛けテーブル4台。木製天板、鉄脚。店舗改装のため出品。',
    category: '家具',
    sellerId: 'u6',
    sellerName: '中村',
    sellerWhatsapp: '6567890123',
    createdAt: '2024-01-03',
    status: 'approved',
    delivery: '引き取りのみ',
  },
];

export const marketplaceCategories = [
  { value: 'kitchen-equipment', label: '厨房機器' },
  { value: 'tableware', label: '食器・備品' },
  { value: 'tools', label: '調理器具' },
  { value: 'furniture', label: '家具' },
  { value: 'other', label: 'その他' },
];

export const conditions = [
  { value: 'like-new', label: '新品同様' },
  { value: 'good', label: '良好' },
  { value: 'used', label: '使用感あり' },
  { value: 'needs-repair', label: '要修理' },
];
