import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { theme } from '../theme';
import useAuthStore from '../hooks/useAuth';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      toast.error('لطفاً برای دسترسی به این صفحه وارد شوید');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      setError('خطا در دریافت سبد خرید');
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      setError('خطا در به‌روزرسانی سبد خرید');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      setError('خطا در حذف از سبد خرید');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-gray-600">در حال بارگذاری...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-red-600">{error}</div>
    </div>
  );

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-xl text-gray-600">سبد خرید شما خالی است</p>
        <Link 
          to="/products"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold text-center mb-8">سبد خرید</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
              <div className="w-full md:w-32 h-32">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{item.product.name}</h3>
                <p className="text-gray-600 mb-2">سایز: {item.size}</p>
                <p className="text-gray-800 mb-4">{item.product.price.toLocaleString()} تومان</p>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-left">
                <p className="text-lg font-semibold mb-2">
                  {(item.quantity * item.product.price).toLocaleString()} تومان
                </p>
                <button
                  onClick={() => removeItem(item._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h3 className="text-xl font-bold mb-4">خلاصه سبد خرید</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>تعداد اقلام:</span>
              <span>{cart.totalItems}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>جمع کل:</span>
              <span>{cart.totalPrice.toLocaleString()} تومان</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ادامه فرآیند خرید
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart; 