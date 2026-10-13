export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  currentStock: number;
  minStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id?: number;
  product?: Product;
  productId?: number;
  transactionType: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT';
  quantity: number;
  unitPrice: number;
  totalAmount?: number;
  transactionDate?: string;
  notes?: string;
}

export interface ForecastResult {
  id?: number;
  product?: Product;
  productId?: number;
  forecastDate: string;
  predictedDemand: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  modelUsed?: string;
  accuracyScore?: number;
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
