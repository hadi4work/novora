import { createClient } from "@/lib/auth/supabase-server";
import { isSupabaseConfigured } from "@/lib/auth/env";

export interface AIGenerateOptions {
  system: string;
  user: string;
  model: string;
  tool?: string;
  maxTokens?: number;
}

export interface AIGenerateResult {
  content: string;
  tokensUsed: number | null;
  latencyMs: number;
  model: string;
}

export class AIClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIClientError";
  }
}

function allowMockAI() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_MOCK_AI === "true"
  );
}

export async function generateWithAI(
  options: AIGenerateOptions
): Promise<AIGenerateResult> {
  const start = Date.now();

  if (!isSupabaseConfigured()) {
    if (allowMockAI()) return generateMockResponse(options);
    throw new AIClientError(
      "AI service is not configured. Please contact support."
    );
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke("generate", {
      body: {
        system: options.system,
        user: options.user,
        model: options.model,
        tool: options.tool,
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      if (allowMockAI()) return generateMockResponse(options);
      throw new AIClientError(
        "AI generation is temporarily unavailable. Please try again shortly."
      );
    }

    if (!data?.content) {
      console.error("Edge function returned empty:", data);
      if (allowMockAI()) return generateMockResponse(options);
      throw new AIClientError(
        "AI returned an empty response. Please try again."
      );
    }

    return {
      content: data.content as string,
      tokensUsed: (data.tokensUsed as number) ?? null,
      latencyMs: (data.latencyMs as number) ?? Date.now() - start,
      model: (data.model as string) ?? options.model,
    };
  } catch (err) {
    if (err instanceof AIClientError) throw err;
    console.error("AI client error:", err);
    if (allowMockAI()) return generateMockResponse(options);
    throw new AIClientError(
      "AI generation failed. Please try again."
    );
  }
}

export function parseJsonFromResponse<T>(content: string): T {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid AI response format");
  }
  return JSON.parse(jsonMatch[0]) as T;
}

function generateMockResponse(options: AIGenerateOptions): AIGenerateResult {
  const userLower = options.user.toLowerCase();

  if (userLower.includes("platform:")) {
    return {
      content: JSON.stringify({
        variations: [
          {
            caption:
              "Transform your brand with content that connects. Ready to grow?",
            hook: "Stop scrolling — this changes everything.",
          },
          {
            caption:
              "Your audience is waiting. Give them something worth sharing today.",
            hook: "What if one post could change your week?",
          },
        ],
        hashtags: [
          "#contentcreation",
          "#smallbusiness",
          "#marketing",
          "#novora",
          "#socialmedia",
        ],
        ctas: [
          "Link in bio to learn more",
          "DM us to get started",
          "Save this for later",
        ],
      }),
      tokensUsed: 0,
      latencyMs: 100,
      model: options.model,
    };
  }

  if (userLower.includes("product:")) {
    return {
      content: JSON.stringify({
        short:
          "Premium quality meets everyday value. Shop now and experience the difference.",
        long: "Crafted for discerning customers who demand more.\n\n• Premium materials\n• Expert craftsmanship\n• Satisfaction guaranteed\n\nOrder today and elevate your everyday.",
        seo: {
          title: "Premium Product | Shop Now",
          description:
            "Discover our premium product designed for quality-conscious buyers. Free shipping on orders over $50.",
          keywords: ["premium product", "quality", "shop online"],
        },
      }),
      tokensUsed: 0,
      latencyMs: 100,
      model: options.model,
    };
  }

  return {
    content: JSON.stringify({
      sections: {
        header: {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "(555) 123-4567",
          location: "New York, NY",
        },
        summary:
          "Results-driven professional with 5+ years of experience delivering measurable outcomes.",
        experience: [
          {
            company: "Acme Corp",
            title: "Senior Specialist",
            period: "2021 – Present",
            bullets: [
              "Led cross-functional initiatives resulting in 30% efficiency gains",
              "Managed team of 5 direct reports",
            ],
          },
        ],
        education: [
          {
            institution: "State University",
            degree: "B.A. Business Administration",
            period: "2015 – 2019",
          },
        ],
        skills: ["Project Management", "Data Analysis", "Communication"],
        languages: [{ name: "English", level: "native" }],
      },
      template: "classic",
    }),
    tokensUsed: 0,
    latencyMs: 100,
    model: options.model,
  };
}
