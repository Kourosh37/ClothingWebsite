import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('خطا در دریافت سفارشات');
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('با موفقیت خارج شدید');
    navigate('/');
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
          لطفاً برای مشاهده پروفایل وارد شوید
        </h2>
        <button
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ورود به حساب کاربری
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">پروفایل کاربری</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">اطلاعات کاربری</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium">نام کاربری</label>
                <p className="text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">ایمیل</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">عملیات</h2>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              خروج از حساب کاربری
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">سفارشات من</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center">شما هنوز سفارشی ثبت نکرده‌اید</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      سفارش #{order.id}
                    </h3>
                    <p className="text-gray-600">
                      تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status === 'completed' ? 'تکمیل شده' : 'در حال پردازش'}
                  </span>
                </div>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="mr-4">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-600">
                          {item.quantity} عدد × {item.price.toLocaleString()} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-lg font-bold text-gray-900">
                    مجموع: {order.total.toLocaleString()} تومان
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 