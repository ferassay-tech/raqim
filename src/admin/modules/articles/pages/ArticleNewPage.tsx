import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArticleEditor } from "../components/ArticleEditor";
import type { ArticleFormValues } from "../components/ArticleEditor";
import { useArticles } from "@/admin/context/ArticlesContext";

export default function ArticleNewPage() {
  const navigate = useNavigate();
  const { createArticle } = useArticles();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (values: ArticleFormValues) => {
    setError(null);
    try {
      await createArticle(values);
    } catch (err) {
      console.error("Failed to create article:", err);
      setError("تعذر حفظ المقالة. يرجى المحاولة مرة أخرى.");
      return;
    }
    navigate("/admin/articles", { state: { flash: `تم حفظ «${values.title.ar || values.title.en}» بنجاح` } });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      )}
      <ArticleEditor mode="create" onSave={handleSave} onCancel={() => navigate("/admin/articles")} />
    </div>
  );
}
