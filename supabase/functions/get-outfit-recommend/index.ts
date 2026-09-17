import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "productId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch current product safely
    const { data: currentProduct, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !currentProduct) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch recommendations (Safely check if data exists)
    const { data: recommendations, error: recError } = await supabase
      .from("products")
      .select("*")
      .neq("id", productId)
      .limit(3);

    if (recError) throw recError;

    // Optional: Safe check if you are parsing AI/OpenAI choices[0]
    /*
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {...});
    const aiData = await aiResponse.json();
    const resultText = aiData?.choices?.[0]?.message?.content; // Safe optional chaining prevents reading '0' of undefined
    */

    return new Response(
      JSON.stringify({ recommendations: recommendations || [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});