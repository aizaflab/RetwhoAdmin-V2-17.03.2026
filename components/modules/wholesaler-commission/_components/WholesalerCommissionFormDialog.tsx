"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import { getApiErrorMessage } from "@/lib/apiError";

import {
  commissionOn,
  money,
  ruleText,
} from "../_data/wholesaler-commission-options";
import type {
  CommissionRule,
  SetWholesalerCommissionPayload,
  WholesalerCommissionRow,
} from "../_types/wholesaler-commission.types";

interface WholesalerCommissionFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** The shop being set; null while closed. */
  shop: WholesalerCommissionRow | null;
  globalCommission?: CommissionRule;
  onSet: (
    shopId: string,
    data: SetWholesalerCommissionPayload,
  ) => Promise<unknown>;
  onReset: (shopId: string) => Promise<unknown>;
  saving?: boolean;
}

type Mode = "global" | "custom";
type Draft = { percentage: string; flat: string; cap: string; note: string };
type FormErrors = Partial<Record<keyof Draft, string>>;

const EXAMPLE_ORDER = 1000;

const toDraft = (shop: WholesalerCommissionRow | null): Draft => {
  const rule = shop?.customRate?.commission;
  return {
    percentage: rule ? String(rule.percentage) : "",
    flat: rule ? String(rule.flat) : "0",
    cap: rule?.cap != null ? String(rule.cap) : "",
    note: shop?.customRate?.note ?? "",
  };
};

/**
 * One wholesaler's commission: the global rate, or a rate of its own. Saving
 * "global" on a shop that had its own rate takes that rate away. Either way it
 * reaches new orders only.
 */
export default function WholesalerCommissionFormDialog(
  props: WholesalerCommissionFormDialogProps,
) {
  // Remounted per shop, so the form starts from that shop's rate.
  return props.shop ? (
    <CommissionForm key={props.shop._id} {...props} shop={props.shop} />
  ) : null;
}

