export interface Category {
  id: number;
  restaurant: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface CategoryPayload {
  name: string;
  display_order?: number;
  is_active?: boolean;
}

export interface AddonOption {
  id: number;
  addon_group: number;
  name: string;
  price_delta: string;
}

export interface AddonGroup {
  id: number;
  product: number;
  name: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  options: AddonOption[];
}

export interface Product {
  id: number;
  restaurant: number;
  category: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
  addon_groups: AddonGroup[];
}

export interface ProductPayload {
  category: number;
  name: string;
  description?: string;
  price: string;
  is_available?: boolean;
  image?: File;
}
