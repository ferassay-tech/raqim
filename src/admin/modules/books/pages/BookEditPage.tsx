import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { BookForm } from "../components/BookForm";
import type { BookFormValues } from "../components/BookForm";
import { useBooks } from "@/admin/context/BooksContext";
import { IconBook } from "@/admin/icons";

export default function BookEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRawBook, updateBook, deleteBook } = useBooks();
  const book = id ? getRawBook(id) : undefined;
  const [error, setError] = useState<string | null>(null);

  if (!book) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <PageHeader title="تعديل الكتاب" />
        <EmptyState
          icon={IconBook}
          title="لم يتم العثور على الكتاب"
          description="ربما تم حذف هذا الكتاب أو أن الرابط غير صحيح."
        />
      </div>
    );
  }

  const bookTitle = book.title.ar || book.title.en;

  const handleSave = async (values: BookFormValues) => {
    setError(null);
    try {
      await updateBook(book.id, values);
    } catch (err) {
      console.error("Failed to update book:", err);
      setError("تعذر حفظ التغييرات. يرجى المحاولة مرة أخرى.");
      return;
    }
    navigate("/admin/books", { state: { flash: `تم حفظ التغييرات على «${values.title.ar || values.title.en}»` } });
  };

  const handleDelete = async () => {
    await deleteBook(book.id);
    navigate("/admin/books", { state: { flash: `تم حذف «${bookTitle}»` } });
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title={`تعديل «${bookTitle}»`} description="حدّثي بيانات الكتاب أدناه، ثم احفظي التغييرات." />
      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      )}
      <BookForm
        mode="edit"
        initialBook={book}
        onSave={handleSave}
        onCancel={() => navigate("/admin/books")}
        onDelete={handleDelete}
      />
    </div>
  );
}
