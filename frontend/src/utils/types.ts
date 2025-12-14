import * as v from "valibot";

export const DefectSchema = v.object({
  area: v.string(),
  id: v.string(),
  component: v.string(),
  description: v.string(),
  severity: v.string(),
  tags: v.array(v.string()),
  title: v.pipe(v.string(), v.nonEmpty("Title is required")),
});

export type DefectRecord = v.InferOutput<typeof DefectSchema>;

export interface DefectHotspot {
  area: string;
  risk: string;
  recommendation: string;
  priority: string;
}

export const AnalyzeDefectSchema = v.object({
  defects: v.pipe(v.string(), v.nonEmpty()),
  requirements: v.string(),
});

export type AnalyzeDefectRequest = v.InferOutput<typeof AnalyzeDefectSchema>;

export interface AnalyzeDefectResponse {
  hotspots: DefectHotspot[];
  summary: string;
  model_used: string;
}

export enum Framework {
  Pytest = "pytest",
  Playwright = "playwright",
  Selenium = "selenium",
}

export enum TestType {
  API = "API",
  UI = "UI",
}

export enum Priority {
  CRITICAL = "CRITICAL",
  NORMAL = "NORMAL",
  LOW = "LOW",
}

export enum IssueSeverity {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
}

export enum GapSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export interface TestCaseStep {
  step_number: number;
  description: string;
  action: string;
  expected_result: string;
}

export interface TestCase {
  title: string;
  function_name: string;
  feature: string;
  story: string;
  owner: string;
  priority: Priority;
  test_type: string;
  suite: string;
  jira_link?: string;
  jira_name?: string;
  steps: TestCaseStep[];
  arrange_section: string;
  act_section: string;
  assert_section: string;
  code: string;
}

export const GenerateManualTestCaseSchema = v.object({
  feature: v.pipe(v.string(), v.nonEmpty("Feature is required")),
  jira_link: v.pipe(v.string(), v.url(), v.nonEmpty("Jira Link is required")),
  jira_name: v.pipe(v.string(), v.nonEmpty("Jira Name is required")),
  owner: v.pipe(v.string(), v.nonEmpty("Owner is required")),
  priority: v.pipe(v.enum(Priority)),
  requirements: v.pipe(v.string(), v.nonEmpty("Requirements is required")),
  story: v.pipe(v.string(), v.nonEmpty("Story is required")),
  test_type: v.pipe(v.enum(TestType, "Test type should be either UI or API")),
});

export type GenerateManualTestCaseRequest = v.InferOutput<
  typeof GenerateManualTestCaseSchema
>;

export interface GenerateManualTestCaseResponse {
  test_case: TestCase;
  generation_time: number;
  model_used: string;
}

export interface UITestRequest {
  test_cases: string[];
  requirements: string;
  framework?: "pytest" | "playwright" | "selenium";
  browser?: string;
}

export interface APITestRequest {
  openapi_spec: string;
  test_cases?: string[];
  base_url: string;
  auth_token?: string;
  endpoints?: string[];
}

export const GenerateAutoTestCaseSchema = v.object({
  api_request: v.optional(
    v.object({
      auth_token: v.pipe(v.string()),
      base_url: v.pipe(v.string(), v.nonEmpty("BaseURL is required")),
      endpoints: v.array(v.string()),
      openapi_spec: v.pipe(v.string(), v.nonEmpty("OpenAPISpec is required")),
      test_cases: v.array(v.string()),
    }),
  ),
  test_type: v.pipe(v.enum(TestType, "Test type should be either UI or API")),
  ui_request: v.optional(
    v.object({
      browser: v.pipe(v.string()),
      framework: v.pipe(v.enum(Framework)),
      requirements: v.pipe(v.string()),
      test_cases: v.array(v.string()),
    }),
  ),
});

export type GenerateAutoTestCaseRequest = v.InferOutput<
  typeof GenerateAutoTestCaseSchema
>;

export interface GenerateAutoTestCaseResponse {
  test_code: string;
  test_count: number;
  framework: string;
  dependencies: string[];
  generation_time: number;
  model_used: string;
}

export interface CoverageAnalysis {
  total_functionality: number;
  covered_functionality: number;
  coverage_percentage: number;
  covered_areas: string[];
  uncovered_areas: string[];
}

export interface DuplicateTest {
  test_id_1: string;
  test_id_2: string;
  similarity_score: number;
  reason: string;
  recommendation: string;
}

export interface CoverageGap {
  functionality: string;
  severity: GapSeverity;
  description: string;
  suggested_tests: string[];
}

export interface OptimizationSuggestion {
  test_id?: string;
  suggestion_type: string;
  description: string;
  impact: string;
  effort: string;
}

export const OptimizeTestCaseSchema = v.object({
  requirements: v.pipe(v.string(), v.nonEmpty("Requirements is required")),
  test_cases: v.pipe(v.string(), v.nonEmpty("Test cases are required")),
});

export type OptimizeTestCaseRequest = v.InferOutput<
  typeof OptimizeTestCaseSchema
>;

export interface OptimizeTestCaseResponse {
  coverage_analysis: CoverageAnalysis;
  duplicates: DuplicateTest[];
  coverage_gaps: CoverageGap[];
  suggestions: OptimizationSuggestion[];
  outdated_tests: string[];
  conflicting_tests: string[];
}

export interface ValidationIssue {
  severity: IssueSeverity;
  field: string;
  issue: string;
  recommendation: string;
}

export interface ValidationResult {
  test_id: string;
  is_valid: boolean;
  issues: ValidationIssue[];
  aaa_compliance: boolean;
  allure_decorators_complete: boolean;
  structure_valid: boolean;
}

export const ValidateTestCaseSchema = v.object({
  strict_mode: v.boolean(),
  test_cases: v.pipe(v.string(), v.nonEmpty("Test cases are required")),
});

export type ValidateTestCaseRequest = v.InferOutput<
  typeof ValidateTestCaseSchema
>;

export interface ValidateTestCaseResponse {
  total_tests: number;
  valid_tests: number;
  invalid_tests: number;
  results: ValidationResult[];
  overall_compliance: number;
  summary: string;
}

export interface HealthCheck {
  status: string;
  openai_api: string;
  gitlab_api: string;
}

export const CommitTestCaseSchema = v.object({
  branch: v.pipe(v.string(), v.nonEmpty("Branch is required")),
  commit_message: v.pipe(v.string(), v.nonEmpty("Message is required")),
  content: v.pipe(v.string(), v.nonEmpty("Content is required")),
  file_path: v.pipe(v.string(), v.nonEmpty("File path is required")),
  project_id: v.pipe(v.string(), v.nonEmpty("Project ID is required")),
});

export type CommitTestCaseRequest = v.InferOutput<typeof CommitTestCaseSchema>;

export interface CommitTestCaseResponse {
  status: string;
  project_id: string;
  branch: string;
  file_path: string;
  commit_id?: string;
}

export const GenerateTestPlanSchema = v.object({
  environments: v.pipe(v.string()),
  goals: v.pipe(v.string(), v.nonEmpty("Goals are required")),
  out_of_scope: v.pipe(v.string()),
  product: v.pipe(v.string(), v.nonEmpty("Product is required")),
  risks: v.pipe(v.string()),
  scope: v.pipe(v.string(), v.nonEmpty("Scope is required")),
  timelines: v.pipe(v.string()),
});

export type GenerateTestPlanRequest = v.InferOutput<
  typeof GenerateTestPlanSchema
>;

export interface GenerateTestPlanResponse {
  plan: string;
  sections: string[];
  model_used: string;
}
