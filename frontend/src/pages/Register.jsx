import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import useAuthStore from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      const { success, user } = await register(registerData);
      
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 font-['Vazirmatn'] mt-8">
      <div className="max-w-sm w-full space-y-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
            ایجاد حساب کاربری
          </h2>
          <p className="text-center text-sm text-gray-600">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              وارد شوید
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg relative text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2.5 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 font-['Vazirmatn']"
                placeholder="نام کاربری"
                dir="rtl"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2.5 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 font-['Vazirmatn']"
                placeholder="ایمیل"
                dir="rtl"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2.5 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 font-['Vazirmatn']"
                placeholder="رمز عبور"
                dir="rtl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200" />
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2.5 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all duration-200 font-['Vazirmatn']"
                placeholder="تکرار رمز عبور"
                dir="rtl"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] font-['Vazirmatn'] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                <FaUserPlus className="h-5 w-5 text-indigo-200 group-hover:text-white transition-colors duration-200" />
              </span>
              {loading ? 'در حال ثبت‌نام...' : 'ایجاد حساب کاربری'}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <div className="w-full h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500 whitespace-nowrap px-2 font-['Vazirmatn']">یا</span>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center w-full py-2.5 px-4 border border-indigo-500 text-base font-bold rounded-lg text-indigo-600 bg-transparent hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 font-['Vazirmatn']"
            >
              ورود به حساب کاربری
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 