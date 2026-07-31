export interface Restaurant {
  id: number;
  name: string;
  slug: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RestaurantSignupPayload {
  restaurant_name: string;
  restaurant_slug: string;
  username: string;
  email?: string;
  password: string;
}

export interface RestaurantSignupResponse extends AuthTokens {
  restaurant: Restaurant;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export type LoginResponse = AuthTokens;

export interface Me {
  id: number;
  username: string;
  email: string;
  restaurant: number | null;
  roles: string[];
}
