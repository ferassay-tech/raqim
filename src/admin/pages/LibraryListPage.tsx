import { useMemo, useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import { useBooks } from "../context/BooksContext";
import type { LibraryFile } from "../types/library";
import { formatBytes } from "../lib/formatBytes";
import { PageHeader } from "../components/PageHeader";
import { SearchInput } from "../components/SearchInput";
import { DataTable } from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { LibraryUploadDropzone } from "../components/library/LibraryUploadDropzone";
import { LibraryFileDrawer } from "../components/library/LibraryFileDrawer";
import { IconArchive } from "../icons";

export default function LibraryListPage() {
  const { files, uploadFile } = useLibrary();
  const { books } = useBooks();

  const [search, setSearch] = useState("");
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const bookTitle = (bookId: string | null) => (bookId ? books.find((b) => b.id === bookId)?.title ?? "—" : "غير مرتبط");

  const filtered = useMemo(
    () => files.filter((f) => !search.trim() || f.filename.includes(search)),
    [files, search]
  );

  const activeFile = activeFileId ? files.find((f) => f.id === activeFileId) ?? null : null;

  const handleUpload = async (selected: File[]) => {
    setUploadError(null);
    for (const file of selected) {
      try {
        await uploadFile(file, null, null);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "تعذّر رفع الملف.");
      }
    }
  };

  const columns: DataTableColumn<LibraryFile>[] = [
    {
      key: "filename",
      header: "الملف",
      className: "min-w-[220px]",
      render: (f) => (
        <div>
          <p className="text-ink">{f.filename}</p>
          {f.version && <p className="text-xs text-gold-deep" dir="ltr">{f.version}</p>}
        </div>
      ),
    },
    {
      key: "format",
      header: "الصيغة",
      render: (f) => <span className="uppercase text-ink-soft">{f.format}</span>,
    },
    {
      key: "size",
      header: "الحجم",
      align: "end",
      render: (f) => <span className="text-ink-soft">{formatBytes(f.size)}</span>,
    },
    {
      key: "bookId",
      header: "الكتاب المرتبط",
      render: (f) => <span className="text-ink-soft">{bookTitle(f.bookId)}</span>,
    },
    {
      key: "uploadedAt",
      header: "تاريخ الرفع",
      render: (f) => <span className="text-ink-soft">{f.uploadedAt}</span>,
    },
    {
      key: "updatedAt",
      header: "آخر تحديث",
      render: (f) => <span className="text-ink-soft">{f.updatedAt}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="المكتبة الرقمية"
        description={`${files.length.toLocaleString("en-US")} ملفًا قابلًا للتحميل — PDF, EPUB, MOBI, ZIP`}
      />

      <LibraryUploadDropzone onFilesSelected={handleUpload} />
      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}

      <SearchInput value={search} onChange={setSearch} placeholder="ابحثي عن ملف" className="w-full sm:w-72" />

      {files.length === 0 ? (
        <EmptyState
          icon={IconArchive}
          title="لا توجد ملفات مرفوعة بعد"
          description="ابدئي برفع أول ملف عبر المربع أعلاه — PDF, EPUB, MOBI أو ZIP."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.id}
          onRowClick={(f) => setActiveFileId(f.id)}
        />
      )}

      <LibraryFileDrawer file={activeFile} onClose={() => setActiveFileId(null)} />
    </div>
  );
}
