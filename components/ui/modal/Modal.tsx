"use client";
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { XIcon } from "@/components/icons/Icons";

/** ########### GLOBAL SCROLL LOCK MANAGER ########### **/
let __openModalCount = 0;
function lockBodyScroll() {
  if (__openModalCount === 0) {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";
  }
  __openModalCount += 1;
}

function unlockBodyScroll() {
  __openModalCount -= 1;
  if (__openModalCount < 0) __openModalCount = 0;

  if (__openModalCount === 0) {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
}
/** ################################################# **/

const ANIM_MS = 200 as const; // Matches duration-200

type ModalSize = "small" | "medium" | "large" | "xlarge" | "xxlarge" | "full";
export type ModalVariant = "default" | "destructive" | "warning" | "success";

export interface ModalProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Controlled open state */
  open?: boolean;
  onClose?: () => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  variant?: ModalVariant;
  zIndex?: number;
  overlayClassName?: string;
  children?: React.ReactNode;
}

const Modal = forwardRef(function Modal(
  {
    className,
    children,
    open = false,
    onClose,
    size = "medium",
    closeOnBackdropClick = true,
    closeOnEsc = true,
    showCloseButton = true,
    preventScroll = true,
    initialFocus,
    title,
    description,
    footer,
    variant = "default",
    zIndex = 99999,
    overlayClassName,
    ...props
  }: ModalProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid synchronous setState in effect body to prevent cascading renders warning
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Consolidate states to avoid multiple re-renders and cascading updates
  const [modalState, setModalState] = useState({
    isVisible: false,
    isExiting: false,
    animIn: false,
  });

  const { isVisible, isExiting, animIn } = modalState;

  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Sync the 'open' prop with internal state
  useEffect(() => {
    if (!mounted) return;

    if (open) {
      // Opening: Break render cascade for linter
      let t2: NodeJS.Timeout;
      const t1 = setTimeout(() => {
        setModalState((prev) => ({
          ...prev,
          isVisible: true,
          isExiting: false,
        }));
        t2 = setTimeout(() => {
          setModalState((prev) => ({ ...prev, animIn: true }));
        }, 10);
      }, 0);
      return () => {
        clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    } else {
      // Start closing: Trigger the exit animation
      if (isVisible) {
        const t = setTimeout(() => {
          setModalState((prev) => ({
            ...prev,
            animIn: false,
            isExiting: true,
          }));
        }, 0);
        return () => clearTimeout(t);
      }
    }
  }, [open, mounted, isVisible]);

  // Finish the closing sequence after the animation duration (ANIM_MS)
  useEffect(() => {
    // When we've started exiting but animations are off, start the unmount timer
    if (isExiting && !animIn) {
      const closeT = setTimeout(() => {
        setModalState({ isVisible: false, isExiting: false, animIn: false });
      }, ANIM_MS);
      return () => clearTimeout(closeT);
    }
  }, [isExiting, animIn]);

  // Handle Scroll Lock
  useEffect(() => {
    if (!mounted) return;
    // We lock when visible.
    if (isVisible && preventScroll) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [isVisible, preventScroll, mounted]);

  // Focus management
  useEffect(() => {
    if (!mounted) return;
    if (isVisible) {
      previousActiveElement.current =
        document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 50);
      return () => window.clearTimeout(t);
    } else if (previousActiveElement.current) {
      const t = window.setTimeout(() => {
        previousActiveElement.current?.focus?.();
      }, 50);
      return () => window.clearTimeout(t);
    }
  }, [isVisible, initialFocus, mounted]);

  // ESC to close
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((open || isExiting) && e.key === "Escape" && closeOnEsc) {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isExiting, closeOnEsc, onClose, mounted]);

  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose?.();
    }
  };

  const handleTabKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
    );
    if (!focusableElements.length) {
      e.preventDefault();
      return;
    }

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (
        document.activeElement === firstEl ||
        document.activeElement === modalRef.current
      ) {
        lastEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  };

  const sizeClasses: Record<ModalSize, string> = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
    xlarge: "max-w-xl",
    xxlarge: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  const variantClasses: Record<ModalVariant, string> = {
    default:
      "bg-white text-slate-900 border-slate-200/60 shadow-xl dark:bg-[#040614] dark:text-zinc-100 dark:border-darkBorder/70",
    destructive:
      "bg-white text-slate-900 border-red-100 shadow-red-500/5 dark:bg-[#040614] dark:text-zinc-100 dark:border-red-900/20",
    warning:
      "bg-white text-slate-900 border-amber-100 shadow-amber-500/5 dark:bg-[#040614] dark:text-zinc-100 dark:border-amber-900/20",
    success:
      "bg-white text-slate-900 border-emerald-100 shadow-emerald-500/5 dark:bg-[#040614] dark:text-zinc-100 dark:border-emerald-900/20",
  };

  // Render while visible (open OR playing exit animation)
  if (!mounted || !isVisible) return null;

  return createPortal(
    <div
      data-modal-container="true"
      className={cn(
        "fixed inset-0 flex items-center z-10000 justify-center p-1 bg-black/50 backdrop-blur-sm focus:outline-none ani3",
        animIn ? "opacity-100" : "opacity-0 pointer-events-none",
        overlayClassName,
      )}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={(node) => {
          (modalRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        className={cn(
          "relative w-full rounded-lg overflow-hidden ani3 focus:outline-none border ",
          animIn
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-5 scale-90 opacity-0",
          // Only apply sizeClasses if className doesn't contain a max-w class
          className && /max-w-/.test(className)
            ? ""
            : (sizeClasses[size] ?? sizeClasses.medium),
          variantClasses[variant] ?? variantClasses.default,
          className,
        )}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Tab") handleTabKey(e);
        }}
        {...props}
      >
        {/* Accent Bar for status variants */}
        <div className={cn("absolute top-0 left-0 right-0 h-1")} />

        {showCloseButton && (
          <button
            type="button"
            className="absolute right-3 top-4 rounded-lg size-9 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-darkBorder/50 transition-all focus:outline-none z-10 cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}

        <div className="sm:p-5 p-3">
          {title && (
            <div className="mb-5 pr-8">
              <h2
                id="modal-title"
                className="text-xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-50"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="modal-description"
                  className="sm:mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
          )}

          <div
            data-modal-scrollable
            className={cn(
              !title ? "mt-0" : "",
              "max-h-[85vh] overflow-auto noBar text-slate-600 dark:text-zinc-300",
              "flex flex-col",
              "border-t border-slate-100 dark:border-darkBorder/50 pt-3",
            )}
            style={{
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>

          {footer && (
            <div className="mt-5 flex items-center justify-end gap-3 font-medium">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
});

Modal.displayName = "Modal";
export { Modal };
