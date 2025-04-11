import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/cart');
        setCart(response.data);
        setLoading(false);
      } catch (error) {
        setError('خطا در دریافت سبد خرید');
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return <div className="text-center p-4">در حال بارگذاری...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg">سبد خرید شما خالی است</div>
        <Link to="/products" className="text-blue-500 hover:text-blue-600 mt-2 inline-block">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* نمایش آیتم‌های سبد خرید */}
    </div>
  );
};

export default Cart; 