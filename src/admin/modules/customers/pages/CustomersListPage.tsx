import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/admin/context/OrdersContext";
import { isActiveOrder } from "@/admin/types/order";
import { useBooks } from "@/admin/context/BooksContext";
import { deriveCustomers } from "@/admin/lib/deriveCustomers";
import { formatCurrencyGroups } from "@/admin/lib/formatCurrencyGroups";
import type { AdminCustomer } from "@/admin/types/customer";
import { CUSTOMER_SEGMENT_META } from "@/admin/types/customer";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { SearchInput } from "@/admin/components/ui/SearchInput";
import { FilterBar, FilterSelect } from "@/admin/components/ui/FilterBar";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { Pagination } from "@/admin/components/ui/Pagination";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { CustomerAvatar } from "@/admin/components/ui/CustomerAvatar";
import { IconUsers } from "@/admin/icons";

const PAGE_SIZE = 8;

// "totalSpent" is deliberately not sortable — it's now a per-currency
// breakdown (RAQIM has no FX conversion, see the A1 remediation plan), and
// there is no single well-defined ordering across customers who spent in
// different currencies without inventing a base-currency conversion.
type SortKey = "name" | "orderCount" | "lastOrderDate";

const SORT_ACCESSORS: Record<SortKey, (c: AdminCustomer) => string | number> = {
  name: (c) => c.name,
  orderCount: (c) => c.orderCount,
  lastOrderDate: (c) => c.lastOrderDate,
};

export default function CustomersListPage() {
  const { orders } = useOrders();
  const { books } = useBooks();
  const navigate = useNavigate();

  // Trashed orders must not count toward a customer's order count/total
  // spent — Trash is a business-state view, not part of active data.
  const activeOrders = useMemo(() => orders.filter(isActiveOrder), [orders]);
  const customers = useMemo(() => deriveCustomers(activeOrders, books), [activeOrders, books]);

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("orderCount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesSegment = segmentFilter === "all" || c.segment === segmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [customers, search, segmentFilter]);

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ar");
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, segmentFilter]);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as SortKey);
      setSortDirection("desc");
    }
  };

  const columns: DataTableColumn<AdminCustomer>[] = [
    {
      key: "name",
      header: "العميلة",
      sortAccessor: SORT_ACCESSORS.name,
      className: "min-w-[240px]",
      render: (c) => (
        <div className="flex items-center gap-3">
          <CustomerAvatar name={c.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-ink">{c.name}</p>
            <p className="truncate text-xs text-ink-faint" dir="ltr">
              {c.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "orderCount",
      header: "الطلبات",
      sortAccessor: SORT_ACCESSORS.orderCount,
      align: "end",
      render: (c) => <span className="text-ink-soft">{c.orderCount.toLocaleString("en-US")}</span>,
    },
    {
      key: "totalSpent",
      header: "إجمالي الإنفاق",
      align: "end",
      render: (c) => <span className="text-ink">{formatCurrencyGroups(c.totalSpent)}</span>,
    },
    {
      key: "lastOrderDate",
      header: "آخر طلب",
      sortAccessor: SORT_ACCESSORS.lastOrderDate,
      render: (c) => <span className="text-ink-soft">{c.lastOrderDate}</span>,
    },
    {
      key: "segment",
      header: "الحالة",
      render: (c) => {
        const meta = CUSTOMER_SEGMENT_META[c.segment];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
  ];

  const isEmptyCatalog = customers.length === 0;
  const isEmptyResults = !isEmptyCatalog && sorted.length === 0;

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="العملاء"
        description={`${customers.length.toLocaleString("en-US")} عميلة`}
      />

      {!isEmptyCatalog && (
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ابحثي بالاسم أو البريد الإلكتروني"
            className="w-full sm:w-72"
          />
          <FilterSelect
            ariaLabel="الحالة"
            value={segmentFilter}
            onChange={setSegmentFilter}
            options={[
              { value: "all", label: "كل العميلات" },
              { value: "returning", label: "عميلات دائمات" },
              { value: "new", label: "عميلات جديدات" },
            ]}
          />
        </FilterBar>
      )}

      {isEmptyCatalog ? (
        <EmptyState icon={IconUsers} title="لا توجد عميلات بعد" description="ستظهر عميلاتك هنا فور ورود أول طلب." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={pageRows}
            rowKey={(c) => c.id}
            onRowClick={(c) => navigate(`/admin/customers/${c.id}`)}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyState={
              isEmptyResults ? (
                <EmptyState icon={IconUsers} title="لا توجد نتائج" description="جربي تعديل كلمات البحث أو الفلتر المستخدم." />
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
