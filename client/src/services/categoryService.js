import apiClient from './apiClient';

export const getAllCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await apiClient.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await apiClient.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
