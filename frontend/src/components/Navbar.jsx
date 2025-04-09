import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('خروج با موفقیت انجام شد');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            فروشگاه
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              خانه
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-600">
              محصولات
            </Link>
            {user ? (
              <>
                {!user.is_admin && (
                  <>
                    <Link to="/cart" className="text-gray-600 hover:text-blue-600">
                      سبد خرید
                    </Link>
                    <Link to="/orders" className="text-gray-600 hover:text-blue-600">
                      سفارشات
                    </Link>
                  </>
                )}
                {user.is_admin && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600">
                    پنل مدیریت
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-blue-600"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 