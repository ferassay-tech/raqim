import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { BookForm } from "../components/BookForm";
import type { BookFormValues } from "../components/BookForm";
import type { PendingBookFiles } from "../components/BookFilesPanel";
import { useBooks } from "@/admin/context/BooksContext";
import { useLibrary } from "@/admin/context/LibraryContext";

export default function BookNewPage() {
  const navigate = useNavigate();
  const { createBook } = useBooks();
  const { uploadFile, attachToBook } = useLibrary();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (values: BookFormValues, pendingFiles: PendingBookFiles) => {
    setError(null);
    let newId: string;
    try {
      newId = await createBook(values);
    } catch (err) {
      console.error("Failed to create book:", err);
      setError("تعذر إضافة الكتاب. يرجى المحاولة مرة أخرى.");
      return;
    }

    // The book already exists at this point — a staged file failing below
    // must never roll it back, and a file that does succeed must never be
    // undone because a different one later fails (best-effort, matches the
    // existing checkout attachment-upload precedent).
    const failedFilenames: string[] = [];
    for (const staged of pendingFiles.uploads) {
      try {
        await uploadFile(staged.file, newId, staged.version);
      } catch (err) {
        console.error("Failed to upload staged book file:", staged.file.name, err);
        failedFilenames.push(staged.file.name);
      }
    }
    // Linking an already-existing file is a single-column update on a
    // record that's already known to exist — attachToBook already covers
    // this exact write in edit mode (fire-and-forget there too).
    for (const fileId of pendingFiles.linkIds) {
      attachToBook(fileId, newId);
    }

    const title = values.title.ar || values.title.en;
    const flash =
      failedFilenames.length > 0
        ? `تم إضافة «${title}» بنجاح، لكن تعذر رفع: ${failedFilenames.join("، ")}. يمكنك إعادة رفعها من صفحة تعديل الكتاب دون الحاجة لإعادة إنشائه.`
        : `تم إضافة «${title}» بنجاح`;
    navigate("/admin/books", { state: { flash } });
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
