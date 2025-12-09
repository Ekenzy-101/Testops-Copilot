import { useState } from "react";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { FieldText, FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services/api";
import { GitLabCommitRequest, GitLabCommitResponse } from "../../types/api";
import styles from "./GitLabCommit.module.scss";

export const GitLabCommit = () => {
  const [form, setForm] = useState<GitLabCommitRequest>({
    project_id: "",
    branch: "main",
    file_path: "tests/generated/test_cases.py",
    content: "",
    commit_message: "Add generated test cases",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GitLabCommitResponse | null>(null);

  const handleChange = (field: keyof GitLabCommitRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await apiClient.commitTestCases(form);
      setResult(res);
      toast.success("Committed to GitLab");
    } catch (err: any) {
      toast.error(err?.message || "Failed to commit to Gitlab");
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
        Commit Generated Tests to GitLab
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        Push generated test artifacts to your repository.
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <FieldText
              inputMode="text"
              label="Branch"
              value={form.branch}
              onChange={(v) => handleChange("branch", v)}
              placeholder="main"
              required
            />
            <FieldText
              inputMode="text"
              label="Project ID / Path"
              value={form.project_id}
              onChange={(v) => handleChange("project_id", v)}
              placeholder="group/project"
              required
            />
          </div>
          <FieldText
            inputMode="text"
            label="File Path"
            value={form.file_path}
            onChange={(v) => handleChange("file_path", v)}
            placeholder="tests/generated/test_cases.py"
            required
          />
          <FieldTextArea
            label="Commit Message"
            value={form.commit_message}
            onChange={(v) => handleChange("commit_message", v)}
            minRows={2}
            required
          />
          <FieldTextArea
            label="Content"
            value={form.content}
            onChange={(v) => handleChange("content", v)}
            placeholder="# paste generated tests"
            minRows={10}
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={loading ? "Committing..." : "Commit to GitLab"}
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
            Commit Result
          </Typography>
          <Typography family="mono" purpose="body" size="s">
            Status: {result.status}
          </Typography>
          <Typography family="mono" purpose="body" size="s">
            File: {result.file_path} ({result.branch})
          </Typography>
          {result.commit_id && (
            <Typography family="mono" purpose="body" size="s">
              Commit: {result.commit_id}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};
