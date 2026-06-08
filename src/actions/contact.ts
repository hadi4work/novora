"use server";

import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, message } = parsed.data;
  const supportEmail = process.env.CONTACT_EMAIL ?? "support@novora-ai.com";

  if (!process.env.RESEND_API_KEY) {
    console.info("Contact form submission:", { name, email, message });
    return {
      success: true,
      message: "Message received. We'll get back to you soon.",
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Novora <onboarding@resend.dev>",
    to: supportEmail,
    replyTo: email,
    subject: `Contact form: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return { error: "Failed to send message. Please try again later." };
  }

  return { success: true, message: "Message sent! We'll reply within 1–2 business days." };
}
