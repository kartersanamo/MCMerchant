import { NextResponse } from "next/server";
import { requireVerifiedUserForRlsApi } from "@/lib/auth/email-verification";

function parseTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gate = await requireVerifiedUserForRlsApi();
    if (gate instanceof NextResponse) return gate;
    const { supabase, userId: sellerId } = gate;

    const { data: existing } = await supabase
      .from("plugins")
      .select("id, seller_id, slug")
      .eq("id", params.id)
      .maybeSingle();

    if (!existing || existing.seller_id !== sellerId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") != null ? String(formData.get("name")) : undefined;
    const slug = formData.get("slug") != null ? String(formData.get("slug")) : undefined;
    const tagline = formData.get("tagline") != null ? String(formData.get("tagline")) : undefined;
    const description = formData.get("description") != null ? String(formData.get("description")) : undefined;
    const category = formData.get("category") != null ? String(formData.get("category")) : undefined;
    const tagsRaw = formData.get("tags") != null ? String(formData.get("tags")) : undefined;
    const status = formData.get("status") != null ? (String(formData.get("status")) as "draft" | "published") : undefined;
    const isFree = formData.get("is_free") != null ? String(formData.get("is_free")) === "true" : undefined;
    const priceDollars = formData.get("price_dollars") != null ? String(formData.get("price_dollars")) : undefined;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (tagline !== undefined) updates.tagline = tagline;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;
    if (tagsRaw !== undefined) updates.tags = parseTags(tagsRaw);

    if (isFree !== undefined && priceDollars !== undefined) {
      updates.price_cents = isFree ? 0 : Math.round(Number(priceDollars) * 100);
    }

    const coverFile = formData.get("cover_image");
    if (coverFile && typeof (coverFile as File).arrayBuffer === "function") {
      const file = coverFile as File;
      const ext = file.name.split(".").pop() ?? "png";
      const path = `covers/${sellerId}/${existing.slug}-${Date.now()}.${ext}`;
      const uploadRes = await supabase.storage
        .from("plugin-images")
        .upload(path, file, { contentType: file.type });

      if (!uploadRes.error) {
        const { data } = supabase.storage.from("plugin-images").getPublicUrl(path);
        updates.cover_image_url = data.publicUrl;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ id: params.id }, { status: 200 });
    }

    const { error } = await supabase
      .from("plugins")
      .update(updates)
      .eq("id", params.id)
      .eq("seller_id", sellerId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ id: params.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal_error" }, { status: 500 });
  }
}
