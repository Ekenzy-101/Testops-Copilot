/** API client service */
import type {
  TestCaseRequest,
  TestCaseResponse,
  TestCaseGenerationRequest,
  AutomatedTestRequest,
  AutomatedTestResponse,
  OptimizationRequest,
  OptimizationReport,
  ValidationRequest,
  ValidationReport,
  HealthCheck,
  GitLabCommitRequest,
  GitLabCommitResponse,
  TestPlanRequest,
  TestPlanResponse,
  DefectAnalysisRequest,
  DefectAnalysisResponse,
} from "../types/api";

const API_BASE_URL =
  process.env.PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: response.statusText }));
        throw new Error(
          error.detail || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  async generateAutomatedTests(
    request: AutomatedTestRequest,
  ): Promise<AutomatedTestResponse> {
    return this.request<AutomatedTestResponse>(
      "/api/v1/automated-tests/generate",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async analyzeDefects(
    request: DefectAnalysisRequest,
  ): Promise<DefectAnalysisResponse> {
    return this.request<DefectAnalysisResponse>("/api/v1/defects/analyze", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async commitTestCases(
    request: GitLabCommitRequest,
  ): Promise<GitLabCommitResponse> {
    return this.request<GitLabCommitResponse>("/api/v1/test-cases/commit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateTestCase(request: TestCaseRequest): Promise<TestCaseResponse> {
    return this.request<TestCaseResponse>("/api/v1/test-cases/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateTestCases(
    request: TestCaseGenerationRequest,
  ): Promise<TestCaseResponse[]> {
    return this.request<TestCaseResponse[]>(
      "/api/v1/test-cases/generate-batch",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  async generateTestPlan(request: TestPlanRequest): Promise<TestPlanResponse> {
    return this.request<TestPlanResponse>("/api/v1/test-plan/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async optimizeTestCases(
    request: OptimizationRequest,
  ): Promise<OptimizationReport> {
    return this.request<OptimizationReport>("/api/v1/test-cases/optimize", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async validateTestCases(
    request: ValidationRequest,
  ): Promise<ValidationReport> {
    return this.request<ValidationReport>("/api/v1/test-cases/validate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async healthCheck(): Promise<HealthCheck> {
    return this.request<HealthCheck>("/api/v1/health", {
      method: "GET",
    });
  }
}

export const apiClient = new ApiClient();
