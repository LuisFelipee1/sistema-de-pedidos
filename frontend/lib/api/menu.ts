import type { PaginatedResponse } from "@/types/common";
import type { Category, CategoryPayload, Product, ProductPayload } from "@/types/menu";

import { apiClient } from "./client";

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<PaginatedResponse<Category>>("/api/categories/");
  return data.results;
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>("/api/categories/", payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/api/categories/${id}/`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/categories/${id}/`);
}

export async function listProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>("/api/products/");
  return data.results;
}

function toProductFormData(payload: Partial<ProductPayload>): FormData {
  const form = new FormData();
  if (payload.category !== undefined) form.append("category", String(payload.category));
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.price !== undefined) form.append("price", payload.price);
  if (payload.description !== undefined) form.append("description", payload.description);
  if (payload.is_available !== undefined) form.append("is_available", String(payload.is_available));
  if (payload.image) form.append("image", payload.image);
  return form;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>("/api/products/", toProductFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateProduct(
  id: number,
  payload: Partial<ProductPayload>,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(
    `/api/products/${id}/`,
    toProductFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/products/${id}/`);
}
