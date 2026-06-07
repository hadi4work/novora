"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import { detectLanguageFromText } from "@/lib/i18n/detect-language";
import { paginateResume } from "@/lib/resume/paginate";
import { formatLanguageEntry, normalizeLanguages, resolveTemplate } from "@/lib/resume/types";
import {
  ResumeMainBlocksPreview,
  ResumePageFrame,
} from "@/components/tools/resume-main-blocks-preview";
import type { ResumeOutput } from "@/lib/validations/resume";

function ContactLine({ header }: { header: ResumeOutput["sections"]["header"] }) {
  return (
    <p>
      {[header.email, header.phone, header.location].filter(Boolean).join(" · ")}
    </p>
  );
}

function Photo({
  photoUrl,
  className,
}: {
  photoUrl?: string;
  className: string;
}) {
  if (!photoUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl} alt="" className={className} />
  );
}

function ExecutivePreview({
  data,
  labels,
  formatLang,
}: {
  data: ResumeOutput;
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
}) {
  const { sections } = data;
  const languages = normalizeLanguages(sections.languages);
  const { mainPages } = paginateResume(data);

  return (
    <div className="space-y-6">
      {mainPages.map((pageBlocks, pageIndex) => (
        <ResumePageFrame
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={mainPages.length}
        >
          <div className={pageIndex === 0 ? "flex min-h-[720px]" : "p-7 text-sm text-slate-900"}>
            {pageIndex === 0 && (
              <aside className="w-[32%] bg-slate-800 p-6 text-slate-50">
                <Photo
                  photoUrl={sections.header.photoUrl}
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                />
                <h2 className="text-center text-lg font-bold">{sections.header.name}</h2>
                <div className="mt-2 text-center text-xs text-slate-300">
                  <ContactLine header={sections.header} />
                </div>
                <h3 className="mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {labels.skills}
                </h3>
                <ul className="space-y-1 text-xs">
                  {sections.skills.map((skill) => (
                    <li key={skill}>• {skill}</li>
                  ))}
                </ul>
                {languages.length > 0 && (
                  <>
                    <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {labels.languages}
                    </h3>
                    <ul className="space-y-1 text-xs">
                      {languages.map((lang) => (
                        <li key={`${lang.name}-${lang.level}`}>{formatLang(lang)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </aside>
            )}
            <main className={pageIndex === 0 ? "flex-1 bg-white p-7 text-sm text-slate-900" : "w-full"}>
              <ResumeMainBlocksPreview
                blocks={pageBlocks}
                labels={labels}
                formatLang={formatLang}
              />
            </main>
          </div>
        </ResumePageFrame>
      ))}
    </div>
  );
}

function ModernPreview({
  data,
  labels,
  formatLang,
}: {
  data: ResumeOutput;
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
}) {
  const { sections } = data;
  const { mainPages } = paginateResume(data);

  return (
    <div className="space-y-6">
      {mainPages.map((pageBlocks, pageIndex) => (
        <ResumePageFrame
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={mainPages.length}
        >
          <div className="overflow-hidden bg-white">
            {pageIndex === 0 && (
              <header className="flex items-center gap-4 bg-teal-700 p-6 text-white">
                <Photo
                  photoUrl={sections.header.photoUrl}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold">{sections.header.name}</h2>
                  <div className="mt-1 text-xs text-teal-100">
                    <ContactLine header={sections.header} />
                  </div>
                </div>
              </header>
            )}
            <div className="space-y-4 p-7 text-sm">
              <ResumeMainBlocksPreview
                blocks={pageBlocks}
                labels={labels}
                formatLang={formatLang}
              />
            </div>
          </div>
        </ResumePageFrame>
      ))}
    </div>
  );
}

function CreativePreview({
  data,
  labels,
  formatLang,
}: {
  data: ResumeOutput;
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
}) {
  const { sections } = data;
  const { mainPages } = paginateResume(data);

  return (
    <div className="space-y-6">
      {mainPages.map((pageBlocks, pageIndex) => (
        <ResumePageFrame
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={mainPages.length}
        >
          <div className="overflow-hidden bg-purple-50">
            {pageIndex === 0 && (
              <>
                <header className="flex items-center gap-4 p-7">
                  <Photo
                    photoUrl={sections.header.photoUrl}
                    className="h-24 w-24 rounded-full border-4 border-purple-600 object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-purple-900">{sections.header.name}</h2>
                    <div className="mt-1 text-xs text-gray-600">
                      <ContactLine header={sections.header} />
                    </div>
                  </div>
                </header>
                <div className="h-1.5 bg-purple-600" />
              </>
            )}
            <div className="space-y-4 p-7 text-sm">
              <ResumeMainBlocksPreview
                blocks={pageBlocks}
                labels={labels}
                formatLang={formatLang}
                experiencePeriodClass="text-purple-600 text-xs"
                educationMetaClass="text-purple-700/80"
              />
            </div>
          </div>
        </ResumePageFrame>
      ))}
    </div>
  );
}

function CorporatePreview({
  data,
  labels,
  formatLang,
}: {
  data: ResumeOutput;
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
}) {
  const { sections } = data;
  const { mainPages } = paginateResume(data);

  return (
    <div className="space-y-6">
      {mainPages.map((pageBlocks, pageIndex) => (
        <ResumePageFrame
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={mainPages.length}
        >
          <div className="bg-white p-8 text-sm text-black">
            {pageIndex === 0 && (
              <header className="mb-6 text-center">
                <h2 className="text-3xl font-bold tracking-[0.2em]">{sections.header.name}</h2>
                <div className="mt-2 text-xs text-gray-600">
                  <ContactLine header={sections.header} />
                </div>
              </header>
            )}
            <ResumeMainBlocksPreview
              blocks={pageBlocks}
              labels={labels}
              formatLang={formatLang}
              experiencePeriodClass="text-gray-600 text-xs"
            />
          </div>
        </ResumePageFrame>
      ))}
    </div>
  );
}

function ClassicPreview({
  data,
  labels,
  formatLang,
}: {
  data: ResumeOutput;
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
}) {
  const { sections } = data;
  const languages = normalizeLanguages(sections.languages);
  const { mainPages } = paginateResume(data);

  return (
    <div className="space-y-6">
      {mainPages.map((pageBlocks, pageIndex) => (
        <ResumePageFrame
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={mainPages.length}
        >
          <div className={pageIndex === 0 ? "flex min-h-[720px] bg-white" : "p-7 text-sm"}>
            {pageIndex === 0 && (
              <aside className="w-[30%] border-e bg-slate-100 p-6 text-sm">
                <Photo
                  photoUrl={sections.header.photoUrl}
                  className="mx-auto mb-4 h-24 w-24 rounded object-cover"
                />
                <h2 className="text-center text-lg font-bold text-slate-900">
                  {sections.header.name}
                </h2>
                <div className="mt-2 text-center text-xs text-slate-600">
                  <ContactLine header={sections.header} />
                </div>
                <h3 className="mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  {labels.skills}
                </h3>
                <ul className="space-y-1 text-xs text-slate-600">
                  {sections.skills.map((skill) => (
                    <li key={skill}>• {skill}</li>
                  ))}
                </ul>
                {languages.length > 0 && (
                  <>
                    <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                      {labels.languages}
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {languages.map((lang) => (
                        <li key={`${lang.name}-${lang.level}`}>{formatLang(lang)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </aside>
            )}
            <main className={pageIndex === 0 ? "flex-1 p-7 text-sm" : "w-full"}>
              <ResumeMainBlocksPreview
                blocks={pageBlocks}
                labels={labels}
                formatLang={formatLang}
              />
            </main>
          </div>
        </ResumePageFrame>
      ))}
    </div>
  );
}

function AtsPreview({
  data,
  labels,
  formatLang,
}: {
  data: ResumeOutput;
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
}) {
  const { sections } = data;
  const { mainPages } = paginateResume(data);

  return (
    <div className="space-y-6">
      {mainPages.map((pageBlocks, pageIndex) => (
        <ResumePageFrame
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={mainPages.length}
        >
          <div className="bg-white p-8 text-sm text-black">
            {pageIndex === 0 && (
              <header className="mb-4 border-b pb-4 text-center">
                <h2 className="text-xl font-bold">{sections.header.name}</h2>
                <div className="mt-1 text-gray-600">
                  <ContactLine header={sections.header} />
                </div>
              </header>
            )}
            <ResumeMainBlocksPreview
              blocks={pageBlocks}
              labels={labels}
              formatLang={formatLang}
            />
          </div>
        </ResumePageFrame>
      ))}
    </div>
  );
}

export function ResumePreview({ data }: { data: ResumeOutput }) {
  const { t } = useTranslations("tools.resume");
  const formatLang = (lang: { name: string; level: string }) =>
    formatLanguageEntry(
      lang,
      lang.level ? t(`level_${lang.level}` as "level_native") : undefined
    );
  const labels = {
    summary: t("previewSummary"),
    experience: t("previewExperience"),
    education: t("previewEducation"),
    skills: t("previewSkills"),
    languages: t("previewLanguages"),
  };

  const template = resolveTemplate(data.template);
  const { sections } = data;
  const contentLang = detectLanguageFromText(
    sections.header.name,
    sections.summary,
    sections.experience.map((e) => `${e.title} ${e.company} ${e.bullets.join(" ")}`).join(" "),
    sections.education.map((e) => `${e.institution} ${e.degree}`).join(" "),
    sections.skills.join(" ")
  );
  const isRtl = contentLang === "ar";

  const previewProps = { data, labels, formatLang };
  const content =
    template === "executive" ? (
      <ExecutivePreview {...previewProps} />
    ) : template === "modern" ? (
      <ModernPreview {...previewProps} />
    ) : template === "creative" ? (
      <CreativePreview {...previewProps} />
    ) : template === "corporate" ? (
      <CorporatePreview {...previewProps} />
    ) : template === "classic" ? (
      <ClassicPreview {...previewProps} />
    ) : (
      <AtsPreview {...previewProps} />
    );

  return (
    <div
      className="resume-preview mx-auto max-w-3xl"
      dir={isRtl ? "rtl" : "ltr"}
      lang={contentLang}
    >
      {content}
    </div>
  );
}
