export interface ResumeData {
  personal: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  summary: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  jobTitle: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link: string;
  date: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  link: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  style: string;
  colorScheme: string;
  free: boolean;
  preview: string;
  description: string;
}

export interface AtsCheckResult {
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  warnings: string[];
  suggestions: string[];
}
