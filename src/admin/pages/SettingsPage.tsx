import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "../components/PageHeader";
import { Tabs } from "../components/Tabs";
import { GeneralSection } from "../components/settings/GeneralSection";
import { BrandSection } from "../components/settings/BrandSection";
import { SeoSection } from "../components/settings/SeoSection";
import { HomePageSection } from "../components/settings/HomePageSection";
import { ContactSection } from "../components/settings/ContactSection";
import { StoreSection } from "../components/settings/StoreSection";
import { StorageSection } from "../components/settings/StorageSection";
import { IconCheck } from "../icons";

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
  const [flash, setFlash] = useState<string | null>(null);

  const handleSaved = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="الإعدادات" description="إدارة الإعدادات العامة للموقع والمتجر." />

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            <IconCheck className="h-4 w-4 shrink-0" />
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs tabs={TABS} active={activeSection} onChange={(key) => navigate(`/admin/settings/${key}`, { replace: true })} />

      <div className="w-full">
        {activeSection === "general" && <GeneralSection onSaved={handleSaved} />}
        {activeSection === "brand" && <BrandSection onSaved={handleSaved} />}
        {activeSection === "seo" && <SeoSection onSaved={handleSaved} />}
        {activeSection === "homepage" && <HomePageSection onSaved={handleSaved} />}
        {activeSection === "contact" && <ContactSection onSaved={handleSaved} />}
        {activeSection === "store" && <StoreSection onSaved={handleSaved} />}
        {activeSection === "storage" && <StorageSection onSaved={handleSaved} />}
      </div>
    </div>
  );
}
