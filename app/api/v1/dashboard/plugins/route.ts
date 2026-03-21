import { NextResponse } from "next/server";
import { requireVerifiedUserForRlsApi } from "@/lib/auth/email-verification";

function parseTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function POST(request: Request) {
  try {
    const gate = await requireVerifiedUserForRlsApi();
    if (gate instanceof NextResponse) return gate;
    const { supabase, userId: sellerId } = gate;

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "");
    const slug = String(formData.get("slug") ?? "");
    const tagline = String(formData.get("tagline") ?? "");
    const description = String(formData.get("description") ?? "");
    const category = String(formData.get("category") ?? "economy");
    const tagsRaw = String(formData.get("tags") ?? "");
    const status = (String(formData.get("status") ?? "draft") as any) || "draft";

    const isFree = String(formData.get("is_free") ?? "false") === "true";
    const priceDollars = String(formData.get("price_dollars") ?? "0");
    const priceCents = isFree ? 0 : Math.round(Number(priceDollars) * 100);
    const tags = parseTags(tagsRaw);

    if (!name || !slug || !tagline || !description) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    let coverImageUrl: string | null = null;
    const coverFile = formData.get("cover_image");
    if (coverFile && typeof (coverFile as any).arrayBuffer === "function") {
      const file = coverFile as File;
      const ext = file.name.split(".").pop() ?? "png";
      const path = `covers/${sellerId}/${slug}-${Date.now()}.${ext}`;
      const uploadRes = await supabase.storage
        .from("plugin-images")
        .upload(path, file, { contentType: file.type });

      if (!uploadRes.error) {
        const { data } = supabase.storage.from("plugin-images").getPublicUrl(path);
        coverImageUrl = data.publicUrl;
      }
    }

    const { data: plugin, error } = await supabase
      .from("plugins")
      .insert({
        seller_id: sellerId,
        slug,
        name,
        tagline,
        description,
        price_cents: priceCents,
        category,
        tags,
        cover_image_url: coverImageUrl,
        status
      })
      .select("id")
      .single();

    if (error || !plugin) {
      return NextResponse.json({ error: error?.message ?? "insert_failed" }, { status: 400 });
    }

    return NextResponse.json({ id: plugin.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal_error" }, { status: 500 });
  }
}

