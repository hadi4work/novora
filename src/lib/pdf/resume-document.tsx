import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  RESUME_LEVEL_LABELS,
  RESUME_PDF_LABELS,
  type ContentLanguage,
} from "@/lib/i18n/detect-language";
import { patchPdfStyles } from "@/lib/pdf/font-utils";
import { registerResumePdfFonts } from "@/lib/pdf/register-fonts";
import { ResumeMainBlocksPdf } from "@/lib/pdf/resume-main-blocks";
import {
  getResumeContentLanguage,
  resumeContactLine,
} from "@/lib/resume/export-meta";
import { paginateResume } from "@/lib/resume/paginate";
import { formatLanguageEntry, normalizeLanguages, resolveTemplate } from "@/lib/resume/types";
import type { ResumeOutput } from "@/lib/validations/resume";

registerResumePdfFonts();

type Labels = (typeof RESUME_PDF_LABELS)[ContentLanguage];

function formatLang(entry: { name: string; level: string }, contentLang: ContentLanguage) {
  const levelLabel = RESUME_LEVEL_LABELS[contentLang][entry.level] ?? entry.level;
  return formatLanguageEntry(entry, levelLabel);
}

function getResumeLabels(data: ResumeOutput): Labels {
  return RESUME_PDF_LABELS[getResumeContentLanguage(data)];
}

function Photo({ photoUrl, style }: { photoUrl?: string; style: Record<string, unknown> }) {
  if (!photoUrl) return null;
  return <Image src={photoUrl} style={style as never} />;
}

const executiveStyles = StyleSheet.create({
  page: { flexDirection: "row", fontSize: 9, fontFamily: "Helvetica" },
  sidebar: {
    width: "32%",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    padding: 24,
  },
  main: { width: "68%", padding: 28, backgroundColor: "#ffffff" },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: "center",
    marginBottom: 14,
    objectFit: "cover",
  },
  sideName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  sideContact: { fontSize: 8, lineHeight: 1.5, marginBottom: 16, textAlign: "center" },
  sideTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#94a3b8",
  },
  sideItem: { fontSize: 8, marginBottom: 3, lineHeight: 1.4 },
  mainTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#1e293b",
  },
  summary: { lineHeight: 1.5, marginBottom: 4 },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  jobMeta: { fontSize: 8, color: "#64748b", marginBottom: 3 },
  bullet: { marginLeft: 8, marginBottom: 2, lineHeight: 1.35 },
  item: { marginBottom: 8 },
  continuationPage: { fontSize: 9, fontFamily: "Helvetica", padding: 28, backgroundColor: "#ffffff" },
});

const executiveMainStyles = {
  sectionTitle: executiveStyles.mainTitle,
  summary: executiveStyles.summary,
  jobTitle: executiveStyles.jobTitle,
  jobMeta: executiveStyles.jobMeta,
  bullet: executiveStyles.bullet,
  item: executiveStyles.item,
  skills: executiveStyles.summary,
};

function ExecutiveLayout({ data, labels }: { data: ResumeOutput; labels: Labels }) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const rtl = contentLang === "ar";
  const languages = normalizeLanguages(sections.languages);
  const { mainPages } = paginateResume(data);
  const styles = patchPdfStyles(executiveStyles, contentLang);
  const mainStyles = patchPdfStyles(executiveMainStyles, contentLang);

  return (
    <>
      {mainPages.map((pageBlocks, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={
            pageIndex === 0
              ? {
                  ...styles.page,
                  flexDirection: rtl ? "row-reverse" : "row",
                }
              : styles.continuationPage
          }
        >
          {pageIndex === 0 && (
            <View style={styles.sidebar}>
              <Photo photoUrl={sections.header.photoUrl} style={styles.photo} />
              <Text style={styles.sideName}>{sections.header.name}</Text>
              <Text style={styles.sideContact}>{resumeContactLine(sections.header)}</Text>
              <Text style={styles.sideTitle}>{labels.skills}</Text>
              {sections.skills.map((skill, i) => (
                <Text key={i} style={styles.sideItem}>
                  • {skill}
                </Text>
              ))}
              {languages.length > 0 && (
                <>
                  <Text style={styles.sideTitle}>{labels.languages}</Text>
                  {languages.map((lang, i) => (
                    <Text key={i} style={styles.sideItem}>
                      {formatLang(lang, contentLang)}
                    </Text>
                  ))}
                </>
              )}
            </View>
          )}
          <View style={pageIndex === 0 ? styles.main : { width: "100%" }}>
            <ResumeMainBlocksPdf
              blocks={pageBlocks}
              labels={labels}
              styles={mainStyles}
              contentLang={contentLang}
            />
          </View>
        </Page>
      ))}
    </>
  );
}

