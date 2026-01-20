const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export const apiClient = {
  async fetchProducts() {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async fetchSelectedProduct() {
    const response = await fetch(`${API_BASE}/api/selected-product`);
    if (!response.ok) throw new Error('Failed to fetch selected product');
    return response.json();
  },

  async fetchHero() {
    const response = await fetch(`${API_BASE}/api/hero`);
    if (!response.ok) throw new Error('Failed to fetch hero data');
    return response.json();
  },

  async fetchDelivery() {
    const response = await fetch(`${API_BASE}/api/delivery`);
    if (!response.ok) throw new Error('Failed to fetch delivery data');
    return response.json();
  },

  async fetchProductDetails(id) {
    const response = await fetch(`${API_BASE}/api/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product details');
    return response.json();
  }
};