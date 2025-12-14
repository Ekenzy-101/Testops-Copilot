import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldText, FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import {
  CommitTestCaseRequest,
  CommitTestCaseResponse,
  CommitTestCaseSchema,
  unwrapMarkdownCodeFence,
  wrapInMarkdownCodeFence,
} from "../../utils";
import styles from "./TestCaseCommit.module.scss";

export const TestCaseCommit = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<CommitTestCaseRequest>({
    resolver: valibotResolver(CommitTestCaseSchema),
    defaultValues: {
      project_id: "",
      branch: "",
      file_path: "",
      content: "",
      commit_message: "",
    },
  });
  const [result, setResult] = useState<CommitTestCaseResponse | null>(null);
  const { t } = useTranslation();

  const onSubmit = async (request: CommitTestCaseRequest) => {
    setResult(null);
    try {
      request.content = unwrapMarkdownCodeFence(request.content);
      const response = await apiClient.commitTestCases(request);
      setResult(response);
      toast.success(t("test_case_commit.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_case_commit.result.error"));
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
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formRow}>
            <FieldText
              inputMode="text"
              label={t("test_case_commit.branch.label")}
              error={errors.branch?.message}
              value={watch("branch")}
              onChange={(value) => setValue("branch", value)}
              placeholder={t("test_case_commit.branch.placeholder")}
              required
            />
            <FieldText
              inputMode="text"
              label={t("test_case_commit.project_id.label")}
              error={errors.project_id?.message}
              value={watch("project_id")}
              onChange={(value) => setValue("project_id", value)}
              placeholder={t("test_case_commit.project_id.placeholder")}
              required
            />
          </div>
          <FieldText
            inputMode="text"
            label={t("test_case_commit.file_path.label")}
            error={errors.file_path?.message}
            value={watch("file_path")}
            onChange={(value) => setValue("file_path", value)}
            placeholder={t("test_case_commit.file_path.placeholder")}
            required
          />
          <FieldTextArea
            label={t("test_case_commit.commit_message.label")}
            error={errors.commit_message?.message}
            value={watch("commit_message")}
            onChange={(value) => setValue("commit_message", value)}
            placeholder={t("test_case_commit.commit_message.placeholder")}
            minRows={2}
            required
          />
          <MarkdownEditor
            label={t("test_case_commit.content.label")}
            placeholder={t("test_case_commit.content.placeholder")}
            error={errors.content?.message}
            value={watch("content")}
            onChange={(value) =>
              setValue("content", wrapInMarkdownCodeFence(value))
            }
            resizable
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={
              isSubmitting
                ? t("test_case_commit.btn.label_loading")
                : t("test_case_commit.btn.label")
            }
            disabled={isSubmitting}
            type="submit"
          />
        </form>
      </Card>

      {isSubmitting && (
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
