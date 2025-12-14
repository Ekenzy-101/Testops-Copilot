import yaml from "js-yaml";
import { toast } from "react-toastify";
import { DefectRecord, GapSeverity, IssueSeverity, Priority } from "./types";

export const copyToClipboard = async (text: string, language: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(language === "ru" ? "Скопировано" : "Copied");
    return true;
  } catch (err: any) {
    const defaultMessage =
      language === "ru"
        ? "Не удалось скопировать в буфер обмена."
        : "Failed to copy to clipboard:";
    toast.error(err?.message || defaultMessage);
    return false;
  }
};

export const getClassNameByPercentage = (
  percentage: number,
  styles: CSSModuleClasses,
) => {
  switch (true) {
    case percentage >= 80:
      return styles.success;
    case percentage >= 60:
      return styles.warning;
    default:
      return styles.error;
  }
};

export const getClassNameBySeverity = (
  severity: GapSeverity | IssueSeverity,
  styles: CSSModuleClasses,
) => {
  switch (severity) {
    case (GapSeverity.CRITICAL, GapSeverity.HIGH, IssueSeverity.ERROR):
      return styles.error;
    case (GapSeverity.MEDIUM, IssueSeverity.WARNING):
      return styles.warning;
    case IssueSeverity.INFO:
      return styles.info;
    default:
      return styles.success;
  }
};

export const getClassNameByPriority = (
  priority: Priority,
  styles: CSSModuleClasses,
) => {
  switch (priority) {
    case Priority.CRITICAL:
      return styles.error;
    case Priority.NORMAL:
      return styles.warning;
    default:
      return styles.success;
  }
};

export const parseDefects = (value: string): DefectRecord[] => {
  // Expected per-line: id|title|severity|area|tags(comma)
  return value
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const [id, title, severity, area, tags] = line
        .split("|")
        .map((p) => p?.trim());
      return {
        id: id || "",
        title: title || "",
        severity: severity || "",
        area: area || "",
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        component: "",
        description: "",
      };
    })
    .filter((d) => d.title);
};

export const parseTestCases = (value: string): string[] => {
  return value.split(/^\s*#\s*-+\s*$/m).filter((tc) => tc.trim());
};

export function unwrapMarkdownCodeFence(content: string): string {
  if (!content) return content;

  const codeFenceRegex =
    /^\s*```[\w-]*[^\S\r\n]*\r?\n([\s\S]*?)\r?\n```[^\S\r\n]*\s*$/;
  const match = content.match(codeFenceRegex);
  return match ? match[1] : content;
}

export function wrapInMarkdownCodeFence(content: string): string {
  if (!content) return "```\n```";

  const trimmed = content;
  if (isAlreadyFenced(trimmed)) return trimmed;

  const jsonContent = tryFormatJson(trimmed);
  if (jsonContent) return fence(jsonContent, "json");

  const yamlContent = tryFormatYaml(trimmed);
  if (yamlContent) return fence(yamlContent, "yaml");

  if (looksLikePython(trimmed)) return fence(trimmed, "python");

  return fence(trimmed);
}

function isAlreadyFenced(value: string): boolean {
  return value.startsWith("```") && value.endsWith("```");
}

function tryFormatJson(value: string): string | null {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return null;
  }
}

function tryFormatYaml(value: string): string | null {
  try {
    const parsed = yaml.load(value);
    return typeof parsed == "object" ? yaml.dump(parsed) : null;
  } catch {
    return null;
  }
}

function looksLikePython(value: string): boolean {
  return [
    /^def\s+\w+\s*\(/m,
    /^class\s+\w+/m,
    /^import\s+\w+/m,
    /^from\s+\w+\s+import/m,
    /^\s+[^:]+:\s*$/m,
    /#\s*\w+/m,
    /"""/m,
    /\bprint\s*\(/m,
    /\bself\b/m,
  ].some((pattern) => pattern.test(value));
}

function fence(value: string, language?: string): string {
  return `\`\`\`${language ?? ""}\n${value}\n\`\`\``;
}
