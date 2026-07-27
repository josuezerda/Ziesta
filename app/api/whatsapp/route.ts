import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Receive WhatsApp webhook messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // Meta sends different event types
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) {
      return NextResponse.json({ status: "no_messages" });
    }

    for (const msg of value.messages) {
      const phone = msg.from; // Sender phone
      const text = msg.text?.body?.trim().toUpperCase() || "";
      const contactName = value.contacts?.[0]?.profile?.name || "";

      // Save inbound message
      await supabase.from("chat_messages").insert({
        phone,
        direction: "inbound",
        content: msg.text?.body || "",
      });

      // Get WhatsApp config
      const { data: config } = await supabase
        .from("whatsapp_config")
        .select("*")
        .eq("is_active", true)
        .single();

      if (!config) continue;

      let replyText = "";

      // === CLIENT COMMANDS ===
      // Find client by phone
      const { data: clientProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", phone)
        .single();

      if (text === "PUNTOS" && clientProfile) {
        const levels = ["", "Siestero 🌙", "Soñador ☀️", "Leyenda 🌟"];
        replyText = `🪙 *Hola ${clientProfile.full_name}!*\n\nTenés *${clientProfile.points_balance.toLocaleString("es-AR")} Puntos Siesta*\nNivel: ${levels[clientProfile.level || 1]} ⭐\n\nTotal ganados: ${clientProfile.total_points_earned.toLocaleString("es-AR")}\nTotal canjeados: ${clientProfile.total_points_spent.toLocaleString("es-AR")}`;
      } else if (text.startsWith("CANJEAR") && clientProfile) {
        const amount = parseInt(text.split(" ")[1]);
        if (!amount || amount <= 0) {
          replyText = "❌ Usá: *CANJEAR 500* (indicando la cantidad de puntos)";
        } else if (amount > clientProfile.points_balance) {
          replyText = `❌ Puntos insuficientes. Tenés ${clientProfile.points_balance.toLocaleString("es-AR")} puntos.`;
        } else {
          const { data: tokenData, error } = await supabase.rpc(
            "generate_redemption_token",
            { p_client_id: clientProfile.id, p_points: amount }
          );

          if (error) {
            replyText = `❌ Error: ${error.message}`;
          } else if (tokenData?.[0]) {
            replyText = `🔑 *Tu código de canje:*\n\n*${tokenData[0].code}*\n\n⏱️ Expira en 60 segundos.\nMostrá este código al comercio.`;
          }
        }
      } else if (text === "SELLOS" && clientProfile) {
        const { data: stamps } = await supabase
          .from("stamp_progress")
          .select("*, stamp_cards(name, stamps_required, reward_description, merchants(name))")
          .eq("client_id", clientProfile.id);

        if (!stamps?.length) {
          replyText = "📋 Aún no tenés tarjetas de sellos activas.";
        } else {
          replyText = "📋 *Tus Tarjetas de Sellos:*\n";
          for (const s of stamps) {
            const filled = "⬛".repeat(s.current_stamps);
            const empty = "⬜".repeat(
              s.stamp_cards.stamps_required - s.current_stamps
            );
            replyText += `\n🏪 ${s.stamp_cards.merchants.name}\n${s.stamp_cards.name}: ${filled}${empty} (${s.current_stamps}/${s.stamp_cards.stamps_required})\n🎁 ${s.stamp_cards.reward_description}\n`;
          }
        }
      } else if (text === "COMERCIOS") {
        const { data: shops } = await supabase
          .from("merchants")
          .select("name, address, categories(name)")
          .eq("is_active", true)
          .limit(10);

        if (!shops?.length) {
          replyText = "🏪 Aún no hay comercios adheridos.";
        } else {
          replyText = "🏪 *Comercios Ziesta:*\n";
          for (const s of shops) {
            replyText += `\n• *${s.name}*\n  📍 ${s.address || "Sin dirección"}\n  🏷️ ${(s as any).categories?.name || ""}\n`;
          }
        }
      }

      // === MERCHANT COMMANDS ===
      // Check if phone belongs to a merchant
      const { data: whatsappNumber } = await supabase
        .from("whatsapp_numbers")
        .select("*, merchants(id, name, points_per_thousand)")
        .eq("phone", phone)
        .eq("is_active", true)
        .single();

      if (whatsappNumber) {
        if (text.startsWith("VALIDAR") && whatsappNumber.can_validate_tokens) {
          const code = text.split(" ")[1];
          if (!code || code.length !== 6) {
            replyText = "❌ Usá: *VALIDAR 482910* (el código de 6 dígitos)";
          } else {
            const { data: valData, error } = await supabase.rpc(
              "validate_redemption_token",
              { p_token_code: code, p_merchant_id: whatsappNumber.merchants.id }
            );

            if (error) {
              replyText = `❌ Error: ${error.message}`;
            } else if (valData?.[0]) {
              if (valData[0].success) {
                replyText = `✅ *Canje exitoso!*\nSe descontaron ${valData[0].points.toLocaleString("es-AR")} puntos.`;
              } else {
                replyText = `❌ ${valData[0].message}`;
              }
            }
          }
        }
      }

      // Default help message
      if (!replyText) {
        replyText = `👋 *Bienvenido a Ziesta!*\n\n📱 Comandos disponibles:\n\n*PUNTOS* — Ver tu balance\n*CANJEAR 500* — Generar código de canje\n*SELLOS* — Ver tarjetas de sellos\n*COMERCIOS* — Ver comercios adheridos\n\n🏪 Si sos comercio:\n*VALIDAR 482910* — Validar un canje`;
      }

      // Send reply via Meta Cloud API
      if (config.number_id && config.jwt_token) {
        await fetch(
          `https://graph.facebook.com/v19.0/${config.number_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.jwt_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone,
              type: "text",
              text: { body: replyText },
            }),
          }
        );

        // Save outbound message
        await supabase.from("chat_messages").insert({
          phone,
          direction: "outbound",
          content: replyText,
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET: Webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // For now, accept any verify token - in production, check against whatsapp_config
  if (mode === "subscribe" && token) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
