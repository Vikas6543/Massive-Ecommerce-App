export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  url: string;
  public_id: string;
  _id: string;
}

export interface ProductSpecification {
  key: string;
  value: string;
  _id: string;
}

export interface ProductRatings {
  average: number;
  count: number;
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
  discountPrice: number;
  discountPercentage: number;
  images: ProductImage[];
  category: Category;
  brand: Brand;
  variants?: ProductVariant[];
  ratings: ProductRatings;
  specifications?: ProductSpecification[];
  stock: number;
  totalStock: number;
  isFeatured: boolean;
  tags: string[];
  sold: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: Pagination;
  };
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
