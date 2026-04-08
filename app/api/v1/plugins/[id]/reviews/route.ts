import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForRlsApi } from "@/lib/auth/email-verification";
import { userCanReviewPlugin } from "@/lib/reviews/eligibility";
import { parseRating, parseReviewBody } from "@/lib/reviews/validate";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const csrf = enforceCsrfForRequest(request);
  if (csrf) return csrf;
  const gate = await requireVerifiedUserForRlsApi();
  if (gate instanceof NextResponse) return gate;
  const { userId, supabase: rlsSupabase } = gate;

  const pluginId = params.id;
  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const obj = bodyJson as Record<string, unknown>;
  const rating = parseRating(obj.rating);
  if (rating === null) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 5." }, { status: 400 });
  }
  const bodyParsed = parseReviewBody(obj.body);
  if (!bodyParsed.ok) {
    return NextResponse.json({ error: bodyParsed.error }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data: plugin, error: pluginErr } = await supabase
    .from("plugins")
    .select("id, seller_id, price_cents, status")
    .eq("id", pluginId)
    .maybeSingle();

  if (pluginErr || !plugin || plugin.status !== "published") {
    return NextResponse.json({ error: "Plugin not found." }, { status: 404 });
  }

  const can = await userCanReviewPlugin(supabase, userId, {
    id: plugin.id,
    seller_id: plugin.seller_id,
    price_cents: plugin.price_cents
  });
  if (!can) {
    return NextResponse.json(
      { error: "You’re not eligible to review this plugin." },
      { status: 403 }
    );
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("plugin_id", pluginId)
    .eq("buyer_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You already reviewed this plugin. Edit or delete your existing review." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { data: row, error: insErr } = await rlsSupabase
    .from("reviews")
    .insert({
      plugin_id: pluginId,
      buyer_id: userId,
      rating,
      body: bodyParsed.value.length ? bodyParsed.value : null,
      created_at: now,
      updated_at: now
    })
    .select("id, buyer_id, rating, body, created_at, updated_at, seller_reply, seller_reply_at, seller_reply_updated_at")
    .single();

  if (insErr || !row) {
    console.error("[reviews POST]", insErr);
    return NextResponse.json({ error: insErr?.message ?? "Failed to create review." }, { status: 500 });
  }

  return NextResponse.json({ review: row }, { status: 201 });
}
