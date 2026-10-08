import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server configuration is missing.");
    }

    if (!resendApiKey || !fromEmail) {
      throw new Error("Email service is not configured.");
    }

    const body = await req.json();
    const bookingId = String(body.booking_id || "").trim();
    const confirmationToken = String(body.confirmation_token || "").trim();

    if (!bookingId || !confirmationToken) {
      return jsonResponse(
        { error: "booking_id and confirmation_token are required." },
        400
      );
    }

    if (!/^[0-9a-f]{64}$/i.test(confirmationToken)) {
      return jsonResponse({ error: "Invalid confirmation token." }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const confirmationTokenHash = await sha256Hex(confirmationToken);

    const { data: tokenConsumed, error: tokenError } = await supabase.rpc(
      "consume_booking_confirmation_token",
      {
        p_booking_id: bookingId,
        p_token_hash: confirmationTokenHash,
      }
    );

    if (tokenError) {
      console.error("confirmation token validation error:", tokenError);
      throw new Error("Unable to validate booking confirmation.");
    }

    if (tokenConsumed !== true) {
      return jsonResponse(
        { error: "Invalid or expired booking confirmation token." },
        401
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("booking_requests")
      .select(
        "id, full_name, email, service, document_type, requested_date, preferred_time, status"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) throw bookingError;

    if (!booking) {
      return jsonResponse({ error: "Booking not found." }, 404);
    }

    const customerEmail = String(booking.email || "").trim();
    const customerName = String(booking.full_name || "Customer").trim();

    if (!customerEmail) {
      throw new Error("Booking does not contain a customer email address.");
    }

    const referenceId = booking.id.substring(0, 8).toUpperCase();
    const subject = "Booking Request Received - P4L Mobile Notary";

    const message = [
      `Hello ${customerName},`,
      "",
      "Thank you for submitting your booking request to P4L Mobile Notary Services LLC.",
      `Your request reference ID is : ${referenceId}`,
      `Service: ${booking.service || "Not specified"}`,
      `Document type: ${booking.document_type || "Not specified"}`,
      `Requested date: ${booking.requested_date || "Not specified"}`,
      `Preferred time: ${booking.preferred_time || "Not specified"}`,
      `Current status: ${booking.status || "Request Submitted"}`,
      "",
      "Your request has been received and will be reviewed by our team. We will contact you with the next steps.",
      "",
      "Please keep your reference ID for tracking your request.",
      "",
      "P4L Mobile Notary Services LLC"
    ].join("\n");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [customerEmail],
        subject,
        text: message,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(
        emailResult?.message || "Email provider rejected the message."
      );
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        booking_id: booking.id,
        customer_email: customerEmail,
        subject,
        message,
      });

    if (notificationError) {
      console.error("notification record error:", notificationError);
    }

    return jsonResponse({
      success: true,
      booking_id: booking.id,
      email_id: emailResult.id,
    });
  } catch (error) {
    console.error("send-booking-confirmation error:", error);

    return jsonResponse({
      error:
        error instanceof Error
            ? error.message
            : "Unable to send booking confirmation.",
    }, 500);
  }
});
