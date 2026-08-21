import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { BookForm } from "../components/BookForm";
import type { BookFormValues } from "../components/BookForm";
import { useBooks } from "@/admin/context/BooksContext";

export default function BookNewPage() {
  const navigate = useNavigate();
  const { createBook } = useBooks();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (values: BookFormValues) => {
    setError(null);
    try {
      await createBook(values);
    } catch (err) {
      console.error("Failed to create book:", err);
      setError("تعذر إضافة الكتاب. يرجى المحاولة مرة أخرى.");
      return;
    }
    navigate("/admin/books", { state: { flash: `تم إضافة «${values.title.ar || values.title.en}» بنجاح` } });
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="إضافة كتاب جديد" description="أضيفي بيانات الكتاب كاملة قبل نشره في المتجر." />
      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      )}
      <BookForm mode="create" onSave={handleSave} onCancel={() => navigate("/admin/books")} />
    </div>
  );
}
