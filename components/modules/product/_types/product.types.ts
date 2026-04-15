export interface Product {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  upc: string;
  sku: string;
  boxUpc: string;
  modifier: string;
  unit: "pcs" | "kg" | "box" | "pack" | string;
  tag: string[];
  image: string;
}
