import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import useAuthStore from '../hooks/useAuth';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('خطا در دریافت محصولات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) return;

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('محصول با موفقیت حذف شد');
      fetchProducts();
    } catch (error) {
      toast.error('خطا در حذف محصول');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* هدر و دکمه اضافه کردن */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">مدیریت محصولات</h1>
          <Link
            to="/admin/products/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaPlus className="ml-2" />
            افزودن محصول
          </Link>
        </div>

        {/* باکس جستجو */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی محصول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute top-3 right-3 text-gray-400" />
          </div>
        </div>

        {/* جدول محصولات */}
        {loading ? (
          <div className="text-center py-4">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">تصویر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">نام محصول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">قیمت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">موجودی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">دسته‌بندی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.price?.toLocaleString()} تومان
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} عدد
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
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

export default AdminProducts; 