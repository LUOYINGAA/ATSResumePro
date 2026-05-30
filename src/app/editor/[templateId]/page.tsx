"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";
import { TEMPLATES, ATS_KEYWORDS_BY_ROLE } from "@/lib/constants";
import { cn, generateId, formatDate, calculateAtsScore, checkAtsCompliance } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

const INITIAL_DATA: ResumeData = {
  personal: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    location: "New York, NY",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    website: "",
    jobTitle: "Senior Software Engineer",
  },
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2021-01",
      endDate: "",
      isCurrent: true,
      description: [
        "Developed and maintained web applications using React and Node.js",
        "Led team of 5 engineers to deliver major product features",
        "Improved application performance by 40%",
      ],
    },
  ],
  education: [
    {
      id: "1",
      school: "University of California",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2014-08",
      endDate: "2018-05",
      gpa: "3.8",
      description: ["Dean's List, 2016-2018"],
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "AWS", "Docker"],
  projects: [],
  certifications: [],
  summary: "Experienced software engineer with a passion for building scalable web applications.",
};

export default function EditorPage({ params }: { params: { templateId: string } }) {
  const router = useRouter();
  const { t } = useI18n();
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [activeSection, setActiveSection] = useState("personal");
  const [showAtsCheck, setShowAtsCheck] = useState(false);
  const [atsResults, setAtsResults] = useState<any>(null);
  const [targetRole, setTargetRole] = useState("Software Developer");
  const resumeRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find((t) => t.id === params.templateId) || TEMPLATES[0];

  const updateData = useCallback(
    (newData: Partial<ResumeData>) => {
      setData((prev) => ({ ...prev, ...newData }));
    },
    []
  );

  const runAtsCheck = () => {
    const fullText = [
      data.summary,
      ...data.experience.map((e) => e.description.join("\n")),
      ...data.education.map((e) => e.description.join("\n")),
      ...data.skills,
      data.personal.jobTitle,
    ].join("\n");

    const keywords = ATS_KEYWORDS_BY_ROLE[targetRole as keyof typeof ATS_KEYWORDS_BY_ROLE] || [];
    const { score, matches, missing } = calculateAtsScore(fullText, keywords);
    const { warnings, suggestions } = checkAtsCompliance(fullText);

    setAtsResults({ score, matches, missing, warnings, suggestions });
    setShowAtsCheck(true);
  };

  const exportPDF = async () => {
    if (!resumeRef.current) return;

    try {
      const dataUrl = await toPng(resumeRef.current, { quality: 1 });
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.personal.firstName}_${data.personal.lastName}_Resume.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/templates")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-slate-900">{t.editor.title}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {template.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={runAtsCheck}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t.editor.atsCheck}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {t.editor.downloadPdf}
              </button>
              <details className="group relative">
                <summary className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">{t.editor.pdfTip.title}</h4>
                  <p className="text-sm text-slate-600 mb-3">{t.editor.pdfTip.content}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">•</span>
                      <span className="text-slate-600">{t.editor.pdfTip.junior}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">•</span>
                      <span className="text-slate-600">{t.editor.pdfTip.senior}</span>
                    </li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">{t.editor.pdfTip.note}</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sections */}
        <div className="w-64 bg-white border-r overflow-y-auto no-scrollbar flex-shrink-0">
          <div className="p-4">
            <nav className="space-y-1">
              {[
                { id: "personal", label: t.editor.sections.personal },
                { id: "experience", label: t.editor.sections.experience },
                { id: "education", label: t.editor.sections.education },
                { id: "skills", label: t.editor.sections.skills },
                { id: "projects", label: t.editor.sections.projects },
                { id: "certifications", label: t.editor.sections.certifications },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Middle - Editor */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-2xl mx-auto">
            <EditorSection
              activeSection={activeSection}
              data={data}
              updateData={updateData}
              t={t}
            />
          </div>
        </div>

        {/* Right - Preview */}
        <div className="w-[450px] bg-white border-l overflow-y-auto flex-shrink-0">
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{t.editor.preview}</span>
          </div>
          <div className="p-6 bg-slate-200">
            <div
              ref={resumeRef}
              className="bg-white shadow-lg"
              style={{ minHeight: "1056px", width: "100%" }}
            >
              <ResumeTemplate data={data} template={template} />
            </div>
          </div>
        </div>
      </div>

      {/* ATS Check Modal */}
      {showAtsCheck && atsResults && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{t.editor.atsModal.title}</h2>
                <button
                  onClick={() => setShowAtsCheck(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Score */}
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl">
                <div className="text-5xl font-bold text-primary-600 mb-2">{atsResults.score}%</div>
                <div className="text-slate-600">{t.editor.atsModal.score}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {t.editor.atsModal.keywordsFound} ({atsResults.matches.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {atsResults.matches.map((k: string, i: number) => (
                      <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    {t.editor.atsModal.missingKeywords} ({atsResults.missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {atsResults.missing.map((k: string, i: number) => (
                      <span key={i} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {atsResults.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">{t.editor.atsModal.warnings}</h3>
                  <ul className="space-y-2">
                    {atsResults.warnings.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {atsResults.suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">{t.editor.atsModal.suggestions}</h3>
                  <ul className="space-y-2">
                    {atsResults.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Sparkles className="w-4 h-4 text-primary-500 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorSection({
  activeSection,
  data,
  updateData,
  t,
}: {
  activeSection: string;
  data: ResumeData;
  updateData: (d: Partial<ResumeData>) => void;
  t: any;
}) {
  switch (activeSection) {
    case "personal":
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{t.editor.sections.personal}</h2>
          <Input label={t.editor.labels.firstName} value={data.personal.firstName} onChange={(v) => updateData({ personal: { ...data.personal, firstName: v } })} />
          <Input label={t.editor.labels.lastName} value={data.personal.lastName} onChange={(v) => updateData({ personal: { ...data.personal, lastName: v } })} />
          <Input label={t.editor.labels.jobTitle} value={data.personal.jobTitle} onChange={(v) => updateData({ personal: { ...data.personal, jobTitle: v } })} />
          <Input label={t.editor.labels.email} value={data.personal.email} onChange={(v) => updateData({ personal: { ...data.personal, email: v } })} />
          <Input label={t.editor.labels.phone} value={data.personal.phone} onChange={(v) => updateData({ personal: { ...data.personal, phone: v } })} />
          <Input label={t.editor.labels.location} value={data.personal.location} onChange={(v) => updateData({ personal: { ...data.personal, location: v } })} />
          <Input label={t.editor.labels.linkedin} value={data.personal.linkedin} onChange={(v) => updateData({ personal: { ...data.personal, linkedin: v } })} />
          <Input label={t.editor.labels.github} value={data.personal.github} onChange={(v) => updateData({ personal: { ...data.personal, github: v } })} />
          <TextArea label={t.editor.labels.summary} value={data.summary} onChange={(v) => updateData({ summary: v })} />
        </div>
      );

    case "experience":
      return (
        <ExperienceEditor data={data} updateData={updateData} t={t} />
      );

    case "education":
      return (
        <EducationEditor data={data} updateData={updateData} t={t} />
      );

    case "skills":
      return (
        <SkillsEditor data={data} updateData={updateData} t={t} />
      );

    case "projects":
      return (
        <ProjectsEditor data={data} updateData={updateData} t={t} />
      );

    case "certifications":
      return (
        <CertificationsEditor data={data} updateData={updateData} t={t} />
      );

    default:
      return null;
  }
}

function ExperienceEditor({ data, updateData, t }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t.editor.sections.experience}</h2>
        <button
          onClick={() => {
            const newExp: ExperienceItem = {
              id: generateId(),
              company: "",
              position: "",
              location: "",
              startDate: "",
              endDate: "",
              isCurrent: true,
              description: [],
            };
            updateData({ experience: [...data.experience, newExp] });
          }}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {data.experience.map((exp: any, i: number) => (
        <div key={exp.id} className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Experience {i + 1}</span>
            <button
              onClick={() => updateData({ experience: data.experience.filter((e: any) => e.id !== exp.id) })}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.company} value={exp.company} onChange={(v) => updateExp(i, "company", v)} />
            <Input label={t.editor.labels.position} value={exp.position} onChange={(v) => updateExp(i, "position", v)} />
            <Input label={t.editor.labels.location} value={exp.location} onChange={(v) => updateExp(i, "location", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.startDate} type="month" value={exp.startDate} onChange={(v) => updateExp(i, "startDate", v)} />
            <Input label={t.editor.labels.endDate} type="month" value={exp.endDate} onChange={(v) => updateExp(i, "endDate", v)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={exp.isCurrent}
              onChange={(e) => updateExp(i, "isCurrent", e.target.checked)}
            />
            {t.editor.labels.currentlyWorkHere}
          </label>
          <TextArea
            label={t.editor.labels.description}
            value={exp.description.join("\n")}
            onChange={(v) => updateExp(i, "description", v.split("\n").filter((x: string) => x))}
          />
        </div>
      ))}
    </div>
  );

  function updateExp(index: number, field: string, value: any) {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    updateData({ experience: newExp });
  }
}

function EducationEditor({ data, updateData, t }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t.editor.sections.education}</h2>
        <button
          onClick={() => {
            const newEdu: EducationItem = {
              id: generateId(),
              school: "",
              degree: "",
              field: "",
              location: "",
              startDate: "",
              endDate: "",
              gpa: "",
              description: [],
            };
            updateData({ education: [...data.education, newEdu] });
          }}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {data.education.map((edu: any, i: number) => (
        <div key={edu.id} className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Education {i + 1}</span>
            <button
              onClick={() => updateData({ education: data.education.filter((e: any) => e.id !== edu.id) })}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Input label={t.editor.labels.school} value={edu.school} onChange={(v) => updateEdu(i, "school", v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.degree} value={edu.degree} onChange={(v) => updateEdu(i, "degree", v)} />
            <Input label={t.editor.labels.field} value={edu.field} onChange={(v) => updateEdu(i, "field", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.startDate} type="month" value={edu.startDate} onChange={(v) => updateEdu(i, "startDate", v)} />
            <Input label={t.editor.labels.endDate} type="month" value={edu.endDate} onChange={(v) => updateEdu(i, "endDate", v)} />
          </div>
          <Input label={t.editor.labels.gpa} value={edu.gpa} onChange={(v) => updateEdu(i, "gpa", v)} />
        </div>
      ))}
    </div>
  );

  function updateEdu(index: number, field: string, value: any) {
    const newEdu = [...data.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    updateData({ education: newEdu });
  }
}

function SkillsEditor({ data, updateData, t }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{t.editor.sections.skills}</h2>
      <div className="bg-white border rounded-xl p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {data.skills.map((skill: string, i: number) => (
            <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {skill}
              <button
                onClick={() => updateData({ skills: data.skills.filter((_: any, idx: number) => idx !== i) })}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.target as HTMLFormElement;
            const value = (input.elements as any).newSkill.value;
            if (value && !data.skills.includes(value)) {
              updateData({ skills: [...data.skills, value] });
              (input.elements as any).newSkill.value = "";
            }
          }}
        >
          <input
            type="text"
            name="newSkill"
            placeholder={t.editor.labels.addSkill}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </form>
      </div>
    </div>
  );
}

function ProjectsEditor({ data, updateData, t }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t.editor.sections.projects}</h2>
        <button
          onClick={() => {
            const newProj: ProjectItem = {
              id: generateId(),
              title: "",
              description: "",
              technologies: [],
              link: "",
              date: "",
            };
            updateData({ projects: [...data.projects, newProj] });
          }}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {data.projects.map((proj: any, i: number) => (
        <div key={proj.id} className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Project {i + 1}</span>
            <button
              onClick={() => updateData({ projects: data.projects.filter((p: any) => p.id !== proj.id) })}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Input label={t.editor.labels.projectTitle} value={proj.title} onChange={(v) => updateProj(i, "title", v)} />
          <TextArea label={t.editor.labels.description} value={proj.description} onChange={(v) => updateProj(i, "description", v)} />
          <Input label={t.editor.labels.technologies} value={proj.technologies.join(", ")} onChange={(v) => updateProj(i, "technologies", v.split(",").map((x: string) => x.trim()))} />
          <Input label={t.editor.labels.link} value={proj.link} onChange={(v) => updateProj(i, "link", v)} />
        </div>
      ))}
    </div>
  );

  function updateProj(index: number, field: string, value: any) {
    const newProj = [...data.projects];
    newProj[index] = { ...newProj[index], [field]: value };
    updateData({ projects: newProj });
  }
}

function CertificationsEditor({ data, updateData, t }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t.editor.sections.certifications}</h2>
        <button
          onClick={() => {
            const newCert: CertificationItem = {
              id: generateId(),
              name: "",
              issuer: "",
              date: "",
              credentialId: "",
              link: "",
            };
            updateData({ certifications: [...data.certifications, newCert] });
          }}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {data.certifications.map((cert: any, i: number) => (
        <div key={cert.id} className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Certification {i + 1}</span>
            <button
              onClick={() => updateData({ certifications: data.certifications.filter((c: any) => c.id !== cert.id) })}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Input label={t.editor.labels.certificationName} value={cert.name} onChange={(v) => updateCert(i, "name", v)} />
          <Input label={t.editor.labels.issuer} value={cert.issuer} onChange={(v) => updateCert(i, "issuer", v)} />
          <Input label={t.editor.labels.date} type="month" value={cert.date} onChange={(v) => updateCert(i, "date", v)} />
          <Input label={t.editor.labels.credentialId} value={cert.credentialId} onChange={(v) => updateCert(i, "credentialId", v)} />
          <Input label={t.editor.labels.link} value={cert.link} onChange={(v) => updateCert(i, "link", v)} />
        </div>
      ))}
    </div>
  );

  function updateCert(index: number, field: string, value: any) {
    const newCert = [...data.certifications];
    newCert[index] = { ...newCert[index], [field]: value };
    updateData({ certifications: newCert });
  }
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
      />
    </div>
  );
}

function ResumeTemplate({ data, template }: { data: ResumeData; template: any }) {
  const colors: Record<string, { primary: string; secondary: string }> = {
    blue: { primary: "#2563eb", secondary: "#eff6ff" },
    slate: { primary: "#475569", secondary: "#f1f5f9" },
    teal: { primary: "#0891b2", secondary: "#f0fdfa" },
    emerald: { primary: "#059669", secondary: "#ecfdf5" },
    orange: { primary: "#ea580c", secondary: "#fff7ed" },
  };

  const colorScheme = colors[template.colorScheme] || colors.blue;

  return (
    <div className="p-8 text-slate-900">
      <div className="text-center border-b-2 pb-6 mb-6" style={{ borderColor: colorScheme.primary }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colorScheme.primary }}>
          {data.personal.firstName} {data.personal.lastName}
        </h1>
        <p className="text-lg text-slate-700 mb-3">{data.personal.jobTitle}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>{data.personal.location}</span>
          <span>{data.personal.email}</span>
          <span>{data.personal.phone}</span>
          {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
          {data.personal.github && <span>{data.personal.github}</span>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ color: colorScheme.primary }}>
            Professional Summary
          </h2>
          <p className="text-slate-700">{data.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: colorScheme.primary }}>
            Experience
          </h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-semibold text-slate-900">{exp.position}</div>
                  <div className="text-slate-700">{exp.company}</div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  {exp.location}
                  <div>
                    {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside mt-2 text-slate-700 text-sm space-y-1">
                {exp.description.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: colorScheme.primary }}>
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-semibold text-slate-900">{edu.school}</div>
                  <div className="text-slate-700">
                    {edu.degree} in {edu.field}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  {edu.location}
                  <div>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                </div>
              </div>
              {edu.gpa && <div className="text-sm text-slate-600">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: colorScheme.primary }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded text-sm" style={{ backgroundColor: colorScheme.secondary }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: colorScheme.primary }}>
            Projects
          </h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <div className="font-semibold text-slate-900">{proj.title}</div>
                {proj.link && <a href={proj.link} className="text-sm" style={{ color: colorScheme.primary }}>Link</a>}
              </div>
              <p className="text-sm text-slate-700 mb-1">{proj.description}</p>
              {proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: colorScheme.primary }}>
            Certifications
          </h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <div className="font-semibold text-slate-900">{cert.name}</div>
              <div className="text-sm text-slate-700">{cert.issuer}</div>
              {cert.date && <div className="text-xs text-slate-500">{formatDate(cert.date)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
