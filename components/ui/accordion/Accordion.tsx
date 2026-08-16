"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/icons/Icons";

/* ------------------------- TYPES ---------------------- */

export type AccordionVariant =
  | "default"
  | "bordered"
  | "separated"
  | "divided"
  | "ghost";

interface AccordionContextValue {
  openItems: string[];
  toggle: (v: string) => void;
  variant: AccordionVariant;
  baseId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<{ value: string; disabled: boolean } | null>(
  null,
);

function useAccordion(component: string) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Accordion>`);
  return ctx;
}

/* --------------------- ACCORDION ------------------------ */

interface AccordionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  variant?: AccordionVariant;
}

const VARIANT_ROOT: Record<AccordionVariant, string> = {
  default: "divide-y divide-border border-y border-border",
  bordered: "divide-y divide-border rounded-lg border border-border",
  separated: "flex flex-col gap-2",
  divided: "divide-y divide-border",
  ghost: "flex flex-col gap-1",
};

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = "single",
      collapsible = true,
      defaultValue,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const baseId = useId();
    const [openItems, setOpenItems] = useState<string[]>(() =>
      defaultValue === undefined
        ? []
        : Array.isArray(defaultValue)
          ? defaultValue
          : [defaultValue],
    );

    const toggle = (v: string) => {
      setOpenItems((prev) => {
        const isOpen = prev.includes(v);
        if (type === "single") {
          if (isOpen) return collapsible ? [] : prev;
          return [v];
        }
        return isOpen ? prev.filter((x) => x !== v) : [...prev, v];
      });
    };

    return (
      <AccordionContext.Provider value={{ openItems, toggle, variant, baseId }}>
        <div
          ref={ref}
          className={cn("w-full", VARIANT_ROOT[variant], className)}
          {...props}
        />
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

/* ----------------------- ACCORDION ITEM ----------------------- */

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const VARIANT_ITEM: Record<AccordionVariant, string> = {
  default: "",
  bordered: "first:rounded-t-lg last:rounded-b-lg",
  separated: "rounded-lg border border-border bg-card",
  divided: "",
  ghost: "rounded-lg",
};

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, disabled = false, ...props }, ref) => {
    const { variant } = useAccordion("AccordionItem");
    return (
      <ItemContext.Provider value={{ value, disabled }}>
        <div
          ref={ref}
          data-state={undefined}
          className={cn(
            VARIANT_ITEM[variant],
            disabled && "opacity-50",
            className,
          )}
          {...props}
        />
      </ItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

/* ----------------- ACCORDION TRIGGER  ----------------------------- */

interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode | ((open: boolean) => ReactNode);
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, icon, ...props }, ref) => {
    const ctx = useAccordion("AccordionTrigger");
    const item = useContext(ItemContext);
    if (!item) {
      throw new Error("<AccordionTrigger> must be used inside <AccordionItem>");
    }
    const open = ctx.openItems.includes(item.value);
    const isRenderIcon = typeof icon === "function";

    return (
      <h3 className="m-0">
        <button
          ref={ref}
          type="button"
          id={`${ctx.baseId}-trigger-${item.value}`}
          aria-expanded={open}
          aria-controls={`${ctx.baseId}-content-${item.value}`}
          disabled={item.disabled}
          onClick={() => ctx.toggle(item.value)}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left",
            "text-sm font-medium text-foreground transition-colors hover:text-foreground/80",
            "rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
            "disabled:pointer-events-none",
            ctx.variant === "default" && "px-0",
            className,
          )}
          {...props}
        >
          {children}
          <motion.span
            aria-hidden="true"
            animate={{ rotate: isRenderIcon ? 0 : open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="shrink-0 text-muted-foreground"
          >
            {isRenderIcon
              ? (icon as (open: boolean) => ReactNode)(open)
              : (icon ?? <ChevronDownIcon className="size-4" />)}
          </motion.span>
        </button>
      </h3>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

/* ---------------- ACCORDION CONTENT ----------------------------- */

const AccordionContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = useAccordion("AccordionContent");
  const item = useContext(ItemContext);
  if (!item) {
    throw new Error("<AccordionContent> must be used inside <AccordionItem>");
  }
  const open = ctx.openItems.includes(item.value);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          className="overflow-hidden"
        >
          <div
            ref={ref}
            role="region"
            id={`${ctx.baseId}-content-${item.value}`}
            aria-labelledby={`${ctx.baseId}-trigger-${item.value}`}
            className={cn(
              "px-4 pb-4 text-sm leading-relaxed text-muted-foreground",
              ctx.variant === "default" && "px-0",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
