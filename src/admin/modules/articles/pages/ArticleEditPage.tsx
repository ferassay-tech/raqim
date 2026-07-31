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
  const { getArticle, updateArticle, deleteArticle } = useArticles();
  const article = id ? getArticle(id) : undefined;

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

  const handleSave = (values: ArticleFormValues) => {
    updateArticle(article.id, values);
    navigate("/admin/articles", { state: { flash: `تم حفظ التغييرات على «${values.title}»` } });
  };

  const handleDelete = () => {
    deleteArticle(article.id);
    navigate("/admin/articles", { state: { flash: `تم حذف «${article.title}»` } });
  };

  return (
    <ArticleEditor
      mode="edit"
      initialArticle={article}
      onSave={handleSave}
      onCancel={() => navigate("/admin/articles")}
      onDelete={handleDelete}
    />
  );
}
