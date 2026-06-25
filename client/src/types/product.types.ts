export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface ProductVariant {
  color?: string;
  size?: string;
  stock: number;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: Category;
  brand: Brand;
  variants?: ProductVariant[];
  ratings: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}

export interface PaginatedProducts {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
}
