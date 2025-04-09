import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطا در دریافت اطلاعات');
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
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">پنل مدیریت</h1>
      
      <div className="flex space-x-4 mb-8 justify-end">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('products')}
        >
          مدیریت محصولات
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('users')}
        >
          مدیریت کاربران
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('categories')}
        >
          مدیریت دسته‌بندی‌ها
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-right">افزودن محصول جدید</h2>
          <form onSubmit={handleCreateProduct} className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="نام محصول"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border p-2 rounded text-right"
                required
              />
              <input
                type="text"
                placeholder="توضیحات"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="border p-2 rounded text-right"
                required
              />
              <input
                type="number"
                placeholder="قیمت"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="border p-2 rounded text-right"
                required
              />
              <input
                type="number"
                placeholder="موجودی"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="border p-2 rounded text-right"
                required
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="border p-2 rounded text-right"
                required
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border p-2 rounded text-right"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              افزودن محصول
            </button>
          </form>

          <h2 className="text-2xl font-bold mb-4 text-right">لیست محصولات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="text-blue-600 font-bold mb-2">
                  {product.price.toLocaleString()} تومان
                </p>
                <p className="text-gray-600 mb-2">موجودی: {product.stock}</p>
                <p className="text-gray-600 mb-4">دسته‌بندی: {product.category}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    حذف محصول
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-right">لیست کاربران</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user.id} className="border rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">{user.username}</h3>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <p className="text-gray-600 mb-4">
                  نقش: {user.is_admin ? 'مدیر' : 'کاربر عادی'}
                </p>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  حذف کاربر
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-right">افزودن دسته‌بندی جدید</h2>
          <form onSubmit={handleCreateCategory} className="mb-8">
            <input
              type="text"
              placeholder="نام دسته‌بندی"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border p-2 rounded text-right"
              required
            />
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              افزودن دسته‌بندی
            </button>
          </form>

          <h2 className="text-2xl font-bold mb-4 text-right">لیست دسته‌بندی‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                <button
                  onClick={() => handleDeleteCategory(category.name)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  حذف دسته‌بندی
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 