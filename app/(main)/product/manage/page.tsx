"use client";

import { useState } from "react";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import {
  DEFAULT_SORT,
  parseSort,
  ProductListTable,
} from "@/components/modules/product";
import type { ProductListQuery } from "@/components/modules/product";
import { useGetProductsQuery } from "@/featured/product/productApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function ProductManagePage() {
  const user = useCurrentAccess();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebouncedValue(search);

  // Any change to what is being listed sends the table back to page 1 — a
  // narrowed result set can have fewer pages than the one currently in view.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleScopeFilterChange = (value: string) => {
    setScopeFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: ProductListQuery = {
    page,
    limit,
    ...parseSort(sort),
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(scopeFilter !== "all" ? { filters: `isGlobal=${scopeFilter}` } : {}),
  };

  const { data, isLoading, isFetching, refetch } =
    useGetProductsQuery(listQuery);

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_LIST]}>
      <ProductListTable
        products={data?.products ?? []}
        total={data?.meta?.total ?? 0}
        loading={isLoading || isFetching}
        title="Manage Products"
        search={search}
        onSearchChange={handleSearchChange}
        scopeFilter={scopeFilter}
        onScopeFilterChange={handleScopeFilterChange}
        sort={sort}
        onSortChange={handleSortChange}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={handleLimitChange}
        onRefresh={refetch}
      />
    </PermissionGuard>
  );
}
