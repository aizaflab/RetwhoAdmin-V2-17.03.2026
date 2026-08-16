"use client";

import { useEffect } from "react";

/**
 * Background scroll lock with NO layout shift and NO scrollbar bleeding over
 * the overlay. When an overlay opens we hide the page scrollbar
 * (`overflow: hidden` on the body) and, at the same moment, add the removed
 * scrollbar's width back as `padding-right` — so nothing reflows, and the
 * native scrollbar no longer sits on top of a full-height panel like a Drawer.
 *
 * Shared by Dialog and Drawer; safe to nest — an internal counter applies the
 * lock on the first open and restores the exact previous inline styles after
 * the last close.
 */

let openCount = 0;
let prevOverflow = "";
let prevPaddingRight = "";

function lock() {
  if (openCount === 0 && typeof document !== "undefined") {
    const body = document.body;
    // Width the scrollbar was occupying (0 when the page doesn't scroll).
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    prevOverflow = body.style.overflow;
    prevPaddingRight = body.style.paddingRight;

    if (scrollbarWidth > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";
  }
  openCount += 1;
}

function unlock() {
  openCount -= 1;
  if (openCount < 0) openCount = 0;

  if (openCount === 0 && typeof document !== "undefined") {
    document.body.style.overflow = prevOverflow;
    document.body.style.paddingRight = prevPaddingRight;
  }
}

export function lockBodyScroll() {
  lock();
}

export function unlockBodyScroll() {
  unlock();
}

/** Lock the background scroll while `active` is true. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return () => unlock();
  }, [active]);
}
