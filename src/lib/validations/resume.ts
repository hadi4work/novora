import { z } from "zod";
import { LANGUAGE_LEVELS, RESUME_TEMPLATES } from "@/lib/resume/types";

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

const experienceItemSchema = z
  .object({
    company: z.string(),
    title: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string(),
  })
  .superRefine((entry, ctx) => {
    const anyField =
      hasText(entry.company) ||
      hasText(entry.title) ||
      hasText(entry.startDate) ||
      hasText(entry.description);

    if (!anyField) return;

    if (!hasText(entry.title)) {
      ctx.addIssue({ code: "custom", message: "Job title is required", path: ["title"] });
    }
    if (!hasText(entry.company)) {
      ctx.addIssue({ code: "custom", message: "Company is required", path: ["company"] });
    }
    if (!hasText(entry.startDate)) {
      ctx.addIssue({ code: "custom", message: "Start date is required", path: ["startDate"] });
    }
    if (!hasText(entry.description)) {
      ctx.addIssue({
        code: "custom",
        message: "Role description is required",
        path: ["description"],
      });
    }
  });

const educationItemSchema = z
  .object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .superRefine((entry, ctx) => {
    const anyField = hasText(entry.institution) || hasText(entry.degree);
    if (!anyField) return;

    if (!hasText(entry.institution)) {
      ctx.addIssue({
        code: "custom",
        message: "Institution is required",
        path: ["institution"],
      });
    }
    if (!hasText(entry.degree)) {
      ctx.addIssue({ code: "custom", message: "Degree is required", path: ["degree"] });
    }
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

export function normalizeResumeInput(input: ResumeInput): ResumeInput {
  return {
    ...input,
    experience: input.experience.filter(
      (entry) =>
        hasText(entry.company) ||
        hasText(entry.title) ||
        hasText(entry.startDate) ||
        hasText(entry.description)
    ),
    education: input.education.filter(
      (entry) => hasText(entry.institution) || hasText(entry.degree)
    ),
  };
}

export const resumeSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().optional(),
    location: z.string().optional(),
    photoUrl: photoSchema,
    summary: z.string().optional(),
    experience: z.array(experienceItemSchema),
    education: z.array(educationItemSchema),
    skills: z.array(z.string()).min(1, "Add at least one skill"),
    languages: z.array(languageSchema).optional(),
    template: z.enum(RESUME_TEMPLATES),
  })
  .superRefine((data, ctx) => {
    const educationEntries = data.education.filter(
      (entry) => hasText(entry.institution) && hasText(entry.degree)
    );

    if (educationEntries.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one education entry",
        path: ["education"],
      });
    }
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