function CommissionForm({
  open,
  onClose,
  shop,
  globalCommission,
  onSet,
  onReset,
  saving = false,
}: WholesalerCommissionFormDialogProps & { shop: WholesalerCommissionRow }) {
  const hadOwn = !!shop.customRate;
  // Opened to set a rate, so it starts on "own rate" either way.
  const [mode, setMode] = useState<Mode>("custom");
  const [draft, setDraft] = useState<Draft>(toDraft(shop));
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (field: keyof Draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const rule: CommissionRule = {
    percentage: Number(draft.percentage) || 0,
    flat: Number(draft.flat) || 0,
    cap: draft.cap.trim() ? Number(draft.cap) || 0 : null,
  };

  const validate = (): FormErrors => {
    const found: FormErrors = {};
    const pct = Number(draft.percentage);
    if (draft.percentage.trim() === "" || Number.isNaN(pct))
      found.percentage = "Enter a percentage (0 if none).";
    else if (pct < 0 || pct > 100) found.percentage = "Between 0 and 100.";
    const flat = Number(draft.flat);
    if (draft.flat.trim() === "" || Number.isNaN(flat))
      found.flat = "Enter an amount (0 if none).";
    else if (flat < 0) found.flat = "Cannot be negative.";
    if (draft.cap.trim()) {
      const cap = Number(draft.cap);
      if (Number.isNaN(cap) || cap < 0) found.cap = "Leave empty for no cap.";
    }
    return found;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "global") {
        if (hadOwn) {
          await onReset(shop._id);
          toast.success(`"${shop.companyName}" is back on the global rate.`);
        }
        onClose();
        return;
      }
      const found = validate();
      setErrors(found);
      if (Object.values(found).some(Boolean)) {
        toast.error("Please fill in the highlighted fields.");
        return;
      }
      await onSet(shop._id, {
        percentage: rule.percentage,
        flat: rule.flat,
        cap: rule.cap,
        ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
      });
      toast.success(
        `"${shop.companyName}" is now charged ${ruleText(rule)} on new orders.`,
      );
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the commission."));
    }
  };

  const modes: { value: Mode; label: string; hint: string }[] = [
    {
      value: "global",
      label: "Global rate",
      hint: `${ruleText(globalCommission)} — the same as every other wholesaler.`,
    },
    {
      value: "custom",
      label: "Own rate",
      hint: "A rate for this shop alone.",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="large"
      title="Set Commission"
      description={
        <span className="block">
          <span className="font-medium text-foreground">
            {shop.companyName}
          </span>
          {shop.owner?.email ? ` · ${shop.owner.email}` : ""}
          <span className="mt-0.5 block">
            New orders use this rate; orders already placed keep theirs.
          </span>
        </span>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="wholesaler-commission-form"
            loading={saving}
            loadingText="Saving..."
          >
            {mode === "global"
              ? hadOwn
                ? "Back to Global Rate"
                : "Keep Global Rate"
              : "Save Commission"}
          </Button>
        </div>
      }
    >
      <form
        id="wholesaler-commission-form"
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((option) => {
            const selected = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                aria-pressed={selected}
                className={`flex h-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-primary" : "border-muted-foreground/40"
                  }`}
                >
                  {selected && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {option.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {mode === "custom" && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            {/* The rate: a percentage of the order subtotal plus a flat sum. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="wc-percentage">Percentage</FieldLabel>
                <Input
                  id="wc-percentage"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0}
                  max={100}
                  placeholder="e.g. 2.5"
                  value={draft.percentage}
                  onValueChange={(v) => set("percentage", v)}
                  endIcon={
                    <span className="text-sm text-muted-foreground">%</span>
                  }
                  aria-invalid={errors.percentage ? true : undefined}
                  className="bg-transparent"
                />
                {errors.percentage ? (
                  <FieldError>{errors.percentage}</FieldError>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Of the order subtotal.
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="wc-flat">Flat amount</FieldLabel>
                <Input
                  id="wc-flat"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0}
                  value={draft.flat}
                  onValueChange={(v) => set("flat", v)}
                  startIcon={
                    <span className="text-sm text-muted-foreground">$</span>
                  }
                  aria-invalid={errors.flat ? true : undefined}
                  className="bg-transparent"
                />
                {errors.flat ? (
                  <FieldError>{errors.flat}</FieldError>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Added to every order. 0 for none.
                  </p>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="wc-cap">
                Maximum per order{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="wc-cap"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                placeholder="No maximum"
                value={draft.cap}
                onValueChange={(v) => set("cap", v)}
                startIcon={
                  <span className="text-sm text-muted-foreground">$</span>
                }
                aria-invalid={errors.cap ? true : undefined}
                className="bg-transparent"
              />
              {errors.cap ? (
                <FieldError>{errors.cap}</FieldError>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The commission on one order never goes above this. Leave empty
                  for no maximum.
                </p>
              )}
            </Field>

            {/* What it comes to, beside what the global rate would charge. */}
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="mb-2 text-xs text-muted-foreground">
                On a {money(EXAMPLE_ORDER)} order subtotal
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">This shop</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {money(commissionOn(rule, EXAMPLE_ORDER))}
                  </p>
                </div>
                {globalCommission && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Global rate ({ruleText(globalCommission)})
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                      {money(commissionOn(globalCommission, EXAMPLE_ORDER))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Field>
              <FieldLabel htmlFor="wc-note">
                Note{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="wc-note"
                value={draft.note}
                onChange={(e) => set("note", e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="e.g. Contract rate until December"
                className="bg-transparent"
              />
            </Field>
          </div>
        )}

        {mode === "global" && (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            {hadOwn
              ? `This shop's own rate (${ruleText(shop.customRate?.commission)}) is removed, and new orders are charged the global ${ruleText(globalCommission)}.`
              : `This shop is already on the global rate — ${ruleText(globalCommission)}.`}
          </p>
        )}
      </form>
    </Dialog>
  );
}
