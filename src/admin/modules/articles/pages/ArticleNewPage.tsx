import { useNavigate } from "react-router-dom";
import { ArticleEditor } from "../components/ArticleEditor";
import type { ArticleFormValues } from "../components/ArticleEditor";
import { useArticles } from "@/admin/context/ArticlesContext";

export default function ArticleNewPage() {
  const navigate = useNavigate();
  const { createArticle } = useArticles();

  const handleSave = (values: ArticleFormValues) => {
    createArticle(values);
    navigate("/admin/articles", { state: { flash: `تم حفظ «${values.title.ar || values.title.en}» بنجاح` } });
  };

  return <ArticleEditor mode="create" onSave={handleSave} onCancel={() => navigate("/admin/articles")} />;
}
