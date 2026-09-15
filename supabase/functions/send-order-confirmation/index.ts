import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, customerName, customerEmail, items, totalAmount, shippingAddress } = await req.json();

    if (!orderId || !customerEmail || !items) {
      return new Response(
        JSON.stringify({ error: "Missing required order data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const itemsListHtml = items
      .map(
        (item: OrderItem) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">GH₵ ${item.price.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    // Send receipt to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Gladys' Closet <onboarding@resend.dev>",
      to: [customerEmail],
      replyTo: "gladyscloset61@gmail.com",
      subject: `Order Confirmation #${orderId} - Gladys' Closet`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #7c3aed; text-align: center;">Thank You for Your Order!</h1>
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>We've received your order <strong>#${orderId}</strong> and are getting it ready for shipment.</p>
          
          <h3 style="margin-top: 30px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 15px;">
            <h3>Total Paid: <span style="color: #7c3aed;">GH₵ ${totalAmount.toFixed(2)}</span></h3>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p><strong>Shipping To:</strong><br />${shippingAddress}</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ status: "success", customerEmailResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});