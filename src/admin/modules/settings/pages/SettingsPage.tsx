import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { Tabs } from "@/admin/components/ui/Tabs";
import { GeneralSection } from "../components/GeneralSection";
import { BrandSection } from "../components/BrandSection";
import { SeoSection } from "../components/SeoSection";
import { HomePageSection } from "../components/HomePageSection";
import { ContactSection } from "../components/ContactSection";
import { StoreSection } from "../components/StoreSection";
import { StorageSection } from "../components/StorageSection";
import { IconAlertTriangle, IconCheck } from "@/admin/icons";
import { LoadErrorBanner } from "@/admin/components/ui/LoadErrorBanner";
import { useSettings } from "@/admin/context/SettingsContext";

const TABS = [
  { key: "general", label: "عام" },
  { key: "brand", label: "الهوية البصرية" },
  { key: "seo", label: "السيو" },
  { key: "homepage", label: "الصفحة الرئيسية" },
  { key: "contact", label: "التواصل" },
  { key: "store", label: "المتجر" },
  { key: "storage", label: "التخزين" },
];

const VALID_SECTIONS = new Set(TABS.map((t) => t.key));

export default function SettingsPage() {
  const { section = "general" } = useParams<{ section: string }>();
  const activeSection = VALID_SECTIONS.has(section) ? section : "general";
  const navigate = useNavigate();
  const [flash, setFlash] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const { loadError, reload } = useSettings();

  const handleSaved = (message: string) => {
    setFlash({ message, variant: "success" });
    setTimeout(() => setFlash(null), 3000);
  };

  // Writes are owner-only at the database level (an existing, unchanged
  // policy) — an editor's save must surface here, not disappear silently.
  const handleError = (message: string) => {
    setFlash({ message, variant: "error" });
    setTimeout(() => setFlash(null), 5000);
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="الإعدادات" description="إدارة الإعدادات العامة للموقع والمتجر." />

      {loadError && <LoadErrorBanner message={loadError} onRetry={reload} />}

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={
              flash.variant === "success"
                ? "flex items-center gap-2.5 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
                : "flex items-center gap-2.5 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            }
          >
            {flash.variant === "success" ? (
              <IconCheck className="h-4 w-4 shrink-0" />
            ) : (
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
            )}
            {flash.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs tabs={TABS} active={activeSection} onChange={(key) => navigate(`/admin/settings/${key}`, { replace: true })} />

      <div className="w-full">
        {activeSection === "general" && <GeneralSection onSaved={handleSaved} onError={handleError} />}
        {activeSection === "brand" && <BrandSection onSaved={handleSaved} onError={handleError} />}
        {activeSection === "seo" && <SeoSection onSaved={handleSaved} onError={handleError} />}
        {activeSection === "homepage" && <HomePageSection onSaved={handleSaved} onError={handleError} />}
        {activeSection === "contact" && <ContactSection onSaved={handleSaved} onError={handleError} />}
        {activeSection === "store" && <StoreSection onSaved={handleSaved} onError={handleError} />}
        {activeSection === "storage" && <StorageSection onSaved={handleSaved} onError={handleError} />}
      </div>
    </div>
  );
}
