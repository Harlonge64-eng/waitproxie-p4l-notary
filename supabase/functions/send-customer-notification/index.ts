import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL");

    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase environment is not configured.");
    if (!resendApiKey || !fromEmail) throw new Error("Email service is not configured.");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_p4l_admin");
    if (adminError || !isAdmin) {
      return new Response(JSON.stringify({ error: "P4L administrator access required." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const bookingId = String(body.booking_id || "").trim();
    const customerEmail = String(body.customer_email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!bookingId || !customerEmail || !subject || !message) {
      return new Response(JSON.stringify({ error: "booking_id, customer_email, subject, and message are required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + resendApiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to: [customerEmail], subject, text: message }),
    });

    const emailResult = await emailResponse.json();
    if (!emailResponse.ok) throw new Error(emailResult?.message || "Email provider rejected the message.");

    return new Response(JSON.stringify({ success: true, booking_id: bookingId, email_id: emailResult.id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("send-customer-notification error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to send notification." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
