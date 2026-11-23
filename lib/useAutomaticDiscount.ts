"use client";

import { useEffect, useState } from "react";
import type { AutomaticDiscountPreview, CartLineDiscountPreview } from "@/types/shopify";

type DiscountListener = (preview: AutomaticDiscountPreview | null) => void;

const previewCache = new Map<string, AutomaticDiscountPreview | null>();
const listeners = new Map<string, Set<DiscountListener>>();
const queuedVariantIds = new Set<string>();
let requestTimer: ReturnType<typeof setTimeout> | null = null;

function notify(variantId: string, preview: AutomaticDiscountPreview | null) {
  previewCache.set(variantId, preview);
  listeners.get(variantId)?.forEach((listener) => listener(preview));
}

async function loadQueuedDiscounts() {
  requestTimer = null;
  const variantIds = Array.from(queuedVariantIds).slice(0, 50);
  variantIds.forEach((variantId) => queuedVariantIds.delete(variantId));
  if (!variantIds.length) return;

  try {
    const response = await fetch("/api/discounts/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantIds }),
    });
    const payload = response.ok
      ? await response.json() as { discounts?: Record<string, AutomaticDiscountPreview> }
      : {};

    variantIds.forEach((variantId) => notify(variantId, payload.discounts?.[variantId] || null));
  } catch {
    variantIds.forEach((variantId) => notify(variantId, null));
  }

  if (queuedVariantIds.size && !requestTimer) {
    requestTimer = setTimeout(loadQueuedDiscounts, 0);
  }
}

function queueDiscountPreview(variantId: string) {
  if (previewCache.has(variantId)) return;
  queuedVariantIds.add(variantId);
  if (!requestTimer) requestTimer = setTimeout(loadQueuedDiscounts, 0);
}

export function useAutomaticDiscount(variantId?: string) {
  const [preview, setPreview] = useState<AutomaticDiscountPreview | null>(() => (
    variantId ? previewCache.get(variantId) || null : null
  ));

  useEffect(() => {
    if (!variantId || !variantId.startsWith("gid://shopify/ProductVariant/")) {
      setPreview(null);
      return;
    }

    if (previewCache.has(variantId)) {
      setPreview(previewCache.get(variantId) || null);
      return;
    }

    setPreview(null);
    const variantListeners = listeners.get(variantId) || new Set<DiscountListener>();
    variantListeners.add(setPreview);
    listeners.set(variantId, variantListeners);
    queueDiscountPreview(variantId);

    return () => {
      variantListeners.delete(setPreview);
      if (!variantListeners.size) listeners.delete(variantId);
    };
  }, [variantId]);

  return preview;
}

export function useAutomaticDiscounts(variantIds: string[]) {
  const variantIdsKey = Array.from(new Set(
    variantIds.filter((variantId) => variantId.startsWith("gid://shopify/ProductVariant/")),
  )).sort().join("|");
  const [previews, setPreviews] = useState<Record<string, AutomaticDiscountPreview>>({});

  useEffect(() => {
    const ids = variantIdsKey ? variantIdsKey.split("|") : [];
    const subscriptions: Array<() => void> = [];
    const nextPreviews: Record<string, AutomaticDiscountPreview> = {};

    ids.forEach((variantId) => {
      const cachedPreview = previewCache.get(variantId);
      if (cachedPreview) nextPreviews[variantId] = cachedPreview;

      if (!previewCache.has(variantId)) {
        const variantListeners = listeners.get(variantId) || new Set<DiscountListener>();
        const listener: DiscountListener = (preview) => {
          setPreviews((current) => {
            if (!preview) {
              const { [variantId]: _removed, ...remaining } = current;
              return remaining;
            }
            return { ...current, [variantId]: preview };
          });
        };

        variantListeners.add(listener);
        listeners.set(variantId, variantListeners);
        subscriptions.push(() => {
          variantListeners.delete(listener);
          if (!variantListeners.size) listeners.delete(variantId);
        });
        queueDiscountPreview(variantId);
      }
    });

    setPreviews(nextPreviews);
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [variantIdsKey]);

  return previews;
}

export function useCartAutomaticDiscounts(
  lines: Array<{ variantId: string; quantity: number }>,
) {
  const linesKey = lines
    .filter((line) => line.variantId.startsWith("gid://shopify/ProductVariant/") && line.quantity > 0)
    .map((line) => `${line.variantId}:${Math.floor(line.quantity)}`)
    .sort()
    .join("|");
  const [previews, setPreviews] = useState<Record<string, CartLineDiscountPreview>>({});

  useEffect(() => {
    if (!linesKey) {
      setPreviews({});
      return;
    }

    const controller = new AbortController();
    const requestLines = linesKey.split("|").map((line) => {
      const separatorIndex = line.lastIndexOf(":");
      return {
        variantId: line.slice(0, separatorIndex),
        quantity: Number(line.slice(separatorIndex + 1)),
      };
    });

    fetch("/api/discounts/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: requestLines }),
      signal: controller.signal,
    })
      .then(async (response) => response.ok
        ? await response.json() as { lines?: Record<string, CartLineDiscountPreview> }
        : {})
      .then((payload) => setPreviews(payload.lines || {}))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPreviews({});
      });

    return () => controller.abort();
  }, [linesKey]);

  return previews;
}
