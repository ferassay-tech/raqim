import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { GoldDivider } from "../components/ornaments";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { useDownloads } from "../admin/context/DownloadsContext";
import { useLibrary } from "../admin/context/LibraryContext";
import { getStorageAdapter } from "../admin/services/storage";
import type { LibraryFile } from "../admin/types/library";
import { useLanguage } from "../context/LanguageContext";

export default function DownloadPage() {
  const { token: tokenId } = useParams<{ token: string }>();
  const { resolveToken, recordDownload } = useDownloads();
  const { getFile } = useLibrary();
  const { t } = useLanguage();
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [failedFileId, setFailedFileId] = useState<string | null>(null);

  const token = tokenId ? resolveToken(tokenId) : null;
  const files = token
    ? token.fileIds.map((id) => getFile(id)).filter((f): f is LibraryFile => Boolean(f))
    : [];

  const handleDownload = async (file: LibraryFile) => {
    if (!token) return;
    setFailedFileId(null);
    setPendingFileId(file.id);
    try {
      const adapter = getStorageAdapter(file.storageProvider);
      const url = await adapter.getDownloadUrl(file.storageKey);
      // Confirm the resolved URL is actually reachable before handing the
      // customer anything — a stale local object URL (revoked after its
      // upload session ended) or an unconfigured real provider must never
      // trigger a broken browser download with no explanation.
      const response = await fetch(url);
      if (!response.ok) throw new Error("download-unavailable");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
      recordDownload(token.id);
    } catch {
      setFailedFileId(file.id);
    } finally {
      setPendingFileId(null);
    }
  };

  return (
    <PageShell>
      <Helmet
        title={t("download.seo.title")}
        description={t("download.seo.description")}
        path={`/download/${tokenId ?? ""}`}
        noindex
      />
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center lg:px-10">
        {!token || files.length === 0 ? (
          <Reveal className="max-w-md">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("download.invalidLabel")}</p>
            <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">{t("download.invalidTitle")}</h1>
            <p className="mt-4 text-balance leading-loose text-ink-soft">
              {t("download.invalidBody")}
            </p>
          </Reveal>
        ) : (
          <Reveal className="max-w-md">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("download.readyLabel")}</p>
            <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">{t("download.readyTitle")}</h1>
            <div className="mt-6 flex justify-center">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-4">
              {files.map((file) => {
                const isPending = pendingFileId === file.id;
                const hasFailed = failedFileId === file.id;
                return (
                  <div key={file.id} className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      disabled={isPending}
                      className="group relative inline-flex items-center gap-3 rounded-[10px] bg-gold px-8 py-4 text-base font-medium text-ink shadow-[0_10px_30px_-12px_rgba(185,148,81,0.55)] transition-all duration-200 ease-out hover:bg-gold-deep active:translate-y-[2px] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      <span>
                        {isPending
                          ? t("download.preparing")
                          : `${t("download.downloadPrefix")}${file.filename}${file.version ? ` (${file.version})` : ""}`}
                      </span>
                      {!isPending && (
                        <span aria-hidden className="transition-transform duration-300 ltr:group-hover:translate-x-[4px] rtl:group-hover:translate-x-[-4px]">
                          <span className="rtl:hidden">→</span>
                          <span className="ltr:hidden">←</span>
                        </span>
                      )}
                    </button>
                    {hasFailed && (
                      <p className="max-w-xs text-balance text-xs text-danger">
                        {t("download.failedBody")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-xs text-ink-soft">
              {t("download.privateNotice")}
            </p>
          </Reveal>
        )}
      </section>
    </PageShell>
  );
}
