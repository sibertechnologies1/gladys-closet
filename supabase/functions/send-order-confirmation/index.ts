import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const CEO_EMAIL = Deno.env.get("CEO_EMAIL") || "ceo@gladyscloset.com"; // Set this in Supabase environment variables

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      shippingAddress,
    } = await req.json();

    const formattedItemsList = items
      .map(
        (item: any) =>
          `<li><strong>${item.name}</strong> x${item.quantity} - GH₵ ${item.price.toFixed(2)}</li>`
      )
      .join("");

    // 1. Customer Email (Itemized Receipt)
    const customerEmailPromise = resend.emails.send({
      from: "Gladys' Closet <orders@gladyscloset.com>",
      to: [customerEmail],
      replyTo: CEO_EMAIL, // Routes customer replies directly to the CEO/Admin
      subject: `Order Confirmation - #${orderId}`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p>We received your order <strong>#${orderId}</strong> and are preparing it for delivery.</p>
        <h3>Order Items:</h3>
        <ul>${formattedItemsList}</ul>
        <p><strong>Total Paid:</strong> GH₵ ${totalAmount.toFixed(2)}</p>
        <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
      `,
    });

    // 2. Merchant Alert (Notification to CEO)
    const merchantEmailPromise = resend.emails.send({
      from: "Gladys' Closet System <alerts@gladyscloset.com>",
      to: [CEO_EMAIL],
      subject: `🚨 NEW ORDER RECEIVED: #${orderId} - GH₵ ${totalAmount.toFixed(2)}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
          <h2 style="color: #6b21a8;">New Order Notification</h2>
          <p>A new order has just been completed on the storefront.</p>
          <hr />
          <h3>Customer Metadata</h3>
          <ul>
            <li><strong>Name:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
            <li><strong>Phone:</strong> ${customerPhone || "N/A"}</li>
          </ul>

          <h3>Shipping & Delivery Details</h3>
          <p><strong>Address:</strong> ${shippingAddress}</p>

          <h3>Order Summary</h3>
          <ul>${formattedItemsList}</ul>
          <p style="font-size: 18px;"><strong>Total Amount:</strong> GH₵ ${totalAmount.toFixed(2)}</p>
          <hr />
          <p style="font-size: 12px; color: #6b7280;">Order Reference: #${orderId}</p>
        </div>
      `,
    });

    // Dispatch both emails in parallel
    await Promise.all([customerEmailPromise, merchantEmailPromise]);

    return new Response(
      JSON.stringify({ message: "Order emails sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});