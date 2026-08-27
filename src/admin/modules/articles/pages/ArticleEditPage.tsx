import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { ArticleEditor } from "../components/ArticleEditor";
import type { ArticleFormValues } from "../components/ArticleEditor";
import { useArticles } from "@/admin/context/ArticlesContext";
import { IconDocument } from "@/admin/icons";

export default function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRawArticle, updateArticle, deleteArticle } = useArticles();
  const article = id ? getRawArticle(id) : undefined;
  const [error, setError] = useState<string | null>(null);

  if (!article) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <PageHeader title="تعديل المقالة" />
        <EmptyState
          icon={IconDocument}
          title="لم يتم العثور على المقالة"
          description="ربما تم حذف هذه المقالة أو أن الرابط غير صحيح."
        />
      </div>
    );
  }

  const articleTitle = article.title.ar || article.title.en;

  const handleSave = async (values: ArticleFormValues) => {
    setError(null);
    try {
      await updateArticle(article.id, values);
    } catch (err) {
      console.error("Failed to update article:", err);
      setError("تعذر حفظ التغييرات. يرجى المحاولة مرة أخرى.");
      return;
    }
    navigate("/admin/articles", { state: { flash: `تم حفظ التغييرات على «${values.title.ar || values.title.en}»` } });
  };

  const handleDelete = async () => {
    await deleteArticle(article.id);
    navigate("/admin/articles", { state: { flash: `تم حذف «${articleTitle}»` } });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      )}
      <ArticleEditor
        mode="edit"
        initialArticle={article}
        onSave={handleSave}
        onCancel={() => navigate("/admin/articles")}
        onDelete={handleDelete}
      />
    </div>
  );
}
