import { Text, View } from "@react-pdf/renderer";
import type { ContentLanguage } from "@/lib/i18n/detect-language";
import { RESUME_LEVEL_LABELS } from "@/lib/i18n/detect-language";
import { formatLanguageEntry } from "@/lib/resume/types";
import type { MainBlock } from "@/lib/resume/paginate";
import type { ResumeOutput } from "@/lib/validations/resume";

type Labels = {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
};

type BlockStyles = {
  sectionTitle: Record<string, unknown>;
  summary: Record<string, unknown>;
  jobTitle: Record<string, unknown>;
  jobMeta: Record<string, unknown>;
  bullet: Record<string, unknown>;
  item: Record<string, unknown>;
  skills: Record<string, unknown>;
};

function sectionLabel(section: MainBlock & { kind: "heading" }, labels: Labels) {
  return labels[section.section];
}

export function ResumeMainBlocksPdf({
  blocks,
  labels,
  styles,
  contentLang,
}: {
  blocks: MainBlock[];
  labels: Labels;
  styles: BlockStyles;
  contentLang: ContentLanguage;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "summary") {
          return (
            <View key={i}>
              <Text style={styles.sectionTitle as never}>{labels.summary}</Text>
              <Text style={styles.summary as never}>{block.text}</Text>
            </View>
          );
        }
        if (block.kind === "heading") {
          return (
            <Text key={i} style={styles.sectionTitle as never}>
              {sectionLabel(block, labels)}
            </Text>
          );
        }
        if (block.kind === "experience") {
          const exp = block.item;
          return (
            <View key={i} style={styles.item as never}>
              <Text style={styles.jobTitle as never}>
                {exp.title} — {exp.company}
              </Text>
              <Text style={styles.jobMeta as never}>{exp.period}</Text>
              {exp.bullets.map((bullet, j) => (
                <Text key={j} style={styles.bullet as never}>
                  • {bullet}
                </Text>
              ))}
            </View>
          );
        }
        if (block.kind === "education") {
          const edu = block.item;
          return (
            <View key={i} style={styles.item as never}>
              <Text style={styles.jobTitle as never}>{edu.degree}</Text>
              <Text style={styles.jobMeta as never}>
                {edu.institution}
                {edu.period ? ` · ${edu.period}` : ""}
              </Text>
            </View>
          );
        }
        if (block.kind === "skills") {
          return (
            <Text key={i} style={styles.skills as never}>
              {block.items.join(" · ")}
            </Text>
          );
        }
        if (block.kind === "languages") {
          return (
            <Text key={i} style={styles.skills as never}>
              {block.items
                .map((lang) => {
                  const levelLabel = lang.level
                    ? RESUME_LEVEL_LABELS[contentLang][lang.level] ?? lang.level
                    : "";
                  return formatLanguageEntry(lang, levelLabel);
                })
                .join(" · ")}
            </Text>
          );
        }
        return null;
      })}
    </>
  );
}

export type { Labels as ResumePdfLabels };
