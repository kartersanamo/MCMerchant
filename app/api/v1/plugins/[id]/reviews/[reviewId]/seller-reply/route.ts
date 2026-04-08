import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireVerifiedUserForApi } from "@/lib/auth/email-verification";
import { parseSellerReply } from "@/lib/reviews/validate";
import { enforceCsrfForRequest } from "@/lib/security/csrf";

async function assertSellerOwnsPlugin(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userId: string,
  pluginId: string
) {
  const { data: plugin } = await supabase
    .from("plugins")
    .select("id, seller_id, status")
    .eq("id", pluginId)
    .maybeSingle();
  if (!plugin || plugin.status !== "published") return { ok: false as const, status: 404 as const };
  if (plugin.seller_id !== userId) return { ok: false as const, status: 403 as const };
  return { ok: true as const };
}

export async function POST(
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
  const parsed = parseSellerReply((bodyJson as Record<string, unknown>).body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const sellerCheck = await assertSellerOwnsPlugin(supabase, userId, params.id);
  if (!sellerCheck.ok) {
    return NextResponse.json({ error: "Forbidden." }, { status: sellerCheck.status });
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("id, seller_reply")
    .eq("id", params.reviewId)
    .eq("plugin_id", params.id)
    .maybeSingle();

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  if (review.seller_reply) {
    return NextResponse.json({ error: "You already replied. Edit or delete your reply first." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("reviews")
    .update({
      seller_reply: parsed.value,
      seller_reply_at: now,
      seller_reply_updated_at: now
    })
    .eq("id", params.reviewId)
    .eq("plugin_id", params.id)
    .select("id, buyer_id, rating, body, created_at, updated_at, seller_reply, seller_reply_at, seller_reply_updated_at")
    .single();

  if (error || !updated) {
    console.error("[seller-reply POST]", error);
    return NextResponse.json({ error: error?.message ?? "Failed to save reply." }, { status: 500 });
  }

  return NextResponse.json({ review: updated }, { status: 201 });
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
  const parsed = parseSellerReply((bodyJson as Record<string, unknown>).body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const sellerCheck = await assertSellerOwnsPlugin(supabase, userId, params.id);
  if (!sellerCheck.ok) {
    return NextResponse.json({ error: "Forbidden." }, { status: sellerCheck.status });
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("id, seller_reply")
    .eq("id", params.reviewId)
    .eq("plugin_id", params.id)
    .maybeSingle();

  if (!review?.seller_reply) {
    return NextResponse.json({ error: "No reply to edit." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("reviews")
    .update({
      seller_reply: parsed.value,
      seller_reply_updated_at: now
    })
    .eq("id", params.reviewId)
    .eq("plugin_id", params.id)
    .select("id, buyer_id, rating, body, created_at, updated_at, seller_reply, seller_reply_at, seller_reply_updated_at")
    .single();

  if (error || !updated) {
    console.error("[seller-reply PATCH]", error);
    return NextResponse.json({ error: error?.message ?? "Failed to update reply." }, { status: 500 });
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
  const sellerCheck = await assertSellerOwnsPlugin(supabase, userId, params.id);
  if (!sellerCheck.ok) {
    return NextResponse.json({ error: "Forbidden." }, { status: sellerCheck.status });
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      seller_reply: null,
      seller_reply_at: null,
      seller_reply_updated_at: null
    })
    .eq("id", params.reviewId)
    .eq("plugin_id", params.id);

  if (error) {
    console.error("[seller-reply DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