const modernStyles = StyleSheet.create({
  page: { fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  headerBand: {
    backgroundColor: "#0f766e",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photo: { width: 72, height: 72, borderRadius: 8, objectFit: "cover" },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#ffffff", marginBottom: 4 },
  contact: { fontSize: 8, color: "#ccfbf1" },
  body: { padding: 28 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f766e",
    marginTop: 10,
    marginBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#99f6e4",
    paddingBottom: 4,
  },
  summary: { lineHeight: 1.5, marginBottom: 4 },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  jobMeta: { fontSize: 8, color: "#64748b", marginBottom: 3 },
  bullet: { marginLeft: 8, marginBottom: 2, lineHeight: 1.35 },
  item: { marginBottom: 8 },
  skills: { lineHeight: 1.5 },
  continuationPage: { fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#ffffff", padding: 28 },
});

const modernMainStyles = {
  sectionTitle: modernStyles.sectionTitle,
  summary: modernStyles.summary,
  jobTitle: modernStyles.jobTitle,
  jobMeta: modernStyles.jobMeta,
  bullet: modernStyles.bullet,
  item: modernStyles.item,
  skills: modernStyles.skills,
};

function ModernLayout({ data, labels }: { data: ResumeOutput; labels: Labels }) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const rtl = contentLang === "ar";
  const { mainPages } = paginateResume(data);
  const styles = patchPdfStyles(modernStyles, contentLang);
  const mainStyles = patchPdfStyles(modernMainStyles, contentLang);

  return (
    <>
      {mainPages.map((pageBlocks, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={pageIndex === 0 ? styles.page : styles.continuationPage}
        >
          {pageIndex === 0 && (
            <View
              style={{
                ...styles.headerBand,
                flexDirection: rtl ? "row-reverse" : "row",
              }}
            >
              <Photo photoUrl={sections.header.photoUrl} style={styles.photo} />
              <View>
                <Text style={styles.name}>{sections.header.name}</Text>
                <Text style={styles.contact}>{resumeContactLine(sections.header)}</Text>
              </View>
            </View>
          )}
          <View style={pageIndex === 0 ? styles.body : undefined}>
            <ResumeMainBlocksPdf
              blocks={pageBlocks}
              labels={labels}
              styles={mainStyles}
              contentLang={contentLang}
            />
          </View>
        </Page>
      ))}
    </>
  );
}

const creativeStyles = StyleSheet.create({
  page: { fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#faf5ff" },
  header: { padding: 28, flexDirection: "row", gap: 16, alignItems: "center" },
  photo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "#7c3aed",
    objectFit: "cover",
  },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#5b21b6" },
  contact: { fontSize: 8, color: "#6b7280", marginTop: 4 },
  accent: { height: 6, backgroundColor: "#7c3aed" },
  body: { paddingHorizontal: 28, paddingBottom: 28 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  summary: { lineHeight: 1.5, marginBottom: 4 },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#4c1d95" },
  jobMeta: { fontSize: 8, color: "#6b7280", marginBottom: 3 },
  bullet: { marginLeft: 8, marginBottom: 2, lineHeight: 1.35 },
  item: { marginBottom: 8 },
  skills: { lineHeight: 1.5 },
  continuationPage: {
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#faf5ff",
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 28,
  },
});

const creativeMainStyles = {
  sectionTitle: creativeStyles.sectionTitle,
  summary: creativeStyles.summary,
  jobTitle: creativeStyles.jobTitle,
  jobMeta: creativeStyles.jobMeta,
  bullet: creativeStyles.bullet,
  item: creativeStyles.item,
  skills: creativeStyles.skills,
};

function CreativeLayout({ data, labels }: { data: ResumeOutput; labels: Labels }) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const rtl = contentLang === "ar";
  const { mainPages } = paginateResume(data);
  const styles = patchPdfStyles(creativeStyles, contentLang);
  const mainStyles = patchPdfStyles(creativeMainStyles, contentLang);

  return (
    <>
      {mainPages.map((pageBlocks, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={pageIndex === 0 ? styles.page : styles.continuationPage}
        >
          {pageIndex === 0 && (
            <>
              <View
                style={{
                  ...styles.header,
                  flexDirection: rtl ? "row-reverse" : "row",
                }}
              >
                <Photo photoUrl={sections.header.photoUrl} style={styles.photo} />
                <View>
                  <Text style={styles.name}>{sections.header.name}</Text>
                  <Text style={styles.contact}>{resumeContactLine(sections.header)}</Text>
                </View>
              </View>
              <View style={styles.accent} />
            </>
          )}
          <View style={pageIndex === 0 ? styles.body : undefined}>
            <ResumeMainBlocksPdf
              blocks={pageBlocks}
              labels={labels}
              styles={mainStyles}
              contentLang={contentLang}
            />
          </View>
        </Page>
      ))}
    </>
  );
}

const corporateStyles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 6,
  },
  contact: { fontSize: 8, textAlign: "center", color: "#444444", marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  divider: { borderBottomWidth: 1, borderBottomColor: "#111111", marginBottom: 8 },
  summary: { lineHeight: 1.55, marginBottom: 4, textAlign: "justify" },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  jobMeta: { fontSize: 8, color: "#555555", marginBottom: 3 },
  bullet: { marginLeft: 10, marginBottom: 2, lineHeight: 1.4 },
  item: { marginBottom: 8 },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: {
    borderWidth: 1,
    borderColor: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 8,
  },
  continuationPage: { padding: 36, fontSize: 9, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
});

const corporateMainStyles = {
  sectionTitle: corporateStyles.sectionTitle,
  summary: corporateStyles.summary,
  jobTitle: corporateStyles.jobTitle,
  jobMeta: corporateStyles.jobMeta,
  bullet: corporateStyles.bullet,
  item: corporateStyles.item,
  skills: corporateStyles.summary,
};

function CorporateLayout({ data, labels }: { data: ResumeOutput; labels: Labels }) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const { mainPages } = paginateResume(data);
  const styles = patchPdfStyles(corporateStyles, contentLang);
  const mainStyles = patchPdfStyles(corporateMainStyles, contentLang);

  return (
    <>
      {mainPages.map((pageBlocks, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={pageIndex === 0 ? styles.page : styles.continuationPage}
        >
          {pageIndex === 0 && (
            <>
              <Text style={styles.name}>{sections.header.name}</Text>
              <Text style={styles.contact}>{resumeContactLine(sections.header)}</Text>
            </>
          )}
          <ResumeMainBlocksPdf
            blocks={pageBlocks}
            labels={labels}
            styles={mainStyles}
            contentLang={contentLang}
          />
        </Page>
      ))}
    </>
  );
}

