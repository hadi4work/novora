export interface NexaPayDescriptionPayload {
  ref: string;
  userId: string;
  plan: "pro" | "business";
  email: string;
}

export function encodeNexaPayDescription(payload: NexaPayDescriptionPayload): string {
  return JSON.stringify(payload);
}

export function parseNexaPayDescription(
  description: unknown
): NexaPayDescriptionPayload | null {
  if (!description) return null;

  try {
    const parsed =
      typeof description === "string" ? JSON.parse(description) : description;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.ref === "string" &&
      typeof parsed.userId === "string" &&
      (parsed.plan === "pro" || parsed.plan === "business") &&
      typeof parsed.email === "string"
    ) {
      return parsed as NexaPayDescriptionPayload;
    }
  } catch {
    return null;
  }

  return null;
}
