import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { BookForm } from "../components/books/BookForm";
import type { BookFormValues } from "../components/books/BookForm";
import { useBooks } from "../context/BooksContext";
import { IconBook } from "../icons";

export default function BookEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBook, updateBook, deleteBook } = useBooks();
  const book = id ? getBook(id) : undefined;

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

  const handleSave = (values: BookFormValues) => {
    updateBook(book.id, values);
    navigate("/admin/books", { state: { flash: `تم حفظ التغييرات على «${values.title}»` } });
  };

  const handleDelete = () => {
    deleteBook(book.id);
    navigate("/admin/books", { state: { flash: `تم حذف «${book.title}»` } });
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title={`تعديل «${book.title}»`} description="حدّثي بيانات الكتاب أدناه، ثم احفظي التغييرات." />
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
