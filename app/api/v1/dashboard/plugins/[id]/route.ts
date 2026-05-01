import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireVerifiedUserForRlsApi } from "@/lib/auth/email-verification";
import { enforceCsrfForRequest } from "@/lib/security/csrf";
import { validateCoverImageFile } from "@/lib/security/uploads";

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
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
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
      const validationError = validateCoverImageFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError, code: "invalid_cover_image" }, { status: 400 });
      }
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  try {
    const gate = await requireVerifiedUserForRlsApi();
    if (gate instanceof NextResponse) return gate;
    const { supabase, userId: sellerId } = gate;

    const { data: plugin } = await supabase
      .from("plugins")
      .select("id, seller_id, slug")
      .eq("id", params.id)
      .maybeSingle();

    if (!plugin || plugin.seller_id !== sellerId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { data: pluginVersionRows, error: pluginVersionRowsErr } = await supabase
      .from("plugin_versions")
      .select("id")
      .eq("plugin_id", params.id);

    if (pluginVersionRowsErr) {
      return NextResponse.json({ error: pluginVersionRowsErr.message }, { status: 400 });
    }

    const pluginVersionIds = (pluginVersionRows ?? []).map((r: any) => r.id).filter(Boolean);
    if (pluginVersionIds.length > 0) {
      const { error: purchasesRefClearErr } = await supabase
        .from("purchases")
        .update({ version_id: null })
        .in("version_id", pluginVersionIds);

      if (purchasesRefClearErr) {
        return NextResponse.json({ error: purchasesRefClearErr.message }, { status: 400 });
      }
    }

    const { error: versionsDelErr } = await supabase
      .from("plugin_versions")
      .delete()
      .eq("plugin_id", params.id);

    if (versionsDelErr) return NextResponse.json({ error: versionsDelErr.message }, { status: 400 });

    const { error: licensesDelErr } = await supabase
      .from("license_keys")
      .delete()
      .eq("plugin_id", params.id);

    if (licensesDelErr) return NextResponse.json({ error: licensesDelErr.message }, { status: 400 });

    const { error: reviewsDelErr } = await supabase
      .from("reviews")
      .delete()
      .eq("plugin_id", params.id);

    if (reviewsDelErr) return NextResponse.json({ error: reviewsDelErr.message }, { status: 400 });

    const { data: purchaseRows, error: purchaseRowsErr } = await supabase
      .from("purchases")
      .select("id")
      .eq("plugin_id", params.id);

    if (purchaseRowsErr) {
      return NextResponse.json({ error: purchaseRowsErr.message }, { status: 400 });
    }

    const purchaseIds = (purchaseRows ?? []).map((r: any) => r.id).filter(Boolean);
    if (purchaseIds.length > 0) {
      const { error: licensesByPurchaseDelErr } = await supabase
        .from("license_keys")
        .delete()
        .in("purchase_id", purchaseIds);

      if (licensesByPurchaseDelErr) {
        return NextResponse.json({ error: licensesByPurchaseDelErr.message }, { status: 400 });
      }
    }

    const { error: purchasesDelErr } = await supabase
      .from("purchases")
      .delete()
      .eq("plugin_id", params.id);

    if (purchasesDelErr) {
      const msg = String(purchasesDelErr.message ?? "").toLowerCase();
      if (msg.includes("license_keys_purchase_id_fkey") && purchaseIds.length > 0) {
        const { data: danglingLicenses, error: danglingLicensesErr } = await supabase
          .from("license_keys")
          .select("id")
          .in("purchase_id", purchaseIds);

        if (danglingLicensesErr) {
          return NextResponse.json({ error: danglingLicensesErr.message }, { status: 400 });
        }

        const danglingIds = (danglingLicenses ?? []).map((r: any) => r.id).filter(Boolean);
        if (danglingIds.length > 0) {
          const { error: danglingDeleteErr } = await supabase
            .from("license_keys")
            .delete()
            .in("id", danglingIds);
          if (danglingDeleteErr) {
            return NextResponse.json({ error: danglingDeleteErr.message }, { status: 400 });
          }
        }

        const { error: purchasesRetryErr } = await supabase
          .from("purchases")
          .delete()
          .eq("plugin_id", params.id);

        if (purchasesRetryErr) {
          return NextResponse.json({ error: purchasesRetryErr.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: purchasesDelErr.message }, { status: 400 });
      }
    }

    const { count: remainingVersionsCount, error: remainingCountErr } = await supabase
      .from("plugin_versions")
      .select("id", { count: "exact", head: true })
      .eq("plugin_id", params.id);

    if (remainingCountErr) {
      return NextResponse.json({ error: remainingCountErr.message }, { status: 400 });
    }
    if ((remainingVersionsCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            `Could not delete plugin_versions for this plugin (still has ${remainingVersionsCount} version(s)). ` +
            `Foreign key constraint likely still active.`
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("plugins").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    revalidatePath("/dashboard/plugins");
    revalidatePath("/dashboard");
    revalidatePath(`/plugin/${plugin.slug}`);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "internal_error" }, { status: 500 });
  }
}
