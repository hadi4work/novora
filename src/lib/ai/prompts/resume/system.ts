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
  const enhance = input.enhanceContent ?? true;
  const lang = detectLanguageFromText(
    input.fullName,
    input.summary,
    input.experience.map((e) => `${e.title} ${e.company} ${e.description}`).join(" "),
    input.education.map((e) => `${e.institution} ${e.degree}`).join(" "),
    input.skills.join(" ")
  );

  const contentRules = enhance
    ? `Content enhancement mode (ON):
- Rewrite rough notes, short phrases, and incomplete sentences into polished, professional CV language
- Expand each role description into 3–5 strong bullet points with action verbs and clear impact
- If the summary is missing or brief, write a compelling 2–4 sentence professional summary from the user's background
- Improve grammar, clarity, and tone so the CV reads complete and job-ready
- Elaborate professionally on what the user described — do not copy input verbatim
- Never invent employers, job titles, dates, degrees, certifications, or skills not provided
- Never fabricate metrics or achievements; only use numbers or results explicitly mentioned by the user
- You may infer reasonable professional phrasing from sparse notes (e.g. "helped customers" → customer service bullet) without adding false specifics`
    : `Literal mode (enhancement OFF):
- Keep the user's wording as close as possible to what they typed
- Apply only light grammar and formatting fixes
- Do not significantly expand, rephrase, or add new achievements
- Split descriptions into bullets if helpful, but preserve the user's phrasing and scope`;

  return {
    system: `You are an expert resume writer for Novora. Create polished, job-ready resume content.
Rules:
- Never fabricate experience, employers, credentials, or qualifications
- Use only information provided by the user
- Return valid JSON only
- Template style: ${templateGuide}
- ${contentRules}
- ${AI_LANGUAGE_RULE}
- Detected input language: ${lang}`,
    user: `Create a ${input.template} resume for:
Name: ${input.fullName}
Email: ${input.email}
Phone: ${input.phone ?? "N/A"}
Location: ${input.location ?? "N/A"}
Summary: ${input.summary ?? (enhance ? "Write a professional summary from the user's background" : "Leave brief or omit if not provided")}
Experience: ${JSON.stringify(input.experience)}
Education: ${JSON.stringify(input.education)}
Skills: ${input.skills.join(", ")}
Languages: ${JSON.stringify(input.languages ?? [])}
Enhance content: ${enhance ? "yes" : "no"}

If no work experience is provided, return an empty experience array and focus the summary on education, skills, coursework, projects, and potential. Do not invent jobs.

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
