import { useState } from "react";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldText, FieldTextArea, FieldSelect } from "@snack-uikit/fields";
import { Typography } from "@snack-uikit/typography";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services";
import { GenerateManualTestCaseRequest, Priority } from "../../types";
import { ManualTestCaseGenerationResult } from "./ManualTestCaseGenerationResult";
import styles from "./ManualTestCaseGeneration.module.scss";

export const ManualTestCaseGeneration = () => {
  const [formData, setFormData] = useState<GenerateManualTestCaseRequest>({
    requirements: "",
    test_type: "UI",
    feature: "",
    story: "",
    owner: "",
    priority: Priority.NORMAL,
    jira_link: "",
    jira_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await apiClient.generateTestCase(formData);
      setResult(response);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate test case");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof GenerateManualTestCaseRequest,
    value: string | Priority,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <Typography
        family="mono"
        purpose="title"
        size="l"
        className={styles.title}
      >
        Generate Manual Test Case
      </Typography>
      <Typography
        family="mono"
        purpose="body"
        size="m"
        className={styles.subtitle}
      >
        Generate Allure TestOps as Code test cases from requirements
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <FieldSelect
              className={styles.formGroup}
              label="Test Type"
              value={formData.test_type}
              onChange={(value) =>
                handleChange("test_type", value as "UI" | "API")
              }
              options={[
                { value: "UI", option: "UI" },
                { value: "API", option: "API" },
              ]}
              required
            />
            <FieldSelect
              className={styles.formGroup}
              label="Priority"
              value={formData.priority}
              onChange={(value) => handleChange("priority", value as Priority)}
              options={[
                { value: Priority.CRITICAL, option: "Critical" },
                { value: Priority.NORMAL, option: "Normal" },
                { value: Priority.LOW, option: "Low" },
              ]}
              required
            />
          </div>

          <FieldTextArea
            className={styles.formGroup}
            label="Requirements"
            minRows={6}
            onChange={(value: string) => handleChange("requirements", value)}
            placeholder="Enter requirements description..."
            required
            value={formData.requirements}
          />

          <div className={styles.formRow}>
            <FieldText
              className={styles.formGroup}
              label="Feature"
              inputMode="text"
              onChange={(value: string) => handleChange("feature", value)}
              placeholder="e.g., User Authentication"
              required
              value={formData.feature}
            />
            <FieldText
              className={styles.formGroup}
              label="Story"
              inputMode="text"
              onChange={(value: string) => handleChange("story", value)}
              placeholder="e.g., User login"
              required
              value={formData.story}
            />
          </div>

          <div className={styles.formRow}>
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label="Owner"
              onChange={(value: string) => handleChange("owner", value)}
              placeholder="QA Engineer name"
              required
              value={formData.owner}
            />
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label="JIRA Link"
              value={formData.jira_link || ""}
              onChange={(value: string) => handleChange("jira_link", value)}
              placeholder="https://jira.example.com/issue-123"
            />
          </div>

          <FieldText
            className={styles.formGroup}
            inputMode="text"
            label="JIRA Name"
            value={formData.jira_name || ""}
            onChange={(value: string) => handleChange("jira_name", value)}
            placeholder="Issue-123"
          />

          <ButtonFilled
            className={styles.actions}
            label={loading ? "Generating..." : "Generate Test Case"}
            onClick={handleSubmit}
            disabled={loading}
            type="submit"
          />
        </form>
      </Card>

      {loading && (
        <div className={styles.loader}>
          <Spinner size="l" />
        </div>
      )}

      {result && <ManualTestCaseGenerationResult result={result} />}
    </div>
  );
};
