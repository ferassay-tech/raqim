import { Link, useNavigate, useParams } from "react-router-dom";
import { Reveal } from "@/components/motion-primitives";
import { useOrders } from "@/admin/context/OrdersContext";
import { useBooks } from "@/admin/context/BooksContext";
import { deriveCustomer } from "@/admin/lib/deriveCustomers";
import { CUSTOMER_SEGMENT_META } from "@/admin/types/customer";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { StatCard } from "@/admin/components/ui/StatCard";
import { CustomerAvatar } from "@/admin/components/ui/CustomerAvatar";
import { CustomerContactCard } from "../components/CustomerContactCard";
import { CustomerOrderHistoryCard } from "../components/CustomerOrderHistoryCard";
import { CustomerActivityTimelineCard } from "../components/CustomerActivityTimelineCard";
import { CustomerNotesCard } from "../components/CustomerNotesCard";
import { IconBag, IconChevronStart, IconTag, IconUsers, IconWallet } from "@/admin/icons";

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { books } = useBooks();
  const customer = id ? deriveCustomer(orders, books, id) : undefined;

  if (!customer) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <EmptyState
          icon={IconUsers}
          title="لم يتم العثور على العميلة"
          description="ربما تغير رابط الملف أو لا توجد طلبات مرتبطة بهذه العميلة بعد."
          action={
            <button
              type="button"
              onClick={() => navigate("/admin/customers")}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              العودة إلى العملاء
            </button>
          }
        />
      </div>
    );
  }

  const meta = CUSTOMER_SEGMENT_META[customer.segment];

  return (
    <div className="flex flex-col gap-6 py-2">
      <Reveal>
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/customers"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <IconChevronStart className="h-3.5 w-3.5 rotate-180" />
            العملاء
          </Link>
          <div className="flex items-center gap-4">
            <CustomerAvatar name={customer.name} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl text-ink">{customer.name}</h1>
                <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
              </div>
              <p className="mt-1 text-sm text-ink-soft" dir="ltr">
                {customer.email}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={IconBag} label="عدد الطلبات" value={customer.orderCount.toLocaleString("en-US")} />
          <StatCard icon={IconWallet} label="إجمالي الإنفاق" value={`$${customer.totalSpent.toFixed(2)}`} />
          <StatCard
            icon={IconWallet}
            label="متوسط قيمة الطلب"
            value={customer.averageOrderValue ? `$${customer.averageOrderValue.toFixed(2)}` : "—"}
          />
          <StatCard icon={IconTag} label="الفئة المفضلة" value={customer.favoriteCategory ?? "—"} />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal delay={0.1}>
            <CustomerOrderHistoryCard customer={customer} />
          </Reveal>
          <Reveal delay={0.15}>
            <CustomerActivityTimelineCard customer={customer} />
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.1}>
            <CustomerContactCard customer={customer} />
          </Reveal>
          <Reveal delay={0.15}>
            <CustomerNotesCard customerId={customer.id} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
