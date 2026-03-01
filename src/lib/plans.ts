export type PlanTier = "basic" | "standard" | "premium";

export interface PlanConfig {
  tier: PlanTier;
  /** Numeric weight used for sorting — higher = higher priority */
  weight: number;
  labelEn: string;
  labelJa: string;
  /** Tailwind classes for the badge */
  badgeClass: string;
  /** Tailwind border classes applied to the card */
  borderClass: string;
  /** Show WhatsApp button (basic hides it to encourage upgrade) */
  showWhatsApp: boolean;
  /** Max product images shown on detail page */
  maxProducts: number;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  premium: {
    tier: "premium",
    weight: 3,
    labelEn: "Premium",
    labelJa: "プレミアム",
    badgeClass:
      "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400",
    borderClass: "border-amber-400 shadow-amber-100 dark:shadow-amber-900/20",
    showWhatsApp: true,
    maxProducts: 12,
  },
  standard: {
    tier: "standard",
    weight: 2,
    labelEn: "Standard",
    labelJa: "スタンダード",
    badgeClass:
      "bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-900/30 dark:text-sky-400",
    borderClass: "border-sky-300",
    showWhatsApp: true,
    maxProducts: 6,
  },
  basic: {
    tier: "basic",
    weight: 1,
    labelEn: "Basic",
    labelJa: "ベーシック",
    badgeClass:
      "bg-muted text-muted-foreground border border-border",
    borderClass: "",
    showWhatsApp: false,
    maxProducts: 3,
  },
};

export function getPlanConfig(plan?: string | null): PlanConfig {
  return PLANS[(plan as PlanTier) ?? "basic"] ?? PLANS.basic;
}

/**
 * Mulberry32 — deterministic PRNG seeded with an integer.
 * Returns values in [0, 1).
 */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a seed integer derived from today's local date string (YYYY-MM-DD).
 * Changes every day at midnight → different shuffle every day.
 */
export function dailySeed(): number {
  const dateStr = new Date().toLocaleDateString("en-CA"); // "2024-06-15"
  return dateStr.split("-").reduce((acc, part) => acc * 1000 + parseInt(part, 10), 0);
}

/** Fisher-Yates shuffle using a seeded PRNG — same seed → same order. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sorts suppliers by plan tier (premium first) and shuffles within each tier
 * using today's date as seed for fair, daily-rotating exposure.
 */
export function sortSuppliersByPlan<T extends { plan?: string | null }>(
  suppliers: T[]
): T[] {
  const premium = suppliers.filter((s) => s.plan === "premium");
  const standard = suppliers.filter((s) => s.plan === "standard");
  const basic = suppliers.filter((s) => !s.plan || s.plan === "basic");

  const seed = dailySeed();
  return [
    ...seededShuffle(premium, seed),
    ...seededShuffle(standard, seed + 1),
    ...seededShuffle(basic, seed + 2),
  ];
}
