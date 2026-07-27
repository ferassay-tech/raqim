import type { FC } from "react";
import {
  IconGrid,
  IconChartLine,
  IconBook,
  IconTag,
  IconBag,
  IconTicket,
  IconUsers,
  IconDocument,
  IconImage,
  IconMail,
  IconGear,
  IconUser,
  IconPencil,
} from "./icons";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: FC<{ className?: string }>;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "نظرة عامة",
    items: [
      { to: "/admin/dashboard", label: "لوحة التحكم", icon: IconGrid },
      { to: "/admin/analytics", label: "التحليلات", icon: IconChartLine },
    ],
  },
  {
    label: "الكتالوج",
    items: [
      { to: "/admin/books", label: "الكتب", icon: IconBook },
      { to: "/admin/categories", label: "التصنيفات", icon: IconTag },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { to: "/admin/orders", label: "الطلبات", icon: IconBag },
      { to: "/admin/coupons", label: "أكواد الخصم", icon: IconTicket },
      { to: "/admin/customers", label: "العملاء", icon: IconUsers },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { to: "/admin/articles", label: "المقالات", icon: IconDocument },
      { to: "/admin/media", label: "مكتبة الوسائط", icon: IconImage },
      { to: "/admin/content", label: "محتوى الموقع", icon: IconPencil },
    ],
  },
  {
    label: "التواصل",
    items: [{ to: "/admin/messages", label: "الرسائل", icon: IconMail }],
  },
  {
    label: "النظام",
    items: [
      { to: "/admin/settings", label: "الإعدادات", icon: IconGear },
      { to: "/admin/profile", label: "الملف الشخصي", icon: IconUser },
    ],
  },
];

/** Flat lookup used by the topbar quick-actions menu and elsewhere. */
export const ADMIN_NAV_FLAT: AdminNavItem[] = ADMIN_NAV.flatMap((g) => g.items);

/** Static label dictionary for breadcrumb/page-title generation from the URL. */
export const ADMIN_SEGMENT_LABELS: Record<string, string> = {
  admin: "الإدارة",
  dashboard: "لوحة التحكم",
  analytics: "التحليلات",
  books: "الكتب",
  new: "إضافة جديد",
  edit: "تعديل",
  orders: "الطلبات",
  customers: "العملاء",
  categories: "التصنيفات",
  coupons: "أكواد الخصم",
  articles: "المقالات",
  media: "مكتبة الوسائط",
  content: "محتوى الموقع",
  messages: "الرسائل",
  settings: "الإعدادات",
  profile: "الملف الشخصي",
  general: "عام",
  brand: "الهوية البصرية",
  seo: "السيو",
  contact: "التواصل",
  store: "المتجر",
};
