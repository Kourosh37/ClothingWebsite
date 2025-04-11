import '../index.css';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null
  });
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, usersRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        axios.get('http://localhost:8000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        axios.get('http://localhost:8000/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      // Ensure products is an array and process image URLs
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.items || [];
      const processedProducts = productsData.map(product => ({
        ...product,
        image: product.image ? `http://localhost:8000${product.image}` : null
      }));
      
      setProducts(processedProducts);
      setUsers(usersRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطا در دریافت اطلاعات');
      setError('خطا در دریافت اطلاعات');
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8000/api/admin/upload-image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Image upload response:', response.data);

      setNewProduct(prev => ({
        ...prev,
        image: response.data.url
      }));
      toast.success('تصویر با موفقیت آپلود شد');
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.detail || 'خطا در آپلود تصویر');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      // Find the category ID from the categories list
      const selectedCategory = categories.find(cat => cat.name === newProduct.category);
      if (!selectedCategory) {
        toast.error('لطفا یک دسته‌بندی معتبر انتخاب کنید');
        return;
      }

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category_id: selectedCategory.id,
        stock: parseInt(newProduct.stock),
        image: newProduct.image
      };

      console.log('داده‌های ارسالی محصول:', productData);

      const response = await axios.post('http://localhost:8000/api/admin/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('پاسخ سرور:', response.data);

      toast.success('محصول با موفقیت اضافه شد');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null
      });
      fetchData();
    } catch (error) {
      console.error('خطا در ایجاد محصول:', error);
      console.error('پاسخ خطا:', error.response?.data);
      toast.error(error.response?.data?.detail || 'خطا در افزودن محصول');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('محصول با موفقیت حذف شد');
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('خطا در حذف محصول');
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/admin/categories', 
        { name: newCategory },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('دسته‌بندی با موفقیت اضافه شد');
      setNewCategory('');
      fetchData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.detail || 'خطا در اضافه کردن دسته‌بندی');
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      await axios.delete(`http://localhost:8000/api/admin/categories/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('دسته‌بندی با موفقیت حذف شد');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.detail || 'خطا در حذف دسته‌بندی');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('کاربر با موفقیت حذف شد');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('خطا در حذف کاربر');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/admin/products?page=${currentPage}&search=${searchTerm}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('خطا در دریافت محصولات');
      setLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت محصولات</h1>
        <Link
          to="/admin/products/new"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          افزودن محصول جدید
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی محصول..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تصویر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام محصول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  قیمت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  موجودی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  دسته‌بندی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.price.toLocaleString()} تومان
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 space-x-reverse">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                قبلی
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                بعدی
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  نمایش صفحه <span className="font-medium">{currentPage}</span> از{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 