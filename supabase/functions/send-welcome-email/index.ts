import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email address is required.");
    }

    const { data, error } = await resend.emails.send({
      from: "Gladys' Closet <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Gladys' Closet!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">Welcome to Gladys' Closet!</h2>
          <p>Thank you for subscribing to our newsletter. You will be the first to know about special offers, giveaways, and exclusive deals.</p>
          <p style="margin-top: 20px; font-weight: bold;">Happy Shopping!</p>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});