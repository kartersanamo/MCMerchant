import type { Metadata } from "next";
import "./globals.css";
import { getAuthedUser } from "@/lib/supabase/server";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "MCMerchant",
    template: "%s | MCMerchant"
  },
  description: "The marketplace + licensing + updater channel for Minecraft plugin developers.",
  icons: {
    icon: "/MCMerchantMono.png",
    shortcut: "/MCMerchantMono.png",
    apple: "/MCMerchantMono.png",
  },
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let authedUser: Awaited<ReturnType<typeof getAuthedUser>> = null;
  try {
    authedUser = await getAuthedUser();
  } catch {
    authedUser = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <SiteHeader authedUser={authedUser} />
        <main>{children}</main>
        <SiteFooter authedUser={authedUser} />
      </body>
    </html>
  );
}