const classicStyles = StyleSheet.create({
  page: { flexDirection: "row", fontSize: 9, fontFamily: "Helvetica" },
  sidebar: {
    width: "30%",
    backgroundColor: "#f1f5f9",
    padding: 22,
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
  },
  main: { width: "70%", padding: 26 },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 12,
    objectFit: "cover",
  },
  sideName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#0f172a",
  },
  sideContact: { fontSize: 8, lineHeight: 1.5, marginBottom: 14, textAlign: "center", color: "#475569" },
  sideTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#334155",
  },
  sideItem: { fontSize: 8, marginBottom: 3, lineHeight: 1.4, color: "#475569" },
  mainTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 3,
  },
  summary: { lineHeight: 1.5, marginBottom: 4 },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  jobMeta: { fontSize: 8, color: "#64748b", marginBottom: 3 },
  bullet: { marginLeft: 8, marginBottom: 2, lineHeight: 1.35 },
  item: { marginBottom: 8 },
  continuationPage: { fontSize: 9, fontFamily: "Helvetica", padding: 26, backgroundColor: "#ffffff" },
});

const classicMainStyles = {
  sectionTitle: classicStyles.mainTitle,
  summary: classicStyles.summary,
  jobTitle: classicStyles.jobTitle,
  jobMeta: classicStyles.jobMeta,
  bullet: classicStyles.bullet,
  item: classicStyles.item,
  skills: classicStyles.summary,
};

