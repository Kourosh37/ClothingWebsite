import '../index.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserInfo({
        ...userInfo,
        ...response.data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات پروفایل');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // اگر رمز عبور جدید وارد شده باشد
      if (userInfo.newPassword) {
        if (userInfo.newPassword !== userInfo.confirmPassword) {
          toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند');
          return;
        }
      }

      const dataToUpdate = {
        username: userInfo.username,
        email: userInfo.email,
        phone: userInfo.phone,
        address: userInfo.address
      };

      if (userInfo.currentPassword && userInfo.newPassword) {
        dataToUpdate.currentPassword = userInfo.currentPassword;
        dataToUpdate.newPassword = userInfo.newPassword;
      }

      await axios.put('/api/users/profile', dataToUpdate, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('پروفایل با موفقیت بروزرسانی شد');
      
      // پاک کردن فیلدهای رمز عبور
      setUserInfo({
        ...userInfo,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطا در بروزرسانی پروفایل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">پروفایل کاربری</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اطلاعات اصلی */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">اطلاعات شخصی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline ml-2" />
                  نام کاربری
                </label>
                <input
                  type="text"
                  value={userInfo.username}
                  onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline ml-2" />
                  ایمیل
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline ml-2" />
                  شماره تماس
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline ml-2" />
                  آدرس
                </label>
                <textarea
                  value={userInfo.address}
                  onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* تغییر رمز عبور */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">تغییر رمز عبور</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaKey className="inline ml-2" />
                  رمز عبور فعلی
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={userInfo.currentPassword}
                    onChange={(e) => setUserInfo({ ...userInfo, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaKey className="inline ml-2" />
                  رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={userInfo.newPassword}
                    onChange={(e) => setUserInfo({ ...userInfo, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaKey className="inline ml-2" />
                  تکرار رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={userInfo.confirmPassword}
                    onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* دکمه ذخیره */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 