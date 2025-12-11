/** Utility functions */

import yaml from "js-yaml";
import { toast } from "react-toastify";
import { GapSeverity, IssueSeverity, Priority } from "../types";

export const copyToClipboard = async (text: string, language: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(language === "ru" ? "Скопировано" : "Copied");
  } catch (err: any) {
    const defaultMessage =
      language === "ru"
        ? "Не удалось скопировать в буфер обмена."
        : "Failed to copy to clipboard:";
    toast.error(err?.message || defaultMessage);
  }
};

export function extractContentInMarkdown(content: string): string {
  if (!content) return content;

  const trimmed = content.trim();
  const fenceRegex = /^```[\w-]*\s*\n([\s\S]*?)\n```$/;

  const match = trimmed.match(fenceRegex);
  if (match) {
    return match[1].trim();
  }

  return content;
}

export function wrapContentInMarkdown(content: string): string {
  if (!content) return "```\n```";

  const trimmed = content.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return "```json\n" + `${JSON.stringify(parsed, null, 2)}` + "\n```";
  } catch {}

  try {
    const parsed = yaml.load(trimmed);
    if (parsed !== undefined && parsed !== null) {
      return "```yaml\n" + `${yaml.dump(parsed)}` + "\n```";
    }
  } catch {}

  const pythonPatterns = [
    /^def\s+\w+\s*\(/m, // def foo(...)
    /^class\s+\w+/m, // class Foo:
    /^import\s+\w+/m, // import x
    /^from\s+\w+\s+import/m, // from x import y
    /^\s+[^:]+:\s*$/m, // indentation + colon
    /#\s*\w+/m, // comments
    /"""/m, // triple quotes
    /\bprint\s*\(/m, // print(...)
    /\bself\b/m, // Python OOP
  ];

  if (pythonPatterns.some((re) => re.test(trimmed))) {
    return "```python\n" + `${trimmed}` + "\n```";
  }

  return "```\n" + `${trimmed}` + "\n```";
}

export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatTime = (seconds: number): string => {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)}ms`;
  }
  return `${seconds.toFixed(2)}s`;
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

/** Constants */

export const APP_NAME = "Kenzy QA Copilot";
export const TO_ANALYZE_DEFECT = "/defects/analyze";
export const TO_COMMIT_TEST_CASE = "/test-cases/commit";
export const TO_GENERATE_AUTO_TEST_CASE = "/test-cases/generate-auto";
export const TO_GENERATE_MANUAL_TEST_CASE = "/test-cases/generate-manual";
export const TO_GENERATE_TEST_PLAN = "/test-plans/generate";
export const TO_OPTIMIZE_TEST_CASE = "/test-cases/optimize";
export const TO_VALIDATE_TEST_CASE = "/test-cases/validate";
