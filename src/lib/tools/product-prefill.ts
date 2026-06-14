export const PRODUCT_PREFILL_STORAGE_KEY = "novora_product_prefill";

export type ProductDescriptionPrefill = {
  productName: string;
  features: string;
  targetAudience: string;
};

export function buildProductPrefillFromVideoScript(input: {
  productName: string;
  productFeatures: string;
  targetAudience: string;
}): ProductDescriptionPrefill {
  return {
    productName: input.productName,
    features: input.productFeatures,
    targetAudience: input.targetAudience,
  };
}

export function saveProductPrefill(data: ProductDescriptionPrefill) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PRODUCT_PREFILL_STORAGE_KEY, JSON.stringify(data));
}

export function loadProductPrefill(): ProductDescriptionPrefill | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PRODUCT_PREFILL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProductDescriptionPrefill;
  } catch {
    return null;
  }
}

export function clearProductPrefill() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PRODUCT_PREFILL_STORAGE_KEY);
}
