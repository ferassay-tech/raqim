import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { BookForm } from "../components/books/BookForm";
import type { BookFormValues } from "../components/books/BookForm";
import { useBooks } from "../context/BooksContext";

export default function BookNewPage() {
  const navigate = useNavigate();
  const { createBook } = useBooks();

  const handleSave = (values: BookFormValues) => {
    createBook(values);
    navigate("/admin/books", { state: { flash: `تم إضافة «${values.title}» بنجاح` } });
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="إضافة كتاب جديد" description="أضيفي بيانات الكتاب كاملة قبل نشره في المتجر." />
      <BookForm mode="create" onSave={handleSave} onCancel={() => navigate("/admin/books")} />
    </div>
  );
}
