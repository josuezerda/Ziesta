import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Send a campaign broadcast message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId } = body;

    const supabase = await createClient();

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Solo admins" }, { status: 403 });
    }

    // Get campaign
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campErr || !campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    // Get WhatsApp config
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (!config?.number_id || !config?.jwt_token) {
      return NextResponse.json({ error: "WhatsApp no configurado" }, { status: 400 });
    }

    // Get target users' phones
    const { data: targets } = await supabase
      .from("profiles")
      .select("id, phone, full_name")
      .not("phone", "is", null)
      .eq("role", "client");

    if (!targets?.length) {
      return NextResponse.json({ error: "No hay destinatarios con teléfono" }, { status: 400 });
    }

    // Update campaign status
    await supabase
      .from("campaigns")
      .update({ status: "sending", target_count: targets.length })
      .eq("id", campaignId);

    // Send messages with 3s delay between each
    let sentCount = 0;
    let failedCount = 0;

    for (const target of targets) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${config.number_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.jwt_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: target.phone,
              type: "text",
              text: {
                body: campaign.message.replace("{{nombre}}", target.full_name || ""),
              },
            }),
          }
        );

        const status = res.ok ? "sent" : "failed";
        const error = res.ok ? null : await res.text();

        await supabase.from("campaign_logs").insert({
          campaign_id: campaignId,
          phone: target.phone,
          status,
          error,
        });

        if (res.ok) sentCount++;
        else failedCount++;

        // Rate limit: 3 second delay
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (err: any) {
        failedCount++;
        await supabase.from("campaign_logs").insert({
          campaign_id: campaignId,
          phone: target.phone,
          status: "failed",
          error: err.message,
        });
      }
    }

    // Update campaign as completed
    await supabase
      .from("campaigns")
      .update({
        status: "completed",
        sent_count: sentCount,
        failed_count: failedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: targets.length,
    });
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
