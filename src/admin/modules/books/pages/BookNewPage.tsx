import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { BookForm } from "../components/BookForm";
import type { BookFormValues } from "../components/BookForm";
import { useBooks } from "@/admin/context/BooksContext";

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
