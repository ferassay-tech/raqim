import { Link } from "react-router-dom";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import {
  IconMail,
  IconDocument,
  IconImage,
  IconGear,
  IconTag,
  IconArchive,
  IconPencil,
  IconCheck,
} from "@/admin/icons";
import { listChannels } from "../services/channelRegistry";

const SECTIONS = [
  { to: "/admin/communications/templates", label: "القوالب", description: "إدارة قوالب الرسائل عبر جميع القنوات.", icon: IconDocument },
  { to: "/admin/communications/components", label: "المكوّنات المشتركة", description: "عناصر رأس/تذييل/دعوة لاتخاذ إجراء قابلة لإعادة الاستخدام.", icon: IconImage },
  { to: "/admin/communications/variables", label: "المتغيرات", description: "الحقول القابلة للدمج المتاحة داخل القوالب.", icon: IconPencil },
  { to: "/admin/communications/theme", label: "الهوية والتصميم", description: "الألوان والخطوط والتنسيقات المشتركة لجميع القوالب.", icon: IconTag },
  { to: "/admin/communications/template-categories", label: "التصنيفات", description: "تصنيف القوالب لتسهيل تنظيمها.", icon: IconArchive },
  { to: "/admin/communications/history", label: "السجل", description: "الإصدارات المنشورة سابقًا لكل قالب.", icon: IconCheck },
  { to: "/admin/communications/settings", label: "الإعدادات", description: "صلاحيات وإعدادات نظام التواصل.", icon: IconGear },
];

/**
 * Hub for the Communication System — the one sidebar entry ("نظام
 * التواصل") lands here; every other page in this module (Templates, Global
 * Components, Variables, Theme, Categories, History, Settings) is reached
 * from the cards below rather than cluttering the main sidebar, the same
 * way Settings keeps its sections behind one nav entry.
 */
export default function CommunicationDashboardPage() {
  const channels = listChannels();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="نظام التواصل"
        description="البنية التأسيسية لإدارة كل رسائل رقيم عبر جميع القنوات من مكان واحد."
      />

      <section>
        <h2 className="mb-3 text-sm font-medium text-ink-soft">القنوات</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="rounded-md border border-beige bg-white/70 p-4 shadow-(--shadow-soft)"
            >
              <div className="flex items-center justify-between gap-2">
                <IconMail className="h-5 w-5 text-gold-deep" />
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    channel.status === "active"
                      ? "bg-success/10 text-success"
                      : "bg-beige text-ink-faint"
                  }`}
                >
                  {channel.status === "active" ? "فعّالة" : "قادمة"}
                </span>
              </div>
              <p className="mt-3 font-display text-base text-ink">{channel.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-faint">{channel.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-ink-soft">الأقسام</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className="group rounded-md border border-beige bg-white/70 p-5 shadow-(--shadow-soft) transition-colors hover:border-gold/60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-beige/70 text-gold-deep">
                <section.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-base text-ink group-hover:text-gold-deep">
                {section.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-faint">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
