import { GoogleGenAI } from "@google/genai";

interface Env {
  GEMINI_API_KEY?: string;
  API_KEY?: string;
}

interface RequestBody {
  contents: any; // SDK expects specific content types, passing through allows flexibility
  config?: any;
  model?: string;
  systemInstruction?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { request, env } = context;

    // --- CORS Handling ---
    const allowedOrigin = "https://lumen-a9s.pages.dev";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- Auth Check ---
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token." }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const body = await request.json() as RequestBody;
    const apiKey = env.API_KEY || env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Server Configuration Error: API Key missing.");
    }

    // Initialize SDK
    const ai = new GoogleGenAI({ apiKey });

    // Model Selection Strategy (Lectorium AI Deployment Expert)
    // Default to 'gemini-3-flash-preview' for speed/efficiency (Basic Text Tasks).
    // Upgrade to 'gemini-3-pro-preview' for complex reasoning (Complex Text Tasks).
    let modelName = "gemini-3-flash-preview"; 
    
    if (body.model === "gemini-pro" || body.model?.includes("pro")) {
        modelName = "gemini-3-pro-preview";
    } else if (body.model === "gemini-flash" || body.model?.includes("flash")) {
        modelName = "gemini-3-flash-preview";
    } else if (body.model) {
        // Allow explicit override if it matches known patterns, otherwise fallback to default
        if (body.model.startsWith("gemini-")) modelName = body.model;
    }

    // Merge system instruction into config if present
    const config = body.config || {};
    if (body.systemInstruction) {
        config.systemInstruction = body.systemInstruction;
    }
    
    // Safety Limits & Defaults
    config.maxOutputTokens = config.maxOutputTokens || 4096;
    config.temperature = config.temperature ?? 0.7;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: body.contents,
        config: config
    });

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (err: any) {
    console.error("AI Proxy Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://lumen-a9s.pages.dev" } 
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://lumen-a9s.pages.dev",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};