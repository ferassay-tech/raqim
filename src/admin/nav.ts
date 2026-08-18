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
  /** Route-enforcement phase: when set, the item is hidden unless the
   * current user's *effective* permission (role_permissions +
   * user_permission_overrides, via hasEffectivePermission) is granted.
   * Supplemental only — the real gate is each route's own RequirePermission
   * wrapper; hiding a nav item never substitutes for that. Undefined means
   * no permission requirement (e.g. /admin/profile, and /admin/users which
   * uses allowedRoles instead). */
  requiredPermission?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "نظرة عامة",
    items: [
      { to: "/admin/dashboard", label: "لوحة التحكم", icon: IconGrid, requiredPermission: "dashboard.view" },
      { to: "/admin/analytics", label: "التحليلات", icon: IconChartLine, requiredPermission: "analytics.view" },
    ],
  },
  {
    label: "الكتالوج",
    items: [
      { to: "/admin/books", label: "الكتب", icon: IconBook, requiredPermission: "books.view" },
      { to: "/admin/categories", label: "التصنيفات", icon: IconTag, requiredPermission: "categories.manage" },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { to: "/admin/orders", label: "الطلبات", icon: IconBag, requiredPermission: "orders.view" },
      { to: "/admin/coupons", label: "أكواد الخصم", icon: IconTicket, requiredPermission: "coupons.manage" },
      { to: "/admin/customers", label: "العملاء", icon: IconUsers, requiredPermission: "customers.view" },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { to: "/admin/articles", label: "المقالات", icon: IconDocument, requiredPermission: "articles.view" },
      { to: "/admin/media", label: "مكتبة الوسائط", icon: IconImage, requiredPermission: "media.manage" },
      { to: "/admin/content", label: "محتوى الموقع", icon: IconPencil, requiredPermission: "content.manage" },
    ],
  },
  {
    label: "المكتبة الرقمية",
    items: [
      {
        to: "/admin/library",
        label: "الملفات القابلة للتحميل",
        icon: IconArchive,
        requiredPermission: "library.manage",
      },
    ],
  },
  {
    label: "التواصل",
    items: [
      { to: "/admin/messages", label: "الرسائل", icon: IconMail, requiredPermission: "messages.view" },
      {
        to: "/admin/communications",
        label: "نظام التواصل",
        icon: IconBroadcast,
        requiredPermission: "communications.manage",
      },
    ],
  },
  {
    label: "النظام",
    items: [
      { to: "/admin/settings", label: "الإعدادات", icon: IconGear, requiredPermission: "settings.manage" },
      {
        to: "/admin/brand-studio",
        label: "استوديو الهوية",
        icon: IconPalette,
        requiredPermission: "settings.manage",
      },
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
