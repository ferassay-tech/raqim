import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/admin/context/OrdersContext";
import type { AdminOrder, OrderStatus } from "@/admin/types/order";
import { ORDER_TOTAL } from "@/admin/types/order";
import { ORDER_STATUS_META, ORDER_STATUS_OPTIONS } from "@/admin/lib/orderStatus";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { SearchInput } from "@/admin/components/ui/SearchInput";
import { FilterBar, FilterSelect } from "@/admin/components/ui/FilterBar";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { Pagination } from "@/admin/components/ui/Pagination";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { BulkActionBar } from "@/admin/components/ui/BulkActionBar";
import { IconArchive, IconBag, IconCheck } from "@/admin/icons";
import { useHasPermission } from "@/admin/lib/useHasPermission";
import { LoadErrorBanner } from "@/admin/components/ui/LoadErrorBanner";
import { PaymentMethodBadge } from "../components/PaymentMethodBadge";
import { paymentMethodList } from "@/config/paymentMethods";
import type { PaymentMethodId } from "@/config/paymentMethods";

const PAGE_SIZE = 8;

type SortKey = "id" | "customerName" | "total" | "status" | "createdAt";

const SORT_ACCESSORS: Record<SortKey, (o: AdminOrder) => string | number> = {
  id: (o) => o.id,
  customerName: (o) => o.customerName,
  total: (o) => ORDER_TOTAL(o),
  status: (o) => o.status,
  createdAt: (o) => o.createdAt,
};

export default function OrdersListPage() {
  const { orders, setOrdersStatus, loadError, reload } = useOrders();
  const navigate = useNavigate();
  const hasPermission = useHasPermission();
  // Order status changes are gated on orders.manage; orders.view (already
  // required to reach this route) is enough to see every read-only column.
  const canManage = hasPermission("orders.manage");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<"all" | PaymentMethodId>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== "all" || paymentMethodFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      // paymentMethodId is the canonical identity (never the display
      // label) — a legacy order (paymentMethodId === null) only ever
      // matches "all", never a specific method, matching the existing
      // resolveOrderPaymentMethodLabel() fallback's own spirit of never
      // pretending a null id is something it isn't.
      const matchesPaymentMethod = paymentMethodFilter === "all" || o.paymentMethodId === paymentMethodFilter;
      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });
  }, [orders, search, statusFilter, paymentMethodFilter]);

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      let cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ar");
      // createdAt is a date-only string (no time component) — same-day
      // orders would otherwise tie and sort non-deterministically; id
      // embeds the real creation timestamp (ORD-<base36 Date.now()>), so
      // it's a stable, order-preserving secondary key.
      if (cmp === 0 && sortKey === "createdAt") {
        cmp = a.id.localeCompare(b.id);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, paymentMethodFilter]);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as SortKey);
      setSortDirection("asc");
    }
  };

  const columns: DataTableColumn<AdminOrder>[] = [
    {
      key: "id",
      header: "الطلب",
      sortAccessor: SORT_ACCESSORS.id,
      className: "min-w-[120px]",
      render: (o) => (
        <div>
          <p className="text-ink" dir="ltr">
            #{o.id}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">{o.createdAt}</p>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "العميلة",
      sortAccessor: SORT_ACCESSORS.customerName,
      className: "min-w-[220px]",
      render: (o) => (
        <div className="min-w-0">
          <p className="truncate text-ink">{o.customerName}</p>
          <p className="truncate text-xs text-ink-faint" dir="ltr">
            {o.customerEmail}
          </p>
        </div>
      ),
    },
    {
      key: "items",
      header: "العناصر",
      render: (o) => (
        <span className="text-ink-soft">
          {o.items[0].title}
          {o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "طريقة الدفع",
      render: (o) => <PaymentMethodBadge order={o} />,
    },
    {
      key: "total",
      header: "الإجمالي",
      sortAccessor: SORT_ACCESSORS.total,
      align: "end",
      render: (o) => <span className="text-ink">${ORDER_TOTAL(o).toFixed(2)}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      sortAccessor: SORT_ACCESSORS.status,
      render: (o) => {
        const meta = ORDER_STATUS_META[o.status];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
  ];

  const isEmptyCatalog = orders.length === 0;
  const isEmptyResults = !isEmptyCatalog && sorted.length === 0;

  const bulkStatus = (status: OrderStatus) => {
    setOrdersStatus([...selectedKeys], status);
    setSelectedKeys(new Set());
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="الطلبات"
        description={`${orders.length.toLocaleString("en-US")} طلبًا إجماليًا`}
      />

      {loadError && <LoadErrorBanner message={loadError} onRetry={reload} />}

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="ابحثي برقم الطلب، اسم العميلة، أو بريدها"
          className="w-full sm:w-72"
        />
        <FilterSelect
          ariaLabel="الترتيب"
          value={sortKey === "createdAt" && sortDirection === "asc" ? "oldest" : "newest"}
          onChange={(value) => {
            setSortKey("createdAt");
            setSortDirection(value === "oldest" ? "asc" : "desc");
          }}
          options={[
            { value: "newest", label: "الأحدث أولاً" },
            { value: "oldest", label: "الأقدم أولاً" },
          ]}
        />
        <FilterSelect
          ariaLabel="طريقة الدفع"
          value={paymentMethodFilter}
          onChange={(value) => setPaymentMethodFilter(value as "all" | PaymentMethodId)}
          options={[
            { value: "all", label: "كل طرق الدفع" },
            ...paymentMethodList.map((method) => ({ value: method.id, label: method.title })),
          ]}
        />
        <FilterSelect
          ariaLabel="الحالة"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: "all", label: "كل الحالات" }, ...ORDER_STATUS_OPTIONS]}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-beige px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-gold hover:text-ink"
          >
            مسح الفلاتر
          </button>
        )}
      </FilterBar>

      {hasActiveFilters && !isEmptyCatalog && (
        <p className="text-xs text-ink-faint">
          عرض {sorted.length.toLocaleString("en-US")} من {orders.length.toLocaleString("en-US")} طلبًا
        </p>
      )}

      <BulkActionBar
        count={selectedKeys.size}
        onClear={() => setSelectedKeys(new Set())}
        actions={
          canManage
            ? [
                { key: "paid", label: "تحديد كمدفوع", icon: IconCheck, onClick: () => bulkStatus("paid") },
                { key: "refunded", label: "تحديد كمسترجع", icon: IconArchive, onClick: () => bulkStatus("refunded") },
                { key: "cancelled", label: "إلغاء الطلبات", tone: "danger", onClick: () => bulkStatus("cancelled") },
              ]
            : []
        }
      />

      {isEmptyCatalog ? (
        <EmptyState icon={IconBag} title="لا توجد طلبات بعد" description="ستظهر طلبات العميلات هنا فور ورودها." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={pageRows}
            rowKey={(o) => o.id}
            selectable
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyState={
              isEmptyResults ? (
                <EmptyState
                  icon={IconBag}
                  title="لا توجد نتائج"
                  description="لا توجد طلبات مطابقة للبحث أو الفلاتر الحالية."
                  action={
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-2 rounded-full border border-beige px-5 py-2.5 text-sm text-ink-soft transition-colors hover:border-gold hover:text-ink"
                    >
                      مسح الفلاتر
                    </button>
                  }
                />
              ) : undefined
            }
          />
          <Pagination
            page={clampedPage}
            pageCount={pageCount}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
