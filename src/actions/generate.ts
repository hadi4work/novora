"use server";

import {
  generateProductDescription,
  generateResume,
  generateSocialMedia,
  generateVideoAdScript,
} from "@/lib/ai/generation-service";

export async function generateSocialMediaAction(input: unknown) {
  return generateSocialMedia(input);
}

export async function generateProductDescriptionAction(input: unknown) {
  return generateProductDescription(input);
}

export async function generateResumeAction(input: unknown) {
  return generateResume(input);
}

export async function generateVideoAdScriptAction(input: unknown) {
  return generateVideoAdScript(input);
}
