// Supabase Edge Function - Send Push Notifications
// Deploy: supabase functions deploy send-push --no-verify-jwt
// Or via CLI: npx supabase functions deploy send-push

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { vapidPublic, vapidPrivate, payload, contact } = await req.json();

    if (!vapidPublic || !vapidPrivate || !payload) {
      return new Response("Missing required fields: vapidPublic, vapidPrivate, payload", { status: 400 });
    }

    // Configure web-push
    webpush.setVapidDetails(contact || "mailto:contato@esportesaopedro.com.br", vapidPublic, vapidPrivate);

    // Read subscriptions from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://cyihlqyhefdwypkzvztj.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: rows, error } = await supabase
      .from("portal_data")
      .select("dados")
      .eq("id", "push_subscriptions")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const subscriptions: Array<Record<string, unknown>> = rows?.dados || [];

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Nenhum inscrito encontrado" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send to all subscriptions
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub as webpush.PushSubscription, payload);
        results.success++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // GONE = subscription expired, remove it
        if (msg.includes("410") || msg.includes("gone") || msg.includes("Gone")) {
          await supabase
            .from("portal_data")
            .update({
              dados: subscriptions.filter((s) => s.endpoint !== sub.endpoint),
              atualizado_em: new Date().toISOString(),
            })
            .eq("id", "push_subscriptions");
        }
        results.failed++;
        results.errors.push(msg);
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