function ClassicLayout({ data, labels }: { data: ResumeOutput; labels: Labels }) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const rtl = contentLang === "ar";
  const languages = normalizeLanguages(sections.languages);
  const { mainPages } = paginateResume(data);
  const styles = patchPdfStyles(classicStyles, contentLang);
  const mainStyles = patchPdfStyles(classicMainStyles, contentLang);

  return (
    <>
      {mainPages.map((pageBlocks, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={
            pageIndex === 0
              ? {
                  ...styles.page,
                  flexDirection: rtl ? "row-reverse" : "row",
                }
              : styles.continuationPage
          }
        >
          {pageIndex === 0 && (
            <View
              style={{
                ...styles.sidebar,
                ...(rtl
                  ? {
                      borderRightWidth: 0,
                      borderLeftWidth: 1,
                      borderLeftColor: "#cbd5e1",
                    }
                  : {}),
              }}
            >
              <Photo photoUrl={sections.header.photoUrl} style={styles.photo} />
              <Text style={styles.sideName}>{sections.header.name}</Text>
              <Text style={styles.sideContact}>{resumeContactLine(sections.header)}</Text>
              <Text style={styles.sideTitle}>{labels.skills}</Text>
              {sections.skills.map((skill, i) => (
                <Text key={i} style={styles.sideItem}>
                  • {skill}
                </Text>
              ))}
              {languages.length > 0 && (
                <>
                  <Text style={styles.sideTitle}>{labels.languages}</Text>
                  {languages.map((lang, i) => (
                    <Text key={i} style={styles.sideItem}>
                      {formatLang(lang, contentLang)}
                    </Text>
                  ))}
                </>
              )}
            </View>
          )}
          <View style={pageIndex === 0 ? styles.main : { width: "100%" }}>
            <ResumeMainBlocksPdf
              blocks={pageBlocks}
              labels={labels}
              styles={mainStyles}
              contentLang={contentLang}
            />
          </View>
        </Page>
      ))}
    </>
  );
}

const atsStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingBottom: 12 },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  contact: { fontSize: 9, color: "#666" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summary: { marginBottom: 8, lineHeight: 1.5 },
  jobTitle: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  jobMeta: { fontSize: 9, color: "#666", marginBottom: 4 },
  bullet: { marginLeft: 10, marginBottom: 2, lineHeight: 1.4 },
  skills: { lineHeight: 1.5 },
  item: { marginBottom: 8 },
  continuationPage: { padding: 40, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
});

const atsMainStyles = {
  sectionTitle: atsStyles.sectionTitle,
  summary: atsStyles.summary,
  jobTitle: atsStyles.jobTitle,
  jobMeta: atsStyles.jobMeta,
  bullet: atsStyles.bullet,
  item: atsStyles.item,
  skills: atsStyles.skills,
};

function AtsLayout({ data, labels }: { data: ResumeOutput; labels: Labels }) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const { mainPages } = paginateResume(data);
  const styles = patchPdfStyles(atsStyles, contentLang);
  const mainStyles = patchPdfStyles(atsMainStyles, contentLang);

  return (
    <>
      {mainPages.map((pageBlocks, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={pageIndex === 0 ? styles.page : styles.continuationPage}
        >
          {pageIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.name}>{sections.header.name}</Text>
              <Text style={styles.contact}>{resumeContactLine(sections.header)}</Text>
            </View>
          )}
          <ResumeMainBlocksPdf
            blocks={pageBlocks}
            labels={labels}
            styles={mainStyles}
            contentLang={contentLang}
          />
        </Page>
      ))}
    </>
  );
}

export function buildResumePdfDocument(data: ResumeOutput) {
  const labels = getResumeLabels(data);
  const template = resolveTemplate(data.template);

  const layout =
    template === "executive" ? (
      <ExecutiveLayout data={data} labels={labels} />
    ) : template === "modern" ? (
      <ModernLayout data={data} labels={labels} />
    ) : template === "creative" ? (
      <CreativeLayout data={data} labels={labels} />
    ) : template === "corporate" ? (
      <CorporateLayout data={data} labels={labels} />
    ) : template === "classic" ? (
      <ClassicLayout data={data} labels={labels} />
    ) : (
      <AtsLayout data={data} labels={labels} />
    );

  return <Document>{layout}</Document>;
}
