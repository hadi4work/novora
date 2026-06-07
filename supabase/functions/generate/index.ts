import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODEL_MAP: Record<string, string> = {
  "llama-3.1-8b-instant": "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
  // Legacy names from old config
  "grok-3-mini": "llama-3.1-8b-instant",
  "grok-4": "llama-3.3-70b-versatile",
};

interface GenerateRequest {
  system: string;
  user: string;
  model?: string;
  tool?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = (await req.json()) as GenerateRequest;
    const { system, user: userPrompt, model } = body;

    if (!system || !userPrompt) {
      return jsonResponse({ error: "Missing system or user prompt" }, 400);
    }

    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
      return jsonResponse({ error: "GROQ_API_KEY not configured" }, 503);
    }

    const groqModel = MODEL_MAP[model ?? ""] ?? "llama-3.1-8b-instant";
    const start = Date.now();

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errText);
      return jsonResponse(
        { error: "AI generation failed", details: errText },
        502
      );
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content ?? "";
    const tokensUsed = groqData.usage?.completion_tokens ?? null;
    const latencyMs = Date.now() - start;

    return jsonResponse({ content, tokensUsed, latencyMs, model: groqModel });
  } catch (error) {
    console.error("Edge function error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Internal error" },
      500
    );
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
