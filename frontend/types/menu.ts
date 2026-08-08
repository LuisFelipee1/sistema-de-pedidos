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
  description: string;
  price_delta: string;
  image: string | null;
  display_order: number;
}

export interface AddonGroup {
  id: number;
  product: number;
  name: string;
  /** true = extras pagos com múltipla escolha; false = composição obrigatória
   * de resposta única, como o tipo do pão. */
  is_addon: boolean;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  options: AddonOption[];
}

// --- Escrita: o que a tela de cadastro manda de volta ---

export interface AddonOptionInput {
  /** Presente ao editar — o servidor atualiza no lugar e preserva a foto. */
  id?: number;
  name: string;
  description?: string;
  price_delta?: string;
}

export interface AddonGroupInput {
  id?: number;
  name: string;
  is_addon: boolean;
  is_required: boolean;
  options: AddonOptionInput[];
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
