/** Utility functions */

import { GapSeverity, IssueSeverity, Priority } from "../types";

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
};

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
