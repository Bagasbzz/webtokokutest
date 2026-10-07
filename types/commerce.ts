export interface ProductVariant {
  id: string;
  name: string;      // ex: "Ukuran", "Warna"
  value: string;     // ex: "L", "Hitam"
  priceDelta?: number;
  stock?: number;
  weightGram?: number;
  colorHex?: string;
  groupId?: string;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
  required?: boolean;
  maxQty?: number;
  quantity?: number;
}

export interface ProductDetails {
  unit?: string;
  portion_detail?: string;
  contents?: string;
  ingredients?: string;
  usage?: string;
  material?: string;
  size_chart?: string;
  expiry_info?: string;
  storage?: string;
  shipping_note?: string;
}

export interface CommerceProduct {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  slug: string;
  isAvailable: boolean;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  details?: ProductDetails;
  description?: string;
  category?: string;
  weightGram?: number;
  stock?: number;
}

export interface CartItem {
  cartItemId: string; // Unique ID (productId + variant combo)
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variant?: ProductVariant;
  addons?: ProductAddon[];
  thumbnail: string;
  weightGram?: number;
  stock?: number;
}
