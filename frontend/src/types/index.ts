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

export interface GenerateManualTestCaseRequest {
  requirements: string;
  test_type: "UI" | "API";
  feature: string;
  story: string;
  owner: string;
  priority: Priority;
  jira_link?: string;
  jira_name?: string;
}

export interface GenerateManualTestCaseResponse {
  test_case: TestCase;
  generation_time: number;
  model_used: string;
}

export interface GenerateBatchTestCaseRequest {
  requirements: string;
  test_type: "UI" | "API";
  feature: string;
  story: string;
  owner: string;
  count: number;
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

export interface GenerateAutoTestCaseRequest {
  test_type: "UI" | "API";
  ui_request?: UITestRequest;
  api_request?: APITestRequest;
}

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

export interface OptimizeTestCaseRequest {
  test_cases: string[];
  requirements: string;
}

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

export interface ValidateTestCaseRequest {
  test_cases: string[];
  strict_mode?: boolean;
}

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

export interface CommitTestCaseRequest {
  project_id: string;
  branch: string;
  file_path: string;
  content: string;
  commit_message: string;
}

export interface CommitTestCaseResponse {
  status: string;
  project_id: string;
  branch: string;
  file_path: string;
  commit_id?: string;
}

export interface GenerateTestPlanRequest {
  product: string;
  goals: string[];
  scope: string;
  out_of_scope?: string;
  risks?: string;
  environments?: string;
  timelines?: string;
}

export interface GenerateTestPlanResponse {
  plan: string;
  sections: string[];
  model_used: string;
}

export interface DefectRecord {
  id?: string;
  title: string;
  component?: string;
  severity?: string;
  area?: string;
  tags?: string[];
  description?: string;
}

export interface DefectHotspot {
  area: string;
  risk: string;
  recommendation: string;
  priority: string;
}
export interface AnalyzeDefectRequest {
  defects: DefectRecord[];
  requirements?: string;
}

export interface AnalyzeDefectResponse {
  hotspots: DefectHotspot[];
  summary: string;
  model_used: string;
}
