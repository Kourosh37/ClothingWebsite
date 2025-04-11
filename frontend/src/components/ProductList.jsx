import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        setProducts(response.data.items || []);
        setLoading(false);
      } catch (error) {
        setError('خطا در دریافت محصولات');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center p-4">در حال بارگذاری...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  
  if (products.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg">هنوز هیچ محصولی اضافه نشده است</div>
        <p className="text-sm text-gray-400 mt-2">به زودی محصولات جدید اضافه خواهند شد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList; 