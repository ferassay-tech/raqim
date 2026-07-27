import { Link, useNavigate, useParams } from "react-router-dom";
import { Reveal } from "../../components/motion-primitives";
import { useOrders } from "../context/OrdersContext";
import { ORDER_STATUS_META } from "../lib/orderStatus";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { OrderItemsCard } from "../components/orders/OrderItemsCard";
import { OrderCustomerCard } from "../components/orders/OrderCustomerCard";
import { OrderPaymentCard } from "../components/orders/OrderPaymentCard";
import { OrderTimelineCard } from "../components/orders/OrderTimelineCard";
import { OrderDownloadsCard } from "../components/orders/OrderDownloadsCard";
import { IconBag, IconChevronStart } from "../icons";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, setOrderStatus, addNote } = useOrders();
  const order = id ? getOrder(id) : undefined;

  if (!order) {
    return (
      <div className="flex flex-col gap-6 py-2">
        <EmptyState
          icon={IconBag}
          title="لم يتم العثور على الطلب"
          description="ربما تم حذف هذا الطلب أو أن الرابط غير صحيح."
          action={
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              العودة إلى الطلبات
            </button>
          }
        />
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status];

  return (
    <div className="flex flex-col gap-6 py-2">
      <Reveal>
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/orders"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <IconChevronStart className="h-3.5 w-3.5 rotate-180" />
            الطلبات
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-ink" dir="ltr">
              #{order.id}
            </h1>
            <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
          </div>
          <p className="text-sm text-ink-soft">تم إنشاء الطلب في {order.createdAt}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal delay={0.05}>
            <OrderItemsCard order={order} />
          </Reveal>
          <Reveal delay={0.08}>
            <OrderDownloadsCard order={order} />
          </Reveal>
          <Reveal delay={0.1}>
            <OrderTimelineCard order={order} onAddNote={(text) => addNote(order.id, text)} />
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.05}>
            <OrderCustomerCard order={order} />
          </Reveal>
          <Reveal delay={0.1}>
            <OrderPaymentCard order={order} onStatusChange={(status) => setOrderStatus(order.id, status)} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
