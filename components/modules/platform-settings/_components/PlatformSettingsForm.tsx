"use client";

import { useState } from "react";
import { BadgePercent, CreditCard, Landmark } from "lucide-react";
import { Field, FieldError, FieldLabel, Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";

import type {
  FeeRule,
  FeeRuleKey,
  PlatformSettings,
  PlatformSettingsPayload,
} from "../_types/platform-settings.types";

type RuleDraft = { percentage: string; flat: string; cap: string };
type Draft = Record<FeeRuleKey, RuleDraft>;
type Errors = Partial<Record<`${FeeRuleKey}.${keyof RuleDraft}`, string>>;

const SECTIONS: {
  key: FeeRuleKey;
  title: string;
  description: string;
  icon: typeof BadgePercent;
  example: number;
  exampleLabel: string;
}[] = [
  {
    key: "commission",
    title: "Commission",
    description:
      "Retwho's cut of every wholesaler order, on the order subtotal. Taken out of a card payment as it is charged; owed by the wholesaler once a cash or check order is delivered.",
    icon: BadgePercent,
    example: 1000,
    exampleLabel: "on a $1,000.00 order",
  },
  {
    key: "cardFee",
    title: "Card payment fee",
    description:
      "Added on top when a retailer pays an order by card, so the wholesaler is not the one paying to be paid. Shown to the retailer at checkout.",
    icon: CreditCard,
    example: 1000,
    exampleLabel: "on a $1,000.00 card payment",
  },
  {
    key: "achFee",
    title: "ACH payment fee",
    description:
      "Added on top when a retailer pays from a bank account. Kept ready for when ACH payment is switched on.",
    icon: Landmark,
    example: 1000,
    exampleLabel: "on a $1,000.00 ACH payment",
  },
];

const toDraft = (rule?: FeeRule): RuleDraft => ({
  percentage: rule ? String(rule.percentage) : "0",
  flat: rule ? String(rule.flat) : "0",
  cap: rule?.cap != null ? String(rule.cap) : "",
});

const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** The fee on an amount — worked out the way the server does. */
const feeOf = (rule: RuleDraft, amount: number) => {
  const raw =
    (amount * (Number(rule.percentage) || 0)) / 100 + (Number(rule.flat) || 0);
  const capped = rule.cap.trim() ? Math.min(raw, Number(rule.cap) || 0) : raw;
  return Math.round(Math.max(0, capped) * 100) / 100;
};

const validate = (draft: Draft) => {
  const errors: Errors = {};
  for (const { key } of SECTIONS) {
    const rule = draft[key];
    const pct = Number(rule.percentage);
    if (rule.percentage.trim() === "" || Number.isNaN(pct))
      errors[`${key}.percentage`] = "Enter a percentage (0 if none).";
    else if (pct < 0 || pct > 100)
      errors[`${key}.percentage`] = "Between 0 and 100.";
    const flat = Number(rule.flat);
    if (rule.flat.trim() === "" || Number.isNaN(flat))
      errors[`${key}.flat`] = "Enter an amount (0 if none).";
    else if (flat < 0) errors[`${key}.flat`] = "Cannot be negative.";
    if (rule.cap.trim()) {
      const cap = Number(rule.cap);
      if (Number.isNaN(cap) || cap < 0)
        errors[`${key}.cap`] = "Leave empty for no cap.";
    }
  }
  return errors;
};

const toRule = (rule: RuleDraft): FeeRule => ({
  percentage: Number(rule.percentage),
  flat: Number(rule.flat),
  cap: rule.cap.trim() ? Number(rule.cap) : null,
});

/**
 * The platform's commission and online payment fees. One save for all three;
 * every order keeps the rates it was placed under, so only new orders change.
 */
export default function PlatformSettingsForm({
  settings,
  onSave,
  saving,
}: {
  settings: PlatformSettings;
  onSave: (payload: PlatformSettingsPayload) => Promise<unknown>;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<Draft>({
    commission: toDraft(settings.commission),
    cardFee: toDraft(settings.cardFee),
    achFee: toDraft(settings.achFee),
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: FeeRuleKey, field: keyof RuleDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    if (errors[`${key}.${field}`])
      setErrors((prev) => ({ ...prev, [`${key}.${field}`]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    await onSave({
      commission: toRule(draft.commission),
      cardFee: toRule(draft.cardFee),
      achFee: toRule(draft.achFee),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {SECTIONS.map(
        ({ key, title, description, icon: Icon, example, exampleLabel }) => {
          const rule = draft[key];
          return (
            <section
              key={key}
              className="rounded-xl border border-border bg-card"
            >
              <header className="flex items-start gap-3 border-b border-border px-4 py-3 sm:px-5">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">
                    {title}
                  </h2>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </header>
              <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
                <Field>
                  <FieldLabel htmlFor={`${key}-percentage`}>
                    Percentage (%)
                  </FieldLabel>
                  <Input
                    id={`${key}-percentage`}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0}
                    max={100}
                    value={rule.percentage}
                    onValueChange={(v) => set(key, "percentage", v)}
                    aria-invalid={
                      errors[`${key}.percentage`] ? true : undefined
                    }
                    className="bg-transparent"
                  />
                  {errors[`${key}.percentage`] && (
                    <FieldError>{errors[`${key}.percentage`]}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${key}-flat`}>
                    Flat amount ($)
                  </FieldLabel>
                  <Input
                    id={`${key}-flat`}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0}
                    value={rule.flat}
                    onValueChange={(v) => set(key, "flat", v)}
                    aria-invalid={errors[`${key}.flat`] ? true : undefined}
                    className="bg-transparent"
                  />
                  {errors[`${key}.flat`] && (
                    <FieldError>{errors[`${key}.flat`]}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${key}-cap`}>
                    Maximum ($, optional)
                  </FieldLabel>
                  <Input
                    id={`${key}-cap`}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={0}
                    placeholder="No maximum"
                    value={rule.cap}
                    onValueChange={(v) => set(key, "cap", v)}
                    aria-invalid={errors[`${key}.cap`] ? true : undefined}
                    className="bg-transparent"
                  />
                  {errors[`${key}.cap`] && (
                    <FieldError>{errors[`${key}.cap`]}</FieldError>
                  )}
                </Field>
                <p className="text-xs text-muted-foreground sm:col-span-3">
                  {money(feeOf(rule, example))} {exampleLabel}.
                </p>
              </div>
            </section>
          );
        },
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          New rates apply to orders placed from now on. Orders already placed
          keep theirs.
        </p>
        <Button type="submit" loading={saving} className="px-5">
          Save rates
        </Button>
      </div>
    </form>
  );
}
