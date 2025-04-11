import { useState, useEffect } from 'react';
import { FaUserEdit, FaTrash, FaUserCog, FaSearch } from 'react-icons/fa';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import useAuthStore from '../hooks/useAuth';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      toast.success('نقش کاربر با موفقیت تغییر کرد');
      fetchUsers();
    } catch (error) {
      toast.error('خطا در تغییر نقش کاربر');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;

    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('کاربر با موفقیت حذف شد');
      fetchUsers();
    } catch (error) {
      toast.error('خطا در حذف کاربر');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      toast.success('وضعیت کاربر با موفقیت تغییر کرد');
      fetchUsers();
    } catch (error) {
      toast.error('خطا در تغییر وضعیت کاربر');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* هدر و جستجو */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">مدیریت کاربران</h1>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="جستجوی کاربر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute top-3 right-3 text-gray-400" />
          </div>
        </div>

        {/* جدول کاربران */}
        {loading ? (
          <div className="text-center py-4">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">نام کاربری</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">ایمیل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">نقش</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">تاریخ عضویت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="mr-2">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="user">کاربر عادی</option>
                        <option value="admin">ادمین</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                        className={`rounded-lg px-2 py-1 text-sm ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="active">فعال</option>
                        <option value="suspended">مسدود</option>
                        <option value="pending">در انتظار تایید</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaUserEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
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

export default AdminUsers; 