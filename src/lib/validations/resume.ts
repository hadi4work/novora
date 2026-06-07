import { z } from "zod";
import { LANGUAGE_LEVELS, RESUME_TEMPLATES } from "@/lib/resume/types";

const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().min(1),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const languageSchema = z.object({
  name: z.string().min(1),
  level: z.enum(LANGUAGE_LEVELS),
});

const photoSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value ||
      (value.startsWith("data:image/") && value.length <= 1_500_000),
    "Photo must be a valid image under 1 MB"
  );

export const resumeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  photoUrl: photoSchema,
  summary: z.string().optional(),
  experience: z.array(experienceSchema).min(1, "Add at least one experience"),
  education: z.array(educationSchema).min(1, "Add at least one education entry"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  languages: z.array(languageSchema).optional(),
  template: z.enum(RESUME_TEMPLATES),
});

export type ResumeInput = z.infer<typeof resumeSchema>;

const languageOutputSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    level: z.string(),
  }),
]);

export const resumeOutputSchema = z.object({
  sections: z.object({
    header: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      location: z.string().optional(),
      photoUrl: z.string().optional(),
    }),
    summary: z.string().optional(),
    experience: z.array(
      z.object({
        company: z.string(),
        title: z.string(),
        period: z.string(),
        bullets: z.array(z.string()),
      })
    ),
    education: z.array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        period: z.string().optional(),
      })
    ),
    skills: z.array(z.string()),
    languages: z.array(languageOutputSchema).optional(),
  }),
  template: z.enum(RESUME_TEMPLATES),
});

export type ResumeOutput = z.infer<typeof resumeOutputSchema>;
