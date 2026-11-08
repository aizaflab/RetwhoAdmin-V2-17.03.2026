"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useCollectCommissionMutation,
  useGetWholesalerCommissionQuery,
  useRequestCommissionMutation,
} from "@/featured/commission/commissionApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  Field,
  FieldLabel,
  Input,
  SimpleSelect,
  Table,
  Textarea,
  type Column,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge/Badge";
import { Button } from "@/components/ui/button/Button";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import {
  COLLECTED_VIA,
  COLLECTION_STATUS,
  collectionHow,
  FEE_STATUS,
  fmtDate,
  fmtMoney,
  MANUAL_METHODS,
  monthLabel,
  monthOptions,
  rateText,
} from "../_data/commission";
import type {
  CollectionKind,
  CommissionFeeRow,
  ManualMethod,
} from "../_types/commission.types";

const KINDS: { value: CollectionKind; label: string; hint: string }[] = [
  {
    value: "charge",
    label: "Charge a saved method",
    hint: "The wholesaler's saved card, or verified bank account (3–5 business days).",
  },
  {
    value: "manual",
    label: "Record a payment",
    hint: "Paid some other way — a bank transfer, a check.",
  },
  {
    value: "waive",
    label: "Waive",
    hint: "Let the wholesaler off. Nothing is charged.",
  },
];

/**
 * One wholesaler's commission: the month and what is owed overall, every
 * order's fee, and what has been asked for and collected. The admin asks for
 * what is owed, then collects it — charging a saved method, recording a
 * payment, or waiving it — for the month or for everything owed.
 */
