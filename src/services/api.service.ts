import { Product, Transaction, ForecastResult, Page } from '../models/inventory.models';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api').replace(/\/$/, '');

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  return response.json();
}

// Product endpoints
export function getProducts(page = 0, size = 20): Promise<Page<Product>> {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  return request<Page<Product>>(`${baseUrl}/products?${params}`);
}

export function getAllProducts(): Promise<Product[]> {
  return request<Product[]>(`${baseUrl}/products/all`);
}

export function getProduct(id: number): Promise<Product> {
  return request<Product>(`${baseUrl}/products/${id}`);
}

export function searchProducts(query: string): Promise<Product[]> {
  const params = new URLSearchParams({ q: query });
  return request<Product[]>(`${baseUrl}/products/search?${params}`);
}

export function getLowStockProducts(): Promise<Product[]> {
  return request<Product[]>(`${baseUrl}/products/low-stock`);
}

export function createProduct(product: Product): Promise<Product> {
  return request<Product>(`${baseUrl}/products`, {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export function updateProduct(id: number, product: Product): Promise<Product> {
  return request<Product>(`${baseUrl}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id: number): Promise<void> {
  return request<void>(`${baseUrl}/products/${id}`, {
    method: 'DELETE',
  });
}

export function updateStock(id: number, change: number): Promise<Product> {
  const params = new URLSearchParams({ change: change.toString() });
  return request<Product>(`${baseUrl}/products/${id}/stock?${params}`, {
    method: 'PATCH',
  });
}

// Transaction endpoints
export function recordTransaction(transaction: Transaction): Promise<Transaction> {
  return request<Transaction>(`${baseUrl}/transactions`, {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}

export function getProductTransactions(productId: number, page = 0, size = 20): Promise<Page<Transaction>> {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  return request<Page<Transaction>>(`${baseUrl}/transactions/product/${productId}?${params}`);
}

export function getAllProductTransactions(productId: number): Promise<Transaction[]> {
  return request<Transaction[]>(`${baseUrl}/transactions/product/${productId}/all`);
}

export function getTransactionsInPeriod(productId: number, start: string, end: string): Promise<Transaction[]> {
  const params = new URLSearchParams({ start: `${start}T00:00:00`, end: `${end}T23:59:59` });
  return request<Transaction[]>(`${baseUrl}/transactions/product/${productId}/period?${params}`);
}

export function getTotalSalesInPeriod(productId: number, start: string, end: string): Promise<number> {
  const params = new URLSearchParams({ start: `${start}T00:00:00`, end: `${end}T23:59:59` });
  return request<number>(`${baseUrl}/transactions/product/${productId}/total-sales?${params}`);
}

export function deleteTransaction(id: number): Promise<void> {
  return request<void>(`${baseUrl}/transactions/${id}`, {
    method: 'DELETE',
  });
}

// Forecast endpoints
export function generateForecast(productId: number): Promise<ForecastResult> {
  return request<ForecastResult>(`${baseUrl}/forecasts/product/${productId}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function generateMultiDayForecast(productId: number, days = 30): Promise<ForecastResult[]> {
  const params = new URLSearchParams({ days: days.toString() });
  return request<ForecastResult[]>(`${baseUrl}/forecasts/product/${productId}/multi-day?${params}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getLatestForecast(productId: number): Promise<ForecastResult> {
  return request<ForecastResult>(`${baseUrl}/forecasts/product/${productId}/latest`);
}

export function getForecastHistory(productId: number): Promise<ForecastResult[]> {
  return request<ForecastResult[]>(`${baseUrl}/forecasts/product/${productId}/history`);
}

export function getUpcomingForecasts(productId: number, fromDate: string): Promise<ForecastResult[]> {
  const params = new URLSearchParams({ fromDate });
  return request<ForecastResult[]>(`${baseUrl}/forecasts/product/${productId}/upcoming?${params}`);
}

export function deleteForecasts(productId: number): Promise<void> {
  return request<void>(`${baseUrl}/forecasts/product/${productId}`, {
    method: 'DELETE',
  });
}
