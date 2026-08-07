export interface RestaurantAddress {
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zip_code: string;
}

/** Cabeçalho da vitrine — o que o cliente final enxerga do restaurante. */
export interface PublicRestaurant extends RestaurantAddress {
  name: string;
  slug: string;
  logo: string | null;
  phone: string;
  /** Endereço já montado em uma linha pelo backend. */
  full_address: string;
}

export interface RestaurantSettings extends PublicRestaurant {
  id: number;
  is_active: boolean;
}

export interface RestaurantSettingsPayload extends Partial<RestaurantAddress> {
  name?: string;
  phone?: string;
  logo?: File;
}
