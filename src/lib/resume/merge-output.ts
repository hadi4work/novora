import type { ResumeInput, ResumeOutput } from "@/lib/validations/resume";

export function mergeResumeOutput(input: ResumeInput, output: ResumeOutput): ResumeOutput {
  return {
    ...output,
    template: input.template,
    sections: {
      ...output.sections,
      header: {
        ...output.sections.header,
        name: input.fullName || output.sections.header.name,
        email: input.email || output.sections.header.email,
        phone: input.phone ?? output.sections.header.phone,
        location: input.location ?? output.sections.header.location,
        photoUrl: input.photoUrl ?? output.sections.header.photoUrl,
      },
      languages:
        input.languages && input.languages.length > 0
          ? input.languages
          : output.sections.languages,
    },
  };
}
