import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthStore();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('/api/cart/items', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCartItems(response.data.items || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast.error('خطا در دریافت سبد خرید');
        setLoading(false);
      }
    };

    if (user && token) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/items/${itemId}`, {
        quantity: newQuantity,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('تعداد محصول به‌روزرسانی شد');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('خطا در به‌روزرسانی تعداد');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      toast.success('محصول از سبد خرید حذف شد');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('خطا در حذف محصول');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          لطفاً برای مشاهده سبد خرید وارد شوید
        </h2>
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          سبد خرید شما خالی است
        </h2>
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">سبد خرید</h1>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="p-6">
              <div className="flex items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 mr-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600">{item.product.category}</p>
                  <p className="text-blue-600 font-bold mt-2">
                    {item.product.price.toLocaleString()} تومان
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">
              مجموع: {calculateTotal().toLocaleString()} تومان
            </span>
            <Link
              to="/checkout"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              پرداخت
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 