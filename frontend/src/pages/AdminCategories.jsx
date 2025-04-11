import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import useAuthStore from '../hooks/useAuth';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, newCategory, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('دسته‌بندی با موفقیت ویرایش شد');
      } else {
        await axios.post('/api/categories', newCategory, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('دسته‌بندی با موفقیت اضافه شد');
      }
      setNewCategory({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(editingCategory ? 'خطا در ویرایش دسته‌بندی' : 'خطا در ایجاد دسته‌بندی');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;

    try {
      await axios.delete(`/api/categories/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('دسته‌بندی با موفقیت حذف شد');
      fetchCategories();
    } catch (error) {
      toast.error('خطا در حذف دسته‌بندی');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* فرم اضافه/ویرایش دسته‌بندی */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام دسته‌بندی
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingCategory ? 'ویرایش' : 'افزودن'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategory({ name: '', description: '' });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* لیست دسته‌بندی‌ها */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">لیست دسته‌بندی‌ها</h2>
            {loading ? (
              <div className="text-center py-4">در حال بارگذاری...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">نام</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">توضیحات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">تعداد محصولات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                        <td className="px-6 py-4">{category.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                            {category.productCount || 0} محصول
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
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
      </div>
    </div>
  );
};

export default AdminCategories; 