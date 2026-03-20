export const STORE_THEME_IDS = ["brand", "violet", "cyan", "amber", "rose"] as const;
export type StoreThemeId = (typeof STORE_THEME_IDS)[number];

export function resolveStoreTheme(raw: string | null | undefined): StoreThemeId {
  const s = String(raw ?? "").toLowerCase();
  return (STORE_THEME_IDS as readonly string[]).includes(s) ? (s as StoreThemeId) : "brand";
}

export type StorefrontThemeClasses = {
  heroGradient: string;
  heroOverlay: string;
  accentText: string;
  accentMuted: string;
  accentBorder: string;
  accentBg: string;
  ring: string;
  glow: string;
  pillActive: string;
  pillIdle: string;
};

export function getStorefrontThemeClasses(theme: StoreThemeId): StorefrontThemeClasses {
  switch (theme) {
    case "violet":
      return {
        heroGradient: "from-violet-600/25 via-purple-900/20 to-gray-950",
        heroOverlay: "from-gray-950 via-gray-950/85 to-gray-950/55",
        accentText: "text-violet-300",
        accentMuted: "text-violet-200/80",
        accentBorder: "border-violet-500/35",
        accentBg: "bg-violet-500/15",
        ring: "ring-violet-500/40",
        glow: "shadow-violet-500/20",
        pillActive: "bg-violet-500/20 text-violet-100 border-violet-500/40",
        pillIdle: "border-gray-700 bg-gray-900/50 text-gray-300 hover:border-violet-500/30"
      };
    case "cyan":
      return {
        heroGradient: "from-cyan-600/25 via-teal-900/15 to-gray-950",
        heroOverlay: "from-gray-950 via-gray-950/85 to-gray-950/55",
        accentText: "text-cyan-300",
        accentMuted: "text-cyan-200/80",
        accentBorder: "border-cyan-500/35",
        accentBg: "bg-cyan-500/15",
        ring: "ring-cyan-500/40",
        glow: "shadow-cyan-500/15",
        pillActive: "bg-cyan-500/20 text-cyan-100 border-cyan-500/40",
        pillIdle: "border-gray-700 bg-gray-900/50 text-gray-300 hover:border-cyan-500/30"
      };
    case "amber":
      return {
        heroGradient: "from-amber-600/25 via-orange-900/15 to-gray-950",
        heroOverlay: "from-gray-950 via-gray-950/85 to-gray-950/55",
        accentText: "text-amber-300",
        accentMuted: "text-amber-200/80",
        accentBorder: "border-amber-500/35",
        accentBg: "bg-amber-500/15",
        ring: "ring-amber-500/40",
        glow: "shadow-amber-500/15",
        pillActive: "bg-amber-500/20 text-amber-100 border-amber-500/40",
        pillIdle: "border-gray-700 bg-gray-900/50 text-gray-300 hover:border-amber-500/30"
      };
    case "rose":
      return {
        heroGradient: "from-rose-600/25 via-pink-900/15 to-gray-950",
        heroOverlay: "from-gray-950 via-gray-950/85 to-gray-950/55",
        accentText: "text-rose-300",
        accentMuted: "text-rose-200/80",
        accentBorder: "border-rose-500/35",
        accentBg: "bg-rose-500/15",
        ring: "ring-rose-500/40",
        glow: "shadow-rose-500/15",
        pillActive: "bg-rose-500/20 text-rose-100 border-rose-500/40",
        pillIdle: "border-gray-700 bg-gray-900/50 text-gray-300 hover:border-rose-500/30"
      };
    case "brand":
    default:
      return {
        heroGradient: "from-brand-500/25 via-purple-600/15 to-gray-950",
        heroOverlay: "from-gray-950 via-gray-950/85 to-gray-950/55",
        accentText: "text-brand-300",
        accentMuted: "text-brand-200/80",
        accentBorder: "border-brand-500/40",
        accentBg: "bg-brand-500/15",
        ring: "ring-brand-500/45",
        glow: "shadow-brand-500/20",
        pillActive: "bg-brand-500/20 text-brand-100 border-brand-500/50",
        pillIdle: "border-gray-700 bg-gray-900/50 text-gray-300 hover:border-brand-500/35"
      };
  }
}

export function normalizeStoreThemeInput(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim().toLowerCase();
  if (!s) return null;
  if ((STORE_THEME_IDS as readonly string[]).includes(s)) return s;
  return null;
}
