import type { StorefrontThemeClasses } from "@/lib/storefront-theme";

type Props = {
  theme: StorefrontThemeClasses;
  showFeatured: boolean;
  showAbout: boolean;
};

export function StorefrontSubnav({ theme, showFeatured, showAbout }: Props) {
  // Section jump buttons were removed to keep the storefront hero clean.
  // (Featured / catalog / about sections still exist; anchors remain in the page markup.)
  void theme;
  void showFeatured;
  void showAbout;
  return null;
}