export default function WholesalerCommissionView({
  shopId,
  initialMonth,
  backHref,
}: {
  shopId: string;
  initialMonth: string;
  backHref: string;
}) {
  const [month, setMonth] = useState(initialMonth || "all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isLoading } = useGetWholesalerCommissionQuery(
    { shopId, page, limit, ...(month !== "all" ? { month } : {}) },
    { refetchOnMountOrArgChange: true },
  );
  const [requestCommission, { isLoading: requesting }] =
    useRequestCommissionMutation();
  const [collectCommission, { isLoading: collecting }] =
    useCollectCommissionMutation();

  const [dialog, setDialog] = useState<"request" | "collect" | null>(null);
  // What the ask or the collection covers: this month, or everything owed.
  const [scope, setScope] = useState<"period" | "all">("period");
  const [kind, setKind] = useState<CollectionKind>("charge");
  const [methodId, setMethodId] = useState("");
  const [manualMethod, setManualMethod] =
    useState<ManualMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const period = month !== "all" ? month : undefined;
  const summary = data?.summary;
  const overall = data?.overall;
  const methods = data?.paymentMethods ?? [];
  const chosenMethod =
    methods.find((m) => m._id === methodId) ??
    methods.find((m) => m.isDefault) ??
    methods[0];
  // Owed now — "due" counts fees being collected too; those cannot be taken again.
  const owedPeriod = Math.max(
    0,
    (summary?.due ?? 0) - (summary?.inProgress ?? 0),
  );
  const owedAll = Math.max(
    0,
    (overall?.outstanding ?? 0) - (overall?.inProgress ?? 0),
  );
  const usePeriod = scope === "period" && !!period;
  const amount = usePeriod ? owedPeriod : owedAll;
  const openRequest = data?.requests.find((r) => r.status === "open");

  const open = (which: "request" | "collect") => {
    setScope(period && owedPeriod > 0 ? "period" : "all");
    setNote("");
    setReference("");
    setDialog(which);
  };

  const submitRequest = async () => {
    try {
      await requestCommission({
        shopId,
        ...(usePeriod ? { period } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      }).unwrap();
      toast.success(
        `Asked ${data?.wholesaler.companyName} for ${fmtMoney(amount)}.`,
      );
      setDialog(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send the request."));
    }
  };

  const submitCollect = async () => {
    try {
      const result = await collectCommission({
        shopId,
        kind,
        ...(usePeriod ? { period } : {}),
        ...(kind === "charge" && chosenMethod
          ? { paymentMethodId: chosenMethod._id }
          : {}),
        ...(kind === "manual"
          ? {
              manualMethod,
              ...(reference.trim() ? { reference: reference.trim() } : {}),
            }
          : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      }).unwrap();
      toast.success(
        result?.status === "processing"
          ? `Bank debit of ${fmtMoney(result.amount)} started — it settles in 3–5 business days.`
          : kind === "waive"
            ? `${fmtMoney(result?.amount)} waived.`
            : `${fmtMoney(result?.amount)} collected.`,
      );
      setDialog(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not collect the commission."),
      );
    }
  };

  const columns: Column<CommissionFeeRow>[] = [
    {
      id: "createdAt",
      header: "Date",
      cell: (_v, row) => (
        <span className="text-sm text-muted-foreground">
          {fmtDate(row.createdAt)}
        </span>
      ),
    },
    {
      id: "orderNumber",
      header: "Order",
      cell: (_v, row) => (
        <div>
          <p className="text-sm font-medium tabular-nums">{row.orderNumber}</p>
          <p className="text-xs text-muted-foreground">
            {row.retailerShopId?.companyName ?? "—"}
          </p>
        </div>
      ),
    },
    {
      id: "basisAmount",
      header: "Subtotal × rate",
      cell: (_v, row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {fmtMoney(row.basisAmount)} × {rateText(row.rate)}
        </span>
      ),
    },
    {
      id: "feeAmount",
      header: "Commission",
      cell: (_v, row) => (
        <span className="text-sm font-semibold tabular-nums">
          {fmtMoney(row.feeAmount)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_v, row) => (
        <div>
          <Badge
            variant={FEE_STATUS[row.status]?.variant}
            appearance="soft"
            size="sm"
          >
            {FEE_STATUS[row.status]?.label ?? row.status}
          </Badge>
          {row.collectedVia && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {COLLECTED_VIA[row.collectedVia]}
            </p>
          )}
        </div>
      ),
    },
  ];

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  const cards = [
    {
      label: `Commission · ${monthLabel(period)}`,
      value: summary?.commission,
      hint: `${summary?.orders ?? 0} orders`,
    },
    {
      label: "Taken from online payments",
      value: summary?.collectedOnline,
      hint: `+ ${fmtMoney(summary?.processingFees)} card / ACH fees`,
    },
    {
      label: "Collected by Retwho",
      value: summary?.collectedByRetwho,
      hint: `${fmtMoney(summary?.waived)} waived`,
    },
    {
      label: "Owed overall",
      value: overall?.outstanding,
      hint: overall?.inProgress
        ? `${fmtMoney(overall.inProgress)} being collected`
        : `${fmtMoney(owedPeriod)} from ${monthLabel(period).toLowerCase()}`,
      tone: (overall?.outstanding ?? 0) > 0 ? "text-warning" : "text-success",
    },
  ];

  const scopeOptions = [
    ...(period
      ? [
          {
            value: "period",
            label: `${monthLabel(period)} — ${fmtMoney(owedPeriod)}`,
          },
        ]
      : []),
    { value: "all", label: `Everything owed — ${fmtMoney(owedAll)}` },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
            aria-label="Back to statements"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-medium sm:text-2xl">
              {data.wholesaler.companyName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {[data.wholesaler.email, data.wholesaler.phoneNumber]
                .filter(Boolean)
                .join(" · ") || "Wholesaler"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-44">
            <SimpleSelect
              options={monthOptions()}
              value={month}
              onChange={(value) => {
                setMonth(value);
                setPage(1);
              }}
              className="h-10 rounded-md bg-card"
            />
          </div>
          <Button
            variant="outline"
            disabled={owedAll <= 0}
            onClick={() => open("request")}
          >
            Request payment
          </Button>
          <Button disabled={owedAll <= 0} onClick={() => open("collect")}>
            Collect
          </Button>
        </div>
      </div>

      {openRequest && (
        <p className="mb-4 rounded-lg border border-info/30 bg-info/10 px-4 py-3 text-sm">
          Asked for {fmtMoney(openRequest.amount)} (
          {monthLabel(openRequest.period)}) on {fmtDate(openRequest.createdAt)}
          {openRequest.requestedBy?.name
            ? ` by ${openRequest.requestedBy.name}`
            : ""}
          {openRequest.note ? ` — “${openRequest.note}”` : ""}. It closes once
          those fees are collected or waived.
        </p>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p
              className={`text-lg font-semibold tabular-nums ${card.tone ?? ""}`}
            >
              {fmtMoney(card.value)}
            </p>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-border bg-card p-3 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold">Order commission</h2>
        <Table<CommissionFeeRow>
          data={data.fees.data}
          columns={columns}
          pagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalData={data.fees.meta.total}
          bordered
          emptyMessage="No commission in this period"
          headerColor="bg-muted/50"
          tableClassName="min-w-full"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
            Collections
          </h2>
          {data.collections.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Nothing collected yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.collections.map((c) => (
                <li
                  key={c._id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{collectionHow(c)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(c.completedAt ?? c.createdAt)} ·{" "}
                      {monthLabel(c.period)}
                      {c.createdBy?.name ? ` · ${c.createdBy.name}` : ""}
                      {c.failureReason ? ` · ${c.failureReason}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {fmtMoney(c.amount)}
                    </p>
                    <Badge
                      variant={COLLECTION_STATUS[c.status].variant}
                      appearance="soft"
                      size="sm"
                    >
                      {COLLECTION_STATUS[c.status].label}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
            Payment requests
          </h2>
          {data.requests.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No payment asked for yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.requests.map((r) => (
                <li
                  key={r._id}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {monthLabel(r.period)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(r.createdAt)}
                      {r.requestedBy?.name ? ` · ${r.requestedBy.name}` : ""}
                      {r.note ? ` · “${r.note}”` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {fmtMoney(r.amount)}
                    </p>
                    <Badge
                      variant={
                        r.status === "open"
                          ? "info"
                          : r.status === "settled"
                            ? "success"
                            : "secondary"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {r.status === "open"
                        ? "Open"
                        : r.status === "settled"
                          ? "Paid"
                          : "Replaced"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Ask for it */}
      <Dialog
        open={dialog === "request"}
        onClose={requesting ? undefined : () => setDialog(null)}
        size="small"
        title="Request payment"
        description={`${data.wholesaler.companyName} sees the request on its Retwho Commission page. It closes once the fees are collected or waived.`}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDialog(null)}
              disabled={requesting}
            >
              Back
            </Button>
            <Button
              onClick={submitRequest}
              loading={requesting}
              disabled={amount <= 0}
            >
              Request {fmtMoney(amount)}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field>
            <FieldLabel>For</FieldLabel>
            <SimpleSelect
              options={scopeOptions}
              value={usePeriod ? "period" : "all"}
              onChange={(value) => setScope(value as "period" | "all")}
              className="h-10 rounded-md bg-card"
            />
          </Field>
          <Field>
            <FieldLabel>Note (optional)</FieldLabel>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. October commission — due by the 10th"
              className="bg-transparent"
            />
          </Field>
        </div>
      </Dialog>

      {/* Collect it */}
      <Dialog
        open={dialog === "collect"}
        onClose={collecting ? undefined : () => setDialog(null)}
        size="medium"
        title="Collect commission"
        description={`From ${data.wholesaler.companyName}. Only fees still owed are covered — anything already being collected is left alone.`}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDialog(null)}
              disabled={collecting}
            >
              Back
            </Button>
            <Button
              onClick={submitCollect}
              loading={collecting}
              disabled={amount <= 0 || (kind === "charge" && !chosenMethod)}
              variant={kind === "waive" ? "destructive" : "default"}
            >
              {kind === "waive"
                ? "Waive"
                : kind === "charge"
                  ? "Charge"
                  : "Record"}{" "}
              {fmtMoney(amount)}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field>
            <FieldLabel>For</FieldLabel>
            <SimpleSelect
              options={scopeOptions}
              value={usePeriod ? "period" : "all"}
              onChange={(value) => setScope(value as "period" | "all")}
              className="h-10 rounded-md bg-card"
            />
          </Field>
          <div className="grid gap-2 sm:grid-cols-3">
            {KINDS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setKind(option.value)}
                aria-pressed={kind === option.value}
                className={`rounded-lg border p-3 text-left transition-colors ${kind === option.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.hint}</p>
              </button>
            ))}
          </div>

          {kind === "charge" &&
            (methods.length ? (
              <Field>
                <FieldLabel>Charge</FieldLabel>
                <SimpleSelect
                  options={methods.map((m) => ({
                    value: m._id,
                    label: `${m.type === "ach" ? "Bank" : "Card"} · ${m.label}${m.isDefault ? " (default)" : ""}`,
                  }))}
                  value={chosenMethod?._id ?? ""}
                  onChange={setMethodId}
                  className="h-10 rounded-md bg-card"
                />
                {chosenMethod?.type === "ach" && (
                  <p className="text-xs text-muted-foreground">
                    A bank debit takes 3–5 business days; the fees show as being
                    collected until it settles.
                  </p>
                )}
              </Field>
            ) : (
              <p className="text-sm text-muted-foreground">
                This wholesaler has no saved card or verified bank account.
                Record a payment instead.
              </p>
            ))}

          {kind === "manual" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>Paid by</FieldLabel>
                <SimpleSelect
                  options={MANUAL_METHODS}
                  value={manualMethod}
                  onChange={(value) => setManualMethod(value as ManualMethod)}
                  className="h-10 rounded-md bg-card"
                />
              </Field>
              <Field>
                <FieldLabel>Reference (optional)</FieldLabel>
                <Input
                  value={reference}
                  onValueChange={setReference}
                  maxLength={200}
                  placeholder="Wire ID, check number…"
                  className="h-10 bg-transparent"
                />
              </Field>
            </div>
          )}

          <Field>
            <FieldLabel>Note (optional)</FieldLabel>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className="bg-transparent"
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
