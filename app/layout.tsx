import type { Metadata } from "next";
import "./globals.css";
import { getAuthedUser } from "@/lib/supabase/server";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Plugdex",
    template: "%s | Plugdex"
  },
  description: "The plugin marketplace built for Minecraft developers",
  icons: {
    icon: "/PlugdexMono.png",
    shortcut: "/PlugdexMono.png",
    apple: "/PlugdexMono.png",
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
        <SiteFooter authedUserId={authedUser?.id ?? null} />
      </body>
    </html>
  );
}

