import { useNavigate } from "react-router-dom";
import { ArticleEditor } from "../components/articles/ArticleEditor";
import type { ArticleFormValues } from "../components/articles/ArticleEditor";
import { useArticles } from "../context/ArticlesContext";

export default function ArticleNewPage() {
  const navigate = useNavigate();
  const { createArticle } = useArticles();

  const handleSave = (values: ArticleFormValues) => {
    createArticle(values);
    navigate("/admin/articles", { state: { flash: `تم حفظ «${values.title}» بنجاح` } });
  };

  return <ArticleEditor mode="create" onSave={handleSave} onCancel={() => navigate("/admin/articles")} />;
}
