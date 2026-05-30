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
  ChevronDown,
} from "lucide-react";
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";
import { TEMPLATES, ATS_KEYWORDS_BY_ROLE } from "@/lib/constants";
import { cn, generateId, formatDate, calculateAtsScore, checkAtsCompliance } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, SectionType } from "docx";

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

  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportPDF = () => {
    setShowExportMenu(false);

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const A4_WIDTH = 210;
    const A4_HEIGHT = 297;
    const MARGIN = 15;
    const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2;
    const RIGHT_COL_WIDTH = 60;
    const LEFT_COL_WIDTH = CONTENT_WIDTH - RIGHT_COL_WIDTH - 5;

    const colors: Record<string, { primary: string; secondary: string }> = {
      blue: { primary: "#2563eb", secondary: "#eff6ff" },
      slate: { primary: "#475569", secondary: "#f1f5f9" },
      teal: { primary: "#0891b2", secondary: "#f0fdfa" },
      emerald: { primary: "#059669", secondary: "#ecfdf5" },
      orange: { primary: "#ea580c", secondary: "#fff7ed" },
    };

    const colorScheme = colors[template.colorScheme] || colors.blue;
    const PRIMARY_COLOR = colorScheme.primary;

    let y = MARGIN;

    const truncateText = (text: string, maxWidth: number, fontSize: number): string => {
      pdf.setFontSize(fontSize);
      let truncated = text;
      while (pdf.getTextWidth(truncated) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      if (truncated !== text && truncated.length > 0) {
        truncated = truncated.slice(0, -3) + "...";
      }
      return truncated;
    };

    // Name
    pdf.setFontSize(18);
    pdf.setFont("Helvetica", "bold");
    pdf.setTextColor(PRIMARY_COLOR);
    const name = `${data.personal.firstName} ${data.personal.lastName}`;
    const nameWidth = pdf.getTextWidth(name);
    pdf.text(name, (A4_WIDTH - nameWidth) / 2, y);
    y += 8;

    // Title
    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "normal");
    pdf.setTextColor("#64748b");
    const titleWidth = pdf.getTextWidth(data.personal.jobTitle);
    pdf.text(data.personal.jobTitle, (A4_WIDTH - titleWidth) / 2, y);
    y += 6;

    // Contact
    pdf.setFontSize(10);
    pdf.setTextColor("#64748b");
    const contactItems = [
      data.personal.location,
      data.personal.email,
      data.personal.phone,
      data.personal.linkedin,
      data.personal.github,
    ].filter(Boolean);
    const contactText = contactItems.join(" | ");
    const maxContactWidth = CONTENT_WIDTH;
    const truncatedContact = truncateText(contactText, maxContactWidth, 10);
    const contactX = (A4_WIDTH - pdf.getTextWidth(truncatedContact)) / 2;
    pdf.text(truncatedContact, contactX, y);
    y += 10;

    // Line
    pdf.setLineWidth(2);
    pdf.setDrawColor(PRIMARY_COLOR);
    pdf.line(MARGIN, y, A4_WIDTH - MARGIN, y);
    y += 10;

    // Summary
    if (data.summary) {
      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(PRIMARY_COLOR);
      pdf.text("Professional Summary", MARGIN, y);
      y += 6;

      pdf.setFontSize(11);
      pdf.setFont("Helvetica", "normal");
      pdf.setTextColor("#475569");
      const summaryLines = pdf.splitTextToSize(data.summary, CONTENT_WIDTH);
      summaryLines.forEach((line: string) => {
        pdf.text(line, MARGIN, y);
        y += 5;
      });
      y += 8;
    }

    // Experience
    if (data.experience.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(PRIMARY_COLOR);
      pdf.text("Experience", MARGIN, y);
      y += 6;

      data.experience.forEach((exp) => {
        if (y > A4_HEIGHT - MARGIN - 25) {
          pdf.addPage();
          y = MARGIN;
        }

        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "bold");
        pdf.setTextColor("#1e293b");
        const truncatedPosition = truncateText(exp.position, LEFT_COL_WIDTH, 11);
        pdf.text(truncatedPosition, MARGIN, y);

        pdf.setFontSize(10);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor("#64748b");
        const locationWidth = pdf.getTextWidth(exp.location);
        const locationX = A4_WIDTH - MARGIN - locationWidth;
        pdf.text(exp.location, locationX > MARGIN ? locationX : MARGIN + LEFT_COL_WIDTH + 5, y);
        y += 5;

        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor("#475569");
        const truncatedCompany = truncateText(exp.company, LEFT_COL_WIDTH, 11);
        pdf.text(truncatedCompany, MARGIN, y);

        const dateText = `${exp.startDate} - ${exp.isCurrent ? "Present" : exp.endDate}`;
        const dateWidth = pdf.getTextWidth(dateText);
        const dateX = A4_WIDTH - MARGIN - dateWidth;
        pdf.setTextColor("#64748b");
        pdf.setFontSize(10);
        pdf.text(dateText, dateX > MARGIN ? dateX : MARGIN + LEFT_COL_WIDTH + 5, y);
        y += 5;

        pdf.setFontSize(10);
        pdf.setTextColor("#475569");
        exp.description.forEach((desc) => {
          const descLines = pdf.splitTextToSize(`• ${desc}`, CONTENT_WIDTH);
          descLines.forEach((line: string) => {
            if (y > A4_HEIGHT - MARGIN - 20) {
              pdf.addPage();
              y = MARGIN;
            }
            pdf.text(line, MARGIN, y);
            y += 4;
          });
        });
        y += 6;
      });
      y += 6;
    }

    // Education
    if (data.education.length > 0) {
      if (y > A4_HEIGHT - MARGIN - 25) {
        pdf.addPage();
        y = MARGIN;
      }

      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(PRIMARY_COLOR);
      pdf.text("Education", MARGIN, y);
      y += 6;

      data.education.forEach((edu) => {
        if (y > A4_HEIGHT - MARGIN - 25) {
          pdf.addPage();
          y = MARGIN;
        }

        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "bold");
        pdf.setTextColor("#1e293b");
        const truncatedSchool = truncateText(edu.school, LEFT_COL_WIDTH, 11);
        pdf.text(truncatedSchool, MARGIN, y);

        pdf.setFontSize(10);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor("#64748b");
        const eduLocationWidth = pdf.getTextWidth(edu.location);
        const eduLocationX = A4_WIDTH - MARGIN - eduLocationWidth;
        pdf.text(edu.location, eduLocationX > MARGIN ? eduLocationX : MARGIN + LEFT_COL_WIDTH + 5, y);
        y += 5;

        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor("#475569");
        const degreeField = `${edu.degree} in ${edu.field}`;
        const truncatedDegree = truncateText(degreeField, LEFT_COL_WIDTH, 11);
        pdf.text(truncatedDegree, MARGIN, y);

        const eduDateText = `${edu.startDate} - ${edu.endDate}`;
        const eduDateWidth = pdf.getTextWidth(eduDateText);
        const eduDateX = A4_WIDTH - MARGIN - eduDateWidth;
        pdf.setTextColor("#64748b");
        pdf.setFontSize(10);
        pdf.text(eduDateText, eduDateX > MARGIN ? eduDateX : MARGIN + LEFT_COL_WIDTH + 5, y);
        y += 5;

        if (edu.gpa) {
          pdf.setFontSize(10);
          pdf.setTextColor("#64748b");
          pdf.text(`GPA: ${edu.gpa}`, MARGIN, y);
          y += 5;
        }
        y += 4;
      });
      y += 6;
    }

    // Skills
    if (data.skills.length > 0) {
      if (y > A4_HEIGHT - MARGIN - 25) {
        pdf.addPage();
        y = MARGIN;
      }

      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(PRIMARY_COLOR);
      pdf.text("Skills", MARGIN, y);
      y += 6;

      pdf.setFontSize(10);
      pdf.setFont("Helvetica", "normal");
      pdf.setTextColor("#475569");

      let currentX = MARGIN;
      let lineHeight = 7;

      data.skills.forEach((skill) => {
        const skillWidth = pdf.getTextWidth(skill) + 8;
        if (currentX + skillWidth > A4_WIDTH - MARGIN) {
          currentX = MARGIN;
          y += lineHeight;
        }

        pdf.setFillColor("#f1f5f9");
        pdf.rect(currentX - 2, y - 4, skillWidth, lineHeight - 1, "F");
        pdf.text(skill, currentX + 2, y);
        currentX += skillWidth + 4;
      });
      y += lineHeight + 6;
    }

    // Projects
    if (data.projects.length > 0) {
      if (y > A4_HEIGHT - MARGIN - 25) {
        pdf.addPage();
        y = MARGIN;
      }

      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(PRIMARY_COLOR);
      pdf.text("Projects", MARGIN, y);
      y += 6;

      data.projects.forEach((proj) => {
        if (y > A4_HEIGHT - MARGIN - 25) {
          pdf.addPage();
          y = MARGIN;
        }

        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "bold");
        pdf.setTextColor("#1e293b");
        const truncatedTitle = truncateText(proj.title, LEFT_COL_WIDTH, 11);
        pdf.text(truncatedTitle, MARGIN, y);
        y += 5;

        pdf.setFontSize(10);
        pdf.setFont("Helvetica", "normal");
        pdf.setTextColor("#475569");
        const projDescLines = pdf.splitTextToSize(proj.description, CONTENT_WIDTH);
        projDescLines.forEach((line: string) => {
          pdf.text(line, MARGIN, y);
          y += 4;
        });

        if (proj.technologies.length > 0) {
          let techX = MARGIN;
          proj.technologies.forEach((tech) => {
            const techWidth = pdf.getTextWidth(tech) + 6;
            if (techX + techWidth > A4_WIDTH - MARGIN) {
              techX = MARGIN;
              y += 5;
            }
            pdf.setFillColor("#e2e8f0");
            pdf.rect(techX - 2, y - 3, techWidth, 5, "F");
            pdf.setTextColor("#64748b");
            pdf.setFontSize(9);
            pdf.text(tech, techX, y);
            techX += techWidth + 3;
          });
          y += 7;
        }
        y += 4;
      });
      y += 6;
    }

    // Certifications
    if (data.certifications.length > 0) {
      if (y > A4_HEIGHT - MARGIN - 25) {
        pdf.addPage();
        y = MARGIN;
      }

      pdf.setFontSize(12);
      pdf.setFont("Helvetica", "bold");
      pdf.setTextColor(PRIMARY_COLOR);
      pdf.text("Certifications", MARGIN, y);
      y += 6;

      data.certifications.forEach((cert) => {
        if (y > A4_HEIGHT - MARGIN - 25) {
          pdf.addPage();
          y = MARGIN;
        }

        pdf.setFontSize(11);
        pdf.setFont("Helvetica", "bold");
        pdf.setTextColor("#1e293b");
        const truncatedCertName = truncateText(cert.name, CONTENT_WIDTH - 60, 11);
        pdf.text(truncatedCertName, MARGIN, y);

        if (cert.issuer || cert.date) {
          const certInfo = [cert.issuer, cert.date].filter(Boolean).join(" | ");
          pdf.setFontSize(10);
          pdf.setFont("Helvetica", "normal");
          pdf.setTextColor("#64748b");
          pdf.text(certInfo, MARGIN, y + 5);
          y += 5;
        }
        y += 5;
      });
    }

    pdf.save(`${data.personal.firstName}_${data.personal.lastName}_Resume.pdf`);
  };

  const exportDOCX = async () => {
    setShowExportMenu(false);

    const paragraphs: any[] = [];
    const marginCm = 2.54;
    const marginTwips = marginCm * 567;

    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: `${data.personal.firstName} ${data.personal.lastName}`,
          bold: true,
          size: 28,
        }),
      ],
      spacing: { after: 120 },
      alignment: 'center',
    }));

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: data.personal.jobTitle || '', size: 22 })],
      spacing: { after: 200 },
      alignment: 'center',
    }));

    const contactInfo = [];
    if (data.personal.location) contactInfo.push(data.personal.location);
    if (data.personal.email) contactInfo.push(data.personal.email);
    if (data.personal.phone) contactInfo.push(data.personal.phone);
    if (data.personal.linkedin) contactInfo.push(data.personal.linkedin);
    if (data.personal.github) contactInfo.push(data.personal.github);
    if (data.personal.website) contactInfo.push(data.personal.website);

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: contactInfo.join(' | '), size: 20 })],
      spacing: { after: 280 },
      alignment: 'center',
    }));

    if (data.summary) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Professional Summary', bold: true, size: 22 })],
        spacing: { after: 120 },
        alignment: 'center',
      }));
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: data.summary, size: 20 })],
        spacing: { after: 280 },
        alignment: 'center',
      }));
    }

    if (data.experience.length > 0) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Experience', bold: true, size: 22 })],
        spacing: { after: 120 },
        alignment: 'center',
      }));

      data.experience.forEach((exp) => {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `${exp.position}`, bold: true, size: 20 }),
            new TextRun({ text: ` - ${exp.company}`, size: 20 }),
          ],
          spacing: { after: 60 },
          alignment: 'center',
        }));

        const expDates = `${formatDate(exp.startDate)} - ${exp.isCurrent ? 'Present' : formatDate(exp.endDate)}`;
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: exp.location ? `${exp.location} | ` : '', size: 20 }),
            new TextRun({ text: expDates, size: 20 }),
          ],
          spacing: { after: 100 },
          alignment: 'center',
        }));

        exp.description.forEach((desc) => {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `• ${desc}`, size: 20 })],
            spacing: { after: 60 },
            alignment: 'center',
          }));
        });

        paragraphs.push(new Paragraph({ spacing: { after: 160 } }));
      });
    }

    if (data.education.length > 0) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Education', bold: true, size: 22 })],
        spacing: { after: 120 },
        alignment: 'center',
      }));

      data.education.forEach((edu) => {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree}`, bold: true, size: 20 }),
            new TextRun({ text: ` - ${edu.school}`, size: 20 }),
          ],
          spacing: { after: 60 },
          alignment: 'center',
        }));

        const eduDates = `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: edu.location ? `${edu.location} | ` : '', size: 20 }),
            new TextRun({ text: eduDates, size: 20 }),
          ],
          spacing: { after: 60 },
          alignment: 'center',
        }));

        if (edu.field) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `${edu.field}`, size: 20 })],
            spacing: { after: 60 },
            alignment: 'center',
          }));
        }

        if (edu.gpa) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 20 })],
            spacing: { after: 160 },
            alignment: 'center',
          }));
        } else {
          paragraphs.push(new Paragraph({ spacing: { after: 160 } }));
        }
      });
    }

    if (data.skills.length > 0) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Skills', bold: true, size: 22 })],
        spacing: { after: 120 },
        alignment: 'center',
      }));
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: data.skills.join(', '), size: 20 })],
        spacing: { after: 280 },
        alignment: 'center',
      }));
    }

    if (data.projects.length > 0) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Projects', bold: true, size: 22 })],
        spacing: { after: 120 },
        alignment: 'center',
      }));

      data.projects.forEach((proj) => {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `${proj.title}`, bold: true, size: 20 }),
            new TextRun({ text: ` (${proj.technologies})`, size: 20 }),
          ],
          spacing: { after: 60 },
          alignment: 'center',
        }));

        if (proj.description) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: proj.description, size: 20 })],
            spacing: { after: 160 },
            alignment: 'center',
          }));
        } else {
          paragraphs.push(new Paragraph({ spacing: { after: 160 } }));
        }
      });
    }

    if (data.certifications.length > 0) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Certifications', bold: true, size: 22 })],
        spacing: { after: 120 },
        alignment: 'center',
      }));

      data.certifications.forEach((cert) => {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `${cert.name}`, bold: true, size: 20 }),
            new TextRun({ text: ` - ${cert.issuer}`, size: 20 }),
          ],
          spacing: { after: 60 },
          alignment: 'center',
        }));

        if (cert.date) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `Issued: ${formatDate(cert.date)}`, size: 20 })],
            spacing: { after: 160 },
            alignment: 'center',
          }));
        } else {
          paragraphs.push(new Paragraph({ spacing: { after: 160 } }));
        }
      });
    }

    const doc = new Document({
      sections: [{
        children: paragraphs,
        properties: {
          page: {
            margin: {
              top: marginTwips,
              right: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
            },
          },
        },
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.personal.firstName}_${data.personal.lastName}_Resume.docx`;
      a.click();
      URL.revokeObjectURL(url);
    });
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
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {t.editor.downloadPdf}
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                    <button
                      onClick={exportPDF}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
                      </svg>
                      <span className="text-slate-700">Export PDF</span>
                    </button>
                    <button
                      onClick={exportDOCX}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
                      </svg>
                      <span className="text-slate-700">Export DOCX</span>
                    </button>
                    <div className="border-t border-slate-100 my-2" />
                    <div className="px-4 pb-2">
                      <p className="text-xs text-slate-500">{t.editor.pdfTip.note}</p>
                    </div>
                  </div>
                </>
              )}
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

        {/* Middle - Editor - Narrower */}
        <div className="w-96 bg-slate-50 overflow-y-auto p-4 flex-shrink-0">
          <EditorSection
            activeSection={activeSection}
            data={data}
            updateData={updateData}
            t={t}
          />
        </div>

        {/* Right - Preview - Wider */}
        <div className="flex-1 bg-white border-l overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{t.editor.preview}</span>
          </div>
          <div className="p-6 bg-slate-200">
            <div
              ref={resumeRef}
              className="bg-white shadow-lg mx-auto"
              style={{ minHeight: "1056px", width: "816px" }}
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
          <Input label={t.editor.labels.firstName} value={data.personal.firstName} onChange={(v: string) => updateData({ personal: { ...data.personal, firstName: v } })} />
          <Input label={t.editor.labels.lastName} value={data.personal.lastName} onChange={(v: string) => updateData({ personal: { ...data.personal, lastName: v } })} />
          <Input label={t.editor.labels.jobTitle} value={data.personal.jobTitle} onChange={(v: string) => updateData({ personal: { ...data.personal, jobTitle: v } })} />
          <Input label={t.editor.labels.email} value={data.personal.email} onChange={(v: string) => updateData({ personal: { ...data.personal, email: v } })} />
          <Input label={t.editor.labels.phone} value={data.personal.phone} onChange={(v: string) => updateData({ personal: { ...data.personal, phone: v } })} />
          <Input label={t.editor.labels.location} value={data.personal.location} onChange={(v: string) => updateData({ personal: { ...data.personal, location: v } })} />
          <Input label={t.editor.labels.linkedin} value={data.personal.linkedin} onChange={(v: string) => updateData({ personal: { ...data.personal, linkedin: v } })} />
          <Input label={t.editor.labels.github} value={data.personal.github} onChange={(v: string) => updateData({ personal: { ...data.personal, github: v } })} />
          <TextArea label={t.editor.labels.summary} value={data.summary} onChange={(v: string) => updateData({ summary: v })} />
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
            <Input label={t.editor.labels.company} value={exp.company} onChange={(v: string) => updateExp(i, "company", v)} />
            <Input label={t.editor.labels.position} value={exp.position} onChange={(v: string) => updateExp(i, "position", v)} />
            <Input label={t.editor.labels.location} value={exp.location} onChange={(v: string) => updateExp(i, "location", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.startDate} type="month" value={exp.startDate} onChange={(v: string) => updateExp(i, "startDate", v)} />
            <Input label={t.editor.labels.endDate} type="month" value={exp.endDate} onChange={(v: string) => updateExp(i, "endDate", v)} />
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
            onChange={(v: string) => updateExp(i, "description", v.split("\n").filter((x: string) => x))}
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
          <Input label={t.editor.labels.school} value={edu.school} onChange={(v: string) => updateEdu(i, "school", v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.degree} value={edu.degree} onChange={(v: string) => updateEdu(i, "degree", v)} />
            <Input label={t.editor.labels.field} value={edu.field} onChange={(v: string) => updateEdu(i, "field", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.editor.labels.startDate} type="month" value={edu.startDate} onChange={(v: string) => updateEdu(i, "startDate", v)} />
            <Input label={t.editor.labels.endDate} type="month" value={edu.endDate} onChange={(v: string) => updateEdu(i, "endDate", v)} />
          </div>
          <Input label={t.editor.labels.gpa} value={edu.gpa} onChange={(v: string) => updateEdu(i, "gpa", v)} />
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
          <Input label={t.editor.labels.projectTitle} value={proj.title} onChange={(v: string) => updateProj(i, "title", v)} />
          <TextArea label={t.editor.labels.description} value={proj.description} onChange={(v: string) => updateProj(i, "description", v)} />
          <Input label={t.editor.labels.technologies} value={proj.technologies.join(", ")} onChange={(v: string) => updateProj(i, "technologies", v.split(",").map((x: string) => x.trim()))} />
          <Input label={t.editor.labels.link} value={proj.link} onChange={(v: string) => updateProj(i, "link", v)} />
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
          <Input label={t.editor.labels.certificationName} value={cert.name} onChange={(v: string) => updateCert(i, "name", v)} />
          <Input label={t.editor.labels.issuer} value={cert.issuer} onChange={(v: string) => updateCert(i, "issuer", v)} />
          <Input label={t.editor.labels.date} type="month" value={cert.date} onChange={(v: string) => updateCert(i, "date", v)} />
          <Input label={t.editor.labels.credentialId} value={cert.credentialId} onChange={(v: string) => updateCert(i, "credentialId", v)} />
          <Input label={t.editor.labels.link} value={cert.link} onChange={(v: string) => updateCert(i, "link", v)} />
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
    <div
      id="resume-container"
      className="text-slate-900"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        fontSize: '11pt',
        lineHeight: '1.45',
        fontFamily: 'Arial, Helvetica, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', maxWidth: '180mm', margin: '0 auto', overflow: 'hidden' }}>
        <div className="text-center border-b-2 pb-5 mb-5" style={{ borderColor: colorScheme.primary }}>
          <h1 className="font-bold mb-2" style={{ fontSize: '16pt', color: colorScheme.primary }}>
            {data.personal.firstName} {data.personal.lastName}
          </h1>
          <p className="mb-2" style={{ fontSize: '12pt', color: '#64748b' }}>{data.personal.jobTitle}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm" style={{ color: '#64748b', fontSize: '10pt', overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.personal.location}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.personal.email}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.personal.phone}</span>
            {data.personal.linkedin && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.personal.linkedin}</span>}
            {data.personal.github && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.personal.github}</span>}
          </div>
        </div>

        {data.summary && (
          <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="font-bold mb-2" style={{ fontSize: '12pt', color: colorScheme.primary }}>
              Professional Summary
            </h2>
            <p style={{ color: '#475569', fontSize: '11pt', lineHeight: '1.45' }}>{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="font-bold mb-2" style={{ fontSize: '12pt', color: colorScheme.primary }}>
              Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-1" style={{ width: '100%', display: 'flex' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="font-semibold" style={{ color: '#1e293b', fontSize: '11pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.position}</div>
                    <div style={{ color: '#475569', fontSize: '11pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.company}</div>
                  </div>
                  <div className="text-right" style={{ width: '180px', flexShrink: 0, overflow: 'hidden', textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.location}</div>
                    <div style={{ color: '#64748b', fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1" style={{ fontSize: '10pt', lineHeight: '1.4', color: '#475569', paddingLeft: '0', marginLeft: '0' }}>
                  {exp.description.map((item, i) => (
                    <li key={i} style={{ wordBreak: 'break-word', overflow: 'hidden' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

      {data.education.length > 0 && (
          <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="font-bold mb-2" style={{ fontSize: '12pt', color: colorScheme.primary }}>
              Education
            </h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start mb-1" style={{ width: '100%', display: 'flex' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="font-semibold" style={{ color: '#1e293b', fontSize: '11pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.school}</div>
                    <div style={{ color: '#475569', fontSize: '11pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {edu.degree} in {edu.field}
                    </div>
                  </div>
                  <div className="text-right" style={{ width: '180px', flexShrink: 0, overflow: 'hidden', textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{edu.location}</div>
                    <div style={{ color: '#64748b', fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </div>
                  </div>
                </div>
                {edu.gpa && <div className="text-sm" style={{ color: '#64748b', fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="font-bold mb-2" style={{ fontSize: '12pt', color: colorScheme.primary }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 rounded text-sm" style={{ backgroundColor: colorScheme.secondary, fontSize: '10pt', color: '#475569' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="font-bold mb-2" style={{ fontSize: '12pt', color: colorScheme.primary }}>
              Projects
            </h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-start mb-1" style={{ width: '100%', display: 'flex' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="font-semibold" style={{ color: '#1e293b', fontSize: '11pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.title}</div>
                  </div>
                  <div style={{ width: '80px', flexShrink: 0, overflow: 'hidden', textAlign: 'right' }}>
                    {proj.link && <a href={proj.link} className="text-sm" style={{ color: colorScheme.primary, fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Link</a>}
                  </div>
                </div>
                <p className="mb-1" style={{ fontSize: '10pt', color: '#475569', wordBreak: 'break-word', overflow: 'hidden' }}>{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1" style={{ overflow: 'hidden' }}>
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded" style={{ fontSize: '9pt' }}>
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
          <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="font-bold mb-2" style={{ fontSize: '12pt', color: colorScheme.primary }}>
              Certifications
            </h2>
            {data.certifications.map((cert) => (
              <div key={cert.id} className="mb-2">
                <div className="font-semibold" style={{ color: '#1e293b', fontSize: '11pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.name}</div>
                <div className="text-sm" style={{ color: '#475569', fontSize: '10pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.issuer}</div>
                {cert.date && <div className="text-xs" style={{ color: '#94a3b8', fontSize: '9pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDate(cert.date)}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
