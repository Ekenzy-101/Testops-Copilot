import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Framework,
  GenerateAutoTestCaseSchema,
  GenerateAutoTestCaseRequest,
  TestType,
  unwrapMarkdownCodeFence,
  wrapInMarkdownCodeFence,
} from "../../utils";
import styles from "./AutoTestCaseGeneration.module.scss";

export const AutoTestCaseGeneration = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<GenerateAutoTestCaseRequest>({
    resolver: valibotResolver(GenerateAutoTestCaseSchema),
    defaultValues: {
      test_type: TestType.API,
      api_request: {
        auth_token: "",
        base_url: "",
        endpoints: [],
        openapi_spec: "",
        test_cases: [],
      },
      ui_request: {
        browser: "",
        framework: Framework.Pytest,
        requirements: "",
        test_cases: [],
      },
    },
  });
  const [result, setResult] = useState<any>(null);
  const { t } = useTranslation();

  const onSubmit = async (request: GenerateAutoTestCaseRequest) => {
    setResult(null);
    try {
      if (request.api_request) {
        request.api_request.openapi_spec = unwrapMarkdownCodeFence(
          request.api_request.openapi_spec,
        );
      }
      const response = await apiClient.generateAutoTestCases(request);
      setResult(response);
      toast.success(t("auto_test_case_generation.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("auto_test_case_generation.result.error"));
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
          defaultValue={watch("test_type")}
          value={watch("test_type")}
          onChange={(value) => setValue("test_type", value)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Tabs.TabBar>
              <Tabs.Tab value={TestType.UI} label="UI E2E Tests" />
              <Tabs.Tab value={TestType.API} label="API Tests" />
            </Tabs.TabBar>
            <Tabs.TabContent className={styles.form} value={TestType.UI}>
              <FieldTextArea
                label={t("auto_test_case_generation.ui.requirements.label")}
                placeholder={t(
                  "auto_test_case_generation.ui.requirements.placeholder",
                )}
                error={errors.ui_request?.requirements?.message}
                value={watch("ui_request.requirements")}
                onChange={(value) => setValue("ui_request.requirements", value)}
                minRows={4}
                required
              />
              <FieldTextArea
                label={t("auto_test_case_generation.ui.test_cases.label")}
                placeholder={t(
                  "auto_test_case_generation.ui.test_cases.placeholder",
                )}
                error={errors.ui_request?.test_cases?.message}
                value={watch("ui_request.test_cases")?.join("\n")}
                onChange={(value) =>
                  setValue("ui_request.test_cases", value.split("\n"))
                }
                minRows={6}
                required
              />
              <div className={styles.formRow}>
                <FieldSelect
                  label={t("auto_test_case_generation.ui.framework.label")}
                  error={errors.ui_request?.framework?.message}
                  value={watch("ui_request.framework")}
                  onChange={(value) => setValue("ui_request.framework", value)}
                  options={[
                    { value: Framework.Pytest, option: "Pytest" },
                    { value: Framework.Playwright, option: "Playwright" },
                    { value: Framework.Selenium, option: "Selenium" },
                  ]}
                  required
                />
                <FieldText
                  inputMode="text"
                  label={t("auto_test_case_generation.ui.browser.label")}
                  placeholder={t(
                    "auto_test_case_generation.ui.browser.placeholder",
                  )}
                  error={errors.ui_request?.browser?.message}
                  value={watch("ui_request.browser")}
                  onChange={(value) => setValue("ui_request.browser", value)}
                  required
                />
              </div>
            </Tabs.TabContent>

            <Tabs.TabContent className={styles.form} value={TestType.API}>
              <MarkdownEditor
                className={styles.code}
                defaultMode="edit"
                label={t("auto_test_case_generation.api.spec.label")}
                placeholder={t(
                  "auto_test_case_generation.api.spec.placeholder",
                )}
                error={errors.api_request?.openapi_spec?.message}
                value={watch("api_request.openapi_spec")!}
                onChange={(value) =>
                  setValue(
                    "api_request.openapi_spec",
                    wrapInMarkdownCodeFence(value),
                  )
                }
                resizable
                required
              />
              <div className={styles.formRow}>
                <FieldText
                  className={styles.formGroup}
                  inputMode="text"
                  label={t("auto_test_case_generation.api.base_url.label")}
                  placeholder={t(
                    "auto_test_case_generation.api.base_url.placeholder",
                  )}
                  error={errors.api_request?.base_url?.message}
                  value={watch("api_request.base_url")}
                  onChange={(value) => setValue("api_request.base_url", value)}
                  required
                />
                <FieldSecure
                  className={styles.formGroup}
                  label={t("auto_test_case_generation.api.auth_token.label")}
                  placeholder={t(
                    "auto_test_case_generation.api.auth_token.placeholder",
                  )}
                  error={errors.api_request?.auth_token?.message}
                  value={watch("api_request.auth_token")}
                  onChange={(value) =>
                    setValue("api_request.auth_token", value)
                  }
                />
              </div>
              <FieldTextArea
                className={styles.formGroup}
                label={t("auto_test_case_generation.api.test_cases.label")}
                placeholder={t(
                  "auto_test_case_generation.api.test_cases.placeholder",
                )}
                minRows={4}
                error={errors.api_request?.test_cases?.message}
                value={watch("api_request.test_cases")?.join("\n")}
                onChange={(value) =>
                  setValue("api_request.test_cases", value.split("\n"))
                }
              />
              <FieldText
                className={styles.formGroup}
                inputMode="text"
                label={t("auto_test_case_generation.api.endpoints.label")}
                placeholder={t(
                  "auto_test_case_generation.api.endpoints.placeholder",
                )}
                error={errors.api_request?.endpoints?.message}
                value={watch("api_request.endpoints")?.join(",")}
                onChange={(value) =>
                  setValue("api_request.endpoints", value.split(","))
                }
              />
            </Tabs.TabContent>
            <ButtonFilled
              className={styles.actions}
              label={
                isSubmitting
                  ? t("auto_test_case_generation.btn.label_loading")
                  : t("auto_test_case_generation.btn.label")
              }
              disabled={isSubmitting}
              type="submit"
            />
          </form>
        </Tabs>
      </Card>

      {isSubmitting && (
        <div className={styles.loader}>
          <Spinner size="l" />
        </div>
      )}

      {result && <AutoTestCaseGenerationResult result={result} />}
    </div>
  );
};
