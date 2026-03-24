"use client";

import { SocialShareBar } from "@/components/social-share-bar";

type Props = {
  /** Full URL when env is set; otherwise copy uses origin + path on the client. */
  absoluteUrl: string | null;
  path: string;
  accentBorder: string;
  accentText: string;
};

export function StorefrontShareBar({ absoluteUrl, path, accentBorder, accentText }: Props) {
  return (
    <SocialShareBar
      absoluteUrl={absoluteUrl}
      path={path}
      headline="Share storefront"
      nativeShareTitle="Developer storefront on MCMerchant"
      shareSummary="Check out this Minecraft plugin developer storefront on MCMerchant."
      accentBorder={accentBorder}
      accentText={accentText}
    />
  );
}
