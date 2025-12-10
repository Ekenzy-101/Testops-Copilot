import { useState } from "react";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import {
  FieldText,
  FieldTextArea,
  FieldSelect,
  FieldSecure,
} from "@snack-uikit/fields";
import { Card } from "@snack-uikit/card";
import { Tabs } from "@snack-uikit/tabs";
import { Typography } from "@snack-uikit/typography";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services";
import { GenerateAutoTestCaseRequest } from "../../types";
import { AutoTestCaseGenerationResult } from "./AutoTestCaseGenerationResult";
import styles from "./AutoTestCaseGeneration.module.scss";

export const AutoTestCaseGeneration = () => {
  const [testType, setTestType] = useState<"UI" | "API">("UI");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // UI Test State
  const [uiRequirements, setUiRequirements] = useState("");
  const [uiTestCases, setUiTestCases] = useState("");
  const [uiFramework, setUiFramework] = useState<
    "pytest" | "playwright" | "selenium"
  >("pytest");
  const [browser, setBrowser] = useState("");

  // API Test State
  const [openApiSpec, setOpenApiSpec] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [apiTestCases, setApiTestCases] = useState("");
  const [endpoints, setEndpoints] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let request: GenerateAutoTestCaseRequest;

      if (testType === "UI") {
        request = {
          test_type: "UI",
          ui_request: {
            test_cases: uiTestCases.split("\n").filter((tc) => tc.trim()),
            requirements: uiRequirements,
            framework: uiFramework,
            browser: browser || undefined,
          },
        };
      } else {
        request = {
          test_type: "API",
          api_request: {
            openapi_spec: openApiSpec,
            base_url: apiBaseUrl,
            auth_token: authToken || undefined,
            test_cases: apiTestCases
              ? apiTestCases.split("\n").filter((tc) => tc.trim())
              : undefined,
            endpoints: endpoints
              ? endpoints.split(",").map((e) => e.trim())
              : undefined,
          },
        };
      }

      const response = await apiClient.generateAutoTestCaseGeneration(request);
      setResult(response);
    } catch (err: any) {
      toast(err?.message || "Failed to generate automated tests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Typography
        family="mono"
        purpose="title"
        size="l"
        className={styles.title}
      >
        Generate Automated Tests
      </Typography>
      <Typography
        family="mono"
        purpose="body"
        size="m"
        className={styles.subtitle}
      >
        Generate e2e UI or API tests from test cases and specifications
      </Typography>

      <Card>
        <Tabs
          defaultValue={testType}
          value={testType}
          onChange={(value: string) => setTestType(value as "UI" | "API")}
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            <Tabs.TabBar>
              <Tabs.Tab value="UI" label="UI E2E Tests" />
              <Tabs.Tab value="API" label="API Tests" />
            </Tabs.TabBar>

            <Tabs.TabContent className={styles.form} value="UI">
              <FieldTextArea
                label="UI Requirements"
                value={uiRequirements}
                onChange={setUiRequirements}
                placeholder="Enter UI requirements..."
                minRows={4}
                required
              />
              <FieldTextArea
                label="Test Cases (one per line)"
                value={uiTestCases}
                onChange={setUiTestCases}
                placeholder="Paste test case code, one per line..."
                minRows={6}
                required
              />
              <div className={styles.formRow}>
                <FieldSelect
                  label="Framework"
                  value={uiFramework}
                  onChange={(value: string) =>
                    setUiFramework(value as typeof uiFramework)
                  }
                  options={[
                    { value: "pytest", option: "Pytest" },
                    { value: "playwright", option: "Playwright" },
                    { value: "selenium", option: "Selenium" },
                  ]}
                />
                <FieldText
                  inputMode="text"
                  label="Browser"
                  onChange={setBrowser}
                  placeholder="e.g., chrome, firefox"
                  value={browser}
                />
              </div>
            </Tabs.TabContent>

            <Tabs.TabContent className={styles.form} value="API">
              <FieldTextArea
                className={styles.formGroup}
                label="OpenAPI Specification (YAML/JSON)"
                minRows={8}
                onChange={setOpenApiSpec}
                placeholder="Paste OpenAPI 3.0 specification..."
                required
                value={openApiSpec}
              />
              <div className={styles.formRow}>
                <FieldText
                  className={styles.formGroup}
                  inputMode="text"
                  label="Base URL"
                  value={apiBaseUrl}
                  onChange={setApiBaseUrl}
                  placeholder="https://api.example.com"
                  required
                />
                <FieldSecure
                  className={styles.formGroup}
                  label="Auth Token"
                  onChange={setAuthToken}
                  placeholder="Bearer token"
                  value={authToken}
                />
              </div>
              <FieldTextArea
                className={styles.formGroup}
                label="Test Cases (optional, one per line)"
                minRows={4}
                onChange={setApiTestCases}
                placeholder="Paste test case code..."
                value={apiTestCases}
              />
              <FieldText
                className={styles.formGroup}
                inputMode="text"
                label="Endpoints (comma-separated, optional)"
                value={endpoints}
                onChange={setEndpoints}
                placeholder="/api/v1/users, /api/v1/posts"
              />
            </Tabs.TabContent>
            <ButtonFilled
              className={styles.actions}
              label={loading ? "Generating..." : "Generate Tests"}
              onClick={handleSubmit}
              disabled={loading}
              type="submit"
            />
          </form>
        </Tabs>
      </Card>

      {loading && (
        <div className={styles.loader}>
          <Spinner size="l" />
        </div>
      )}

      {result && <AutoTestCaseGenerationResult result={result} />}
    </div>
  );
};
