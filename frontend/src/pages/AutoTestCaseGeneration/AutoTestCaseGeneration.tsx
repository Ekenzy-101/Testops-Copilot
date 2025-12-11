import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import {
  FieldText,
  FieldTextArea,
  FieldSelect,
  FieldSecure,
} from "@snack-uikit/fields";
import { Card } from "@snack-uikit/card";
import { Spinner } from "@snack-uikit/loaders";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Tabs } from "@snack-uikit/tabs";
import { Typography } from "@snack-uikit/typography";
import { AutoTestCaseGenerationResult } from "./AutoTestCaseGenerationResult";
import { apiClient } from "../../services";
import { GenerateAutoTestCaseRequest } from "../../types";
import {
  copyToClipboard,
  extractContentInMarkdown,
  wrapContentInMarkdown,
} from "../../utils";
import styles from "./AutoTestCaseGeneration.module.scss";

export const AutoTestCaseGeneration = () => {
  const [testType, setTestType] = useState<"UI" | "API">("UI");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t, i18n } = useTranslation();

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
            openapi_spec: extractContentInMarkdown(openApiSpec),
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

      const response = await apiClient.generateAutoTestCase(request);
      setResult(response);
      toast.success(t("auto_test_case_generation.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("auto_test_case_generation.result.error"));
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
        {t("auto_test_case_generation.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("auto_test_case_generation.subtitle")}
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
                label={t("auto_test_case_generation.ui.requirements.label")}
                placeholder={t(
                  "auto_test_case_generation.ui.requirements.placeholder",
                )}
                value={uiRequirements}
                onChange={setUiRequirements}
                minRows={4}
                required
              />
              <FieldTextArea
                label={t("auto_test_case_generation.ui.test_cases.label")}
                placeholder={t(
                  "auto_test_case_generation.ui.test_cases.placeholder",
                )}
                value={uiTestCases}
                onChange={setUiTestCases}
                minRows={6}
                required
              />
              <div className={styles.formRow}>
                <FieldSelect
                  label={t("auto_test_case_generation.ui.framework.label")}
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
                  label={t("auto_test_case_generation.ui.browser.label")}
                  placeholder={t(
                    "auto_test_case_generation.ui.browser.placeholder",
                  )}
                  onChange={setBrowser}
                  value={browser}
                />
              </div>
            </Tabs.TabContent>

            <Tabs.TabContent className={styles.form} value="API">
              <MarkdownEditor
                className={styles.code}
                defaultMode="edit"
                label={t("auto_test_case_generation.api.spec.label")}
                placeholder={t(
                  "auto_test_case_generation.api.spec.placeholder",
                )}
                onChange={(value: string) =>
                  setOpenApiSpec(wrapContentInMarkdown(value))
                }
                onCodeCopyClick={() =>
                  copyToClipboard(
                    extractContentInMarkdown(openApiSpec),
                    i18n.language,
                  )
                }
                resizable
                required
                value={openApiSpec}
              />
              <div className={styles.formRow}>
                <FieldText
                  className={styles.formGroup}
                  inputMode="text"
                  label={t("auto_test_case_generation.api.base_url.label")}
                  placeholder={t(
                    "auto_test_case_generation.api.base_url.placeholder",
                  )}
                  value={apiBaseUrl}
                  onChange={setApiBaseUrl}
                  required
                />
                <FieldSecure
                  className={styles.formGroup}
                  label={t("auto_test_case_generation.api.auth_token.label")}
                  placeholder={t(
                    "auto_test_case_generation.api.auth_token.placeholder",
                  )}
                  onChange={setAuthToken}
                  value={authToken}
                />
              </div>
              <FieldTextArea
                className={styles.formGroup}
                label={t("auto_test_case_generation.api.test_cases.label")}
                placeholder={t(
                  "auto_test_case_generation.api.test_cases.placeholder",
                )}
                minRows={4}
                onChange={setApiTestCases}
                value={apiTestCases}
              />
              <FieldText
                className={styles.formGroup}
                inputMode="text"
                label={t("auto_test_case_generation.api.endpoints.label")}
                placeholder={t(
                  "auto_test_case_generation.api.endpoints.placeholder",
                )}
                value={endpoints}
                onChange={setEndpoints}
              />
            </Tabs.TabContent>
            <ButtonFilled
              className={styles.actions}
              label={
                loading
                  ? t("auto_test_case_generation.btn.label_loading")
                  : t("auto_test_case_generation.btn.label")
              }
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
