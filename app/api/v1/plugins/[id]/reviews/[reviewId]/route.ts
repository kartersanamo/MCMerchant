import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";
import { parseRating, parseReviewBody } from "@/lib/reviews/validate";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

async function loadReviewForPlugin(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  pluginId: string,
  reviewId: string
) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, plugin_id, buyer_id, rating, body, created_at, updated_at, seller_reply")
    .eq("id", reviewId)
    .eq("plugin_id", pluginId)
    .maybeSingle();
  return { row: data, error };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;
  const { userId } = gate;

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const obj = bodyJson as Record<string, unknown>;

  const rating =
    obj.rating !== undefined ? parseRating(obj.rating) : undefined;
  if (obj.rating !== undefined && rating === null) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 5." }, { status: 400 });
  }
  let bodyUpdate: string | null | undefined;
  if (obj.body !== undefined) {
    const bodyParsed = parseReviewBody(obj.body);
    if (!bodyParsed.ok) {
      return NextResponse.json({ error: bodyParsed.error }, { status: 400 });
    }
    bodyUpdate = bodyParsed.value.length ? bodyParsed.value : null;
  }
  if (rating === undefined && obj.body === undefined) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { row, error } = await loadReviewForPlugin(supabase, params.id, params.reviewId);
  if (error || !row) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  if (row.buyer_id !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  if (rating !== undefined) patch.rating = rating;
  if (bodyUpdate !== undefined) patch.body = bodyUpdate;

  const { data: updated, error: upErr } = await supabase
    .from("reviews")
    .update(patch)
    .eq("id", params.reviewId)
    .eq("plugin_id", params.id)
    .select("id, buyer_id, rating, body, created_at, updated_at, seller_reply, seller_reply_at, seller_reply_updated_at")
    .single();

  if (upErr || !updated) {
    console.error("[reviews PATCH]", upErr);
    return NextResponse.json({ error: upErr?.message ?? "Failed to update review." }, { status: 500 });
  }

  return NextResponse.json({ review: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; reviewId: string } }
) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  const gate = await requireVerifiedUserForApi();
  if (gate instanceof NextResponse) return gate;
  const { userId } = gate;

  const supabase = createSupabaseServerClient();
  const { row, error } = await loadReviewForPlugin(supabase, params.id, params.reviewId);
  if (error || !row) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  if (row.buyer_id !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error: delErr } = await supabase.from("reviews").delete().eq("id", params.reviewId).eq("plugin_id", params.id);

  if (delErr) {
    console.error("[reviews DELETE]", delErr);
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
