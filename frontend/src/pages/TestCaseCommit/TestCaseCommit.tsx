import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { FieldText, FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services";
import { CommitTestCaseRequest, CommitTestCaseResponse } from "../../types";
import styles from "./TestCaseCommit.module.scss";

export const TestCaseCommit = () => {
  const [form, setForm] = useState<CommitTestCaseRequest>({
    project_id: "",
    branch: "",
    file_path: "",
    content: "",
    commit_message: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommitTestCaseResponse | null>(null);
  const { t } = useTranslation();

  const handleChange = (field: keyof CommitTestCaseRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await apiClient.commitTestCases(form);
      setResult(res);
      toast.success(t("test_case_commit.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_case_commit.result.error"));
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
        {t("test_case_commit.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("test_case_commit.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <FieldText
              inputMode="text"
              label={t("test_case_commit.branch.label")}
              value={form.branch}
              onChange={(v) => handleChange("branch", v)}
              placeholder={t("test_case_commit.branch.placeholder")}
              required
            />
            <FieldText
              inputMode="text"
              label={t("test_case_commit.project_id.label")}
              value={form.project_id}
              onChange={(v) => handleChange("project_id", v)}
              placeholder={t("test_case_commit.project_id.placeholder")}
              required
            />
          </div>
          <FieldText
            inputMode="text"
            label={t("test_case_commit.file_path.label")}
            value={form.file_path}
            onChange={(v) => handleChange("file_path", v)}
            placeholder={t("test_case_commit.file_path.placeholder")}
            required
          />
          <FieldTextArea
            label={t("test_case_commit.commit_message.label")}
            value={form.commit_message}
            onChange={(v) => handleChange("commit_message", v)}
            placeholder={t("test_case_commit.commit_message.placeholder")}
            minRows={2}
            required
          />
          <FieldTextArea
            label={t("test_case_commit.content.label")}
            placeholder={t("test_case_commit.content.placeholder")}
            value={form.content}
            onChange={(v) => handleChange("content", v)}
            minRows={10}
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={
              loading
                ? t("test_case_commit.btn.label_loading")
                : t("test_case_commit.btn.label")
            }
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

      {result && (
        <div className={styles.result}>
          <Typography family="mono" purpose="title" size="m">
            {t("test_case_commit.result.title")}
          </Typography>
          <Typography family="mono" purpose="body" size="s">
            {t("test_case_commit.result.status")} {result.status}
          </Typography>
          <Typography family="mono" purpose="body" size="s">
            {t("test_case_commit.result.file_path")} {result.file_path} (
            {result.branch})
          </Typography>
          {result.commit_id && (
            <Typography family="mono" purpose="body" size="s">
              {t("test_case_commit.result.commit_id")} {result.commit_id}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};
