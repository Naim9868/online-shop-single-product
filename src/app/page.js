// app/page.js

import HomeClient from './HomeClient';

async function getHomeData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const [productsRes, selectedRes, heroRes, deliveryRes] = await Promise.all([
    fetch(`${baseUrl}/api/products`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/selected-product`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/hero`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/delivery`, { cache: 'no-store' }),
  ]);

  if (!productsRes.ok || !selectedRes.ok || !heroRes.ok || !deliveryRes.ok) {
    throw new Error('Failed to fetch home data');
  }

  const products = await productsRes.json();
  const selected = await selectedRes.json();
  const hero = await heroRes.json();
  const delivery = await deliveryRes.json();

  let selectedProduct = null;

  if (selected?.selectedProduct?._id) {
    const productRes = await fetch(
      `${baseUrl}/api/products/${selected.selectedProduct._id}`,
      { cache: 'no-store' }
    );

    if (productRes.ok) {
      const productData = await productRes.json();
      selectedProduct = productData.product;
    }
  }

  return {
    products: products.products || [],
    selectedProduct,
    hero,
    delivery,
  };
}

export default async function Page() {
  const data = await getHomeData();
  return <HomeClient initialData={data} />;
}
