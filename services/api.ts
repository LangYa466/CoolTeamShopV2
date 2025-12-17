import { ApiResponse } from '../types';

const BASE_URL = 'https://shopv2.coolteam.top/api.php';

export const getAuthToken = () => localStorage.getItem('admin_token');
export const setAuthToken = (token: string) => localStorage.setItem('admin_token', token);
export const removeAuthToken = () => localStorage.removeItem('admin_token');

async function request<T>(
  action: string,
  params: Record<string, any> = {},
  method: 'GET' | 'POST' = 'GET',
  body?: FormData | Record<string, any>
): Promise<ApiResponse<T>> {
  const url = new URL(BASE_URL);
  url.searchParams.append('action', action);

  if (method === 'GET') {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, String(params[key]));
      }
    });
  }

  const headers: HeadersInit = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let fetchBody: BodyInit | undefined;

  if (method === 'POST') {
    if (body instanceof FormData) {
      // Let browser set content-type for FormData (multipart)
      fetchBody = body;
    } else if (body) {
      // Convert JSON object to FormData for PHP compatibility
      const formData = new FormData();
      Object.keys(body).forEach(key => {
        if (body[key] !== undefined && body[key] !== null) {
          formData.append(key, String(body[key]));
        }
      });
      fetchBody = formData;
    }
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: fetchBody,
    });

    if (response.status === 429) {
      throw new Error('请求过于频繁，请稍后再试。');
    }
    
    if (response.status === 401) {
      removeAuthToken(); // Token likely invalid
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '网络错误',
    };
  }
}

export const api = {
  // Public
  getNotice: () => request<string>('getNotice'),
  getCategories: () => request<any[]>('getCategories'),
  getProducts: (categoryId?: string) => request<any[]>('getProducts', { category_id: categoryId }),
  getProduct: (id: string) => request<any>('getProduct', { id }),
  createOrder: (data: { product_id: string; quantity: number; pay_type: string; contact_qq: string }) => 
    request<any>('createOrder', {}, 'POST', data),
  getOrder: (contact_qq: string, password: string) => request<any>('getOrder', { contact_qq, password }),
  
  // Admin
  login: (password: string) => request<any>('login', {}, 'POST', { password }),
  addCategory: (data: { name: string; description?: string }) => request<void>('addCategory', {}, 'POST', data),
  editCategory: (data: { id: string; name: string; description?: string }) => request<void>('editCategory', {}, 'POST', data),
  deleteCategory: (id: string) => request<void>('deleteCategory', {}, 'POST', { id }),
  addProduct: (data: any) => request<void>('addProduct', {}, 'POST', data),
  editProduct: (data: any) => request<void>('editProduct', {}, 'POST', data),
  deleteProduct: (id: string) => request<void>('deleteProduct', {}, 'POST', { id }),
  getCards: (product_id: string) => request<string[]>('getCards', { product_id }),
  addCards: (product_id: string, cards: string) => request<any>('addCards', {}, 'POST', { product_id, cards }),
  deleteCard: (product_id: string, index: number) => request<void>('deleteCard', {}, 'POST', { product_id, index }),
  getOrders: (params: { status?: string; keyword?: string; contact_qq?: string } = {}) => request<any[]>('getOrders', params),
  getOrderDetail: (order_no: string) => request<any>('getOrderDetail', { order_no }),
  setNotice: (content: string) => request<void>('setNotice', {}, 'POST', { content }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<any>('uploadImage', {}, 'POST', formData);
  }
};