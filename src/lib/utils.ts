import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function calculateAtsScore(
  content: string,
  targetKeywords: string[]
): { score: number; matches: string[]; missing: string[] } {
  const normalizedContent = content.toLowerCase();
  const matches: string[] = [];
  const missing: string[] = [];

  targetKeywords.forEach((keyword) => {
    if (normalizedContent.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const score = Math.round((matches.length / targetKeywords.length) * 100);
  return { score, matches, missing };
}

export function checkAtsCompliance(content: string): { warnings: string[]; suggestions: string[] } {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (content.includes("\t")) {
    warnings.push("Avoid using tabs - use spaces for indentation");
  }
  if (content.match(/[^\x00-\x7F]/g)) {
    warnings.push("Avoid special characters - use standard ASCII characters");
  }
  if (content.length < 500) {
    suggestions.push("Resume content might be too short - add more details");
  }
  if (content.length > 5000) {
    suggestions.push("Resume content might be too long - keep it concise");
  }
  if (!content.match(/\d+%|\d+\+|\$\d+/g)) {
    suggestions.push("Add quantifiable achievements (numbers, percentages)");
  }

  return { warnings, suggestions };
}
