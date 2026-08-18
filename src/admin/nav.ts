import type { FC } from "react";
import type { AdminRole } from "./types/auth";
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
  IconBroadcast,
  IconGear,
  IconUser,
  IconPencil,
  IconArchive,
  IconPalette,
} from "./icons";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: FC<{ className?: string }>;
  /** Phase 2C: when set, the item is hidden unless the current user's role
   * is in this list. Undefined means visible to any authenticated admin —
   * unchanged for every existing item. */
  allowedRoles?: AdminRole[];
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
    label: "المكتبة الرقمية",
    items: [{ to: "/admin/library", label: "الملفات القابلة للتحميل", icon: IconArchive }],
  },
  {
    label: "التواصل",
    items: [
      { to: "/admin/messages", label: "الرسائل", icon: IconMail },
      { to: "/admin/communications", label: "نظام التواصل", icon: IconBroadcast },
    ],
  },
  {
    label: "النظام",
    items: [
      { to: "/admin/settings", label: "الإعدادات", icon: IconGear },
      { to: "/admin/brand-studio", label: "استوديو الهوية", icon: IconPalette },
      {
        to: "/admin/users",
        label: "المستخدمون الإداريون",
        icon: IconUsers,
        allowedRoles: ["owner", "super_admin"],
      },
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
  library: "المكتبة الرقمية",
  messages: "الرسائل",
  communications: "نظام التواصل",
  templates: "القوالب",
  components: "المكوّنات المشتركة",
  variables: "المتغيرات",
  theme: "الهوية والتصميم",
  "template-categories": "التصنيفات",
  history: "السجل",
  settings: "الإعدادات",
  "brand-studio": "استوديو الهوية",
  users: "المستخدمون الإداريون",
  profile: "الملف الشخصي",
  general: "عام",
  brand: "الهوية البصرية",
  seo: "السيو",
  contact: "التواصل",
  store: "المتجر",
  storage: "التخزين",
};
