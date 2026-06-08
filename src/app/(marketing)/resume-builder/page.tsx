import { ToolLanding } from "@/components/marketing/tool-landing";
import { createMetadata } from "@/lib/seo/metadata";

const faqs = [
  {
    question: "What resume templates are available?",
    answer: "Professional, ATS-Friendly, and Modern templates. Each optimized for different industries and application types.",
  },
  {
    question: "Can I export to PDF or Word?",
    answer: "PDF and Word export are available on Pro and Business plans. Free users can preview their resume.",
  },
  {
    question: "Is my resume ATS-compatible?",
    answer: "Yes. Our ATS-Friendly template uses clean formatting and keyword optimization that applicant tracking systems can parse.",
  },
];

export const metadata = createMetadata({
  title: "AI Resume Builder",
  description: "Build professional, ATS-friendly resumes with AI. Free templates, PDF & Word export on Pro. Land your next job faster.",
  path: "/resume-builder",
  keywords: ["AI resume builder", "ATS resume", "professional resume", "resume PDF"],
});

export default function ResumeBuilderPage() {
  return (
    <ToolLanding
      title="AI Resume Builder"
      description="Create polished, job-ready resumes in minutes. Professional, ATS-friendly, and modern templates with PDF & Word export."
      path="/resume-builder"
      features={[
        "Professional, ATS, and Modern templates",
        "AI-optimized bullet points",
        "Live preview as you build",
        "PDF & Word export (Pro)",
        "Save and edit anytime (Pro)",
      ]}
      faqs={faqs}
      ctaHref="/app/resume"
    />
  );
}
