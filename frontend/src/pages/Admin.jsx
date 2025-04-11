import '../index.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // تبدیل داده‌ها به آرایه اگر نبود
        const productsData = Array.isArray(response.data) ? response.data : response.data.items || [];
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('خطا در دریافت محصولات');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProducts(products.filter(product => product.id !== productId));
      toast.success('محصول با موفقیت حذف شد');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.detail || 'خطا در حذف محصول');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl text-red-600">{error}</div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
        <Link
          to="/admin/products/new"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          افزودن محصول جدید
        </Link>
      </div>

      {/* نمایش محصولات */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">لیست محصولات</h2>
        {loading ? (
          <div className="text-center py-4">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام محصول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">قیمت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">موجودی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.price.toLocaleString()} تومان</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 ml-4"
                      >
                        ویرایش
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 