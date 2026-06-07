import type { ResumeInput } from "@/lib/validations/resume";
import { AI_LANGUAGE_RULE, detectLanguageFromText } from "@/lib/i18n/detect-language";

const templateGuides: Record<string, string> = {
  executive: "Executive sidebar layout. Polished leadership tone. Quantified impact and strategic outcomes.",
  modern: "Modern header layout. Concise, impact-focused bullets. Skills-forward professional tone.",
  creative: "Creative layout. Distinctive but professional voice. Highlight achievements and personality.",
  corporate: "Corporate black-and-white layout. Formal business tone. Clear section hierarchy.",
  classic: "Classic two-column layout. Traditional professional format with strong action verbs.",
  professional: "Classic two-column layout. Traditional professional format with strong action verbs.",
  ats: "ATS-friendly plain layout. Keyword-rich, simple structure. Standard section names. Machine-readable bullets.",
};

export function buildResumePrompt(input: ResumeInput): { system: string; user: string } {
  const templateGuide = templateGuides[input.template];
  const lang = detectLanguageFromText(
    input.fullName,
    input.summary,
    input.experience.map((e) => `${e.title} ${e.company} ${e.description}`).join(" "),
    input.education.map((e) => `${e.institution} ${e.degree}`).join(" "),
    input.skills.join(" ")
  );

  return {
    system: `You are an expert resume writer for Novora. Create polished, job-ready resume content.
Rules:
- Never fabricate experience or credentials
- Use only information provided by the user
- Return valid JSON only
- Template style: ${templateGuide}
- ${AI_LANGUAGE_RULE}
- Detected input language: ${lang}`,
    user: `Create a ${input.template} resume for:
Name: ${input.fullName}
Email: ${input.email}
Phone: ${input.phone ?? "N/A"}
Location: ${input.location ?? "N/A"}
Summary: ${input.summary ?? "Generate a professional summary"}
Experience: ${JSON.stringify(input.experience)}
Education: ${JSON.stringify(input.education)}
Skills: ${input.skills.join(", ")}
Languages: ${JSON.stringify(input.languages ?? [])}

Return JSON:
{
  "sections": {
    "header": {"name": "...", "email": "...", "phone": "...", "location": "..."},
    "summary": "...",
    "experience": [{"company": "...", "title": "...", "period": "...", "bullets": ["..."]}],
    "education": [{"institution": "...", "degree": "...", "period": "..."}],
    "skills": ["..."],
    "languages": [{"name": "English", "level": "fluent"}]
  },
  "template": "${input.template}"
}

For languages, preserve the user's language names and proficiency levels exactly. Use the same level labels provided (native, fluent, advanced, intermediate, basic) or translate level words to the output language while keeping the structure.`,
  };
}
