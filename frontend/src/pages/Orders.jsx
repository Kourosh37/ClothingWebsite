import '../index.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('خطا در دریافت سفارشات');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'در انتظار تایید';
      case 'processing':
        return 'در حال پردازش';
      case 'shipped':
        return 'ارسال شده';
      case 'delivered':
        return 'تحویل داده شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
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

  if (orders.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="text-xl text-gray-600">سفارشی یافت نشد</div>
      <Link 
        to="/products"
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        مشاهده محصولات
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">سفارشات من</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  سفارش #{order._id}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 space-x-reverse">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-gray-600">تعداد: {item.quantity}</p>
                        <p className="text-gray-600">سایز: {item.size}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-medium text-gray-900">
                          {item.price.toLocaleString()} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">تاریخ سفارش:</span>
                  <span className="text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">مبلغ کل:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {order.totalAmount.toLocaleString()} تومان
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">آدرس تحویل:</h4>
                <p className="text-gray-600">{order.shippingAddress}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 