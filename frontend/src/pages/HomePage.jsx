import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductList from '../components/ProductList';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, newArrivalsRes] = await Promise.all([
          axios.get('/api/products/featured'),
          axios.get('/api/products/new-arrivals')
        ]);
        
        setFeaturedProducts(featuredRes.data || []);
        setNewArrivals(newArrivalsRes.data || []);
        setLoading(false);
      } catch (error) {
        setError('خطا در بارگذاری اطلاعات');
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) return <div className="text-center p-4">در حال بارگذاری...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-8">
      {/* محصولات ویژه */}
      <section>
        <h2 className="text-2xl font-bold mb-4">محصولات ویژه</h2>
        {featuredProducts.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-gray-500">در حال حاضر محصول ویژه‌ای وجود ندارد</div>
          </div>
        ) : (
          <ProductList products={featuredProducts} />
        )}
      </section>

      {/* محصولات جدید */}
      <section>
        <h2 className="text-2xl font-bold mb-4">جدیدترین محصولات</h2>
        {newArrivals.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-gray-500">هنوز محصول جدیدی اضافه نشده است</div>
          </div>
        ) : (
          <ProductList products={newArrivals} />
        )}
      </section>
    </div>
  );
};

export default HomePage; 