export interface PriceRange {
  id: string;
  name: string;
  min_price: number;
  max_price: number | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
}

export interface GeneratedImageVariation {
  id: number;
  url: string;
  approved: boolean;
}

export interface GeneratedImages {
  status:
    | "pending_generation"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "regenerate_requested";
  variations: GeneratedImageVariation[];
  final_selection_url: string | null;
  approved_at?: string;
}

export interface Product {
  id: string;
  name: string;
  image_url: string | null;
  image_urls?: string[] | null;
  description: string | null;
  price_range_id: string;
  category_id: string;
  created_at: string;
  generated_images?: GeneratedImages | null;
  price_ranges?: PriceRange;
  categories?: Category;
  events?: Event[];
}

export interface ProductWithRelations extends Product {
  price_ranges: PriceRange;
  categories: Category;
  product_events: { events: Event }[];
}

export interface ShortlistItem {
  id: string;
  name: string;
  image_url: string | null;
  price_range?: string;
  category?: string;
}
