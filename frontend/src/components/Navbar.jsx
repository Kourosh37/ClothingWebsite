import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaStore, FaBox, FaLayerGroup, FaUsers, FaCog, FaUser, FaSignOutAlt, FaSignInAlt, FaShoppingCart } from 'react-icons/fa';
import useAuthStore from '../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.isAdmin === true;

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* لوگو */}
            <Link to="/" className="text-xl font-bold text-indigo-600 ml-4">
              فروشگاه لباس
            </Link>

            {/* منوی اصلی */}
            {isAdmin ? (
              <div className="flex items-center mr-6 space-x-2 space-x-reverse">
                {/* لینک‌های با متن */}
                <Link 
                  to="/" 
                  className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <FaHome className="ml-2 w-5 h-5" />
                  <span>خانه</span>
                </Link>
                <Link 
                  to="/products" 
                  className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <FaStore className="ml-2 w-5 h-5" />
                  <span>محصولات</span>
                </Link>

                {/* خط جداکننده */}
                <div className="mx-4 h-6 w-px bg-gray-300"></div>

                {/* آیکون‌های مدیریتی با تولتیپ */}
                <Link
                  to="/admin/products"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-md group relative"
                >
                  <FaBox className="w-5 h-5" />
                  <span className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 w-32 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 text-center whitespace-nowrap">
                    مدیریت محصولات
                  </span>
                </Link>

                <Link
                  to="/admin/categories"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-md group relative"
                >
                  <FaLayerGroup className="w-5 h-5" />
                  <span className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 w-24 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 text-center whitespace-nowrap">
                    دسته‌بندی‌ها
                  </span>
                </Link>

                <Link
                  to="/admin/users"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-md group relative"
                >
                  <FaUsers className="w-5 h-5" />
                  <span className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 w-28 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 text-center whitespace-nowrap">
                    مدیریت کاربران
                  </span>
                </Link>

                <Link
                  to="/admin/settings"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-md group relative"
                >
                  <FaCog className="w-5 h-5" />
                  <span className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 w-36 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 text-center whitespace-nowrap">
                    ویرایش اطلاعات سایت
                  </span>
                </Link>

                <Link
                  to="/admin/profile"
                  className="p-2 text-gray-900 hover:bg-gray-100 rounded-md group relative"
                >
                  <FaUser className="w-5 h-5" />
                  <span className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 w-24 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 text-center whitespace-nowrap">
                    پروفایل ادمین
                  </span>
                </Link>
              </div>
            ) : (
              // منوی کاربر عادی
              <div className="flex items-center mr-6 space-x-2 space-x-reverse">
                <Link 
                  to="/" 
                  className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <FaHome className="ml-2 w-5 h-5" />
                  <span>خانه</span>
                </Link>
                <Link 
                  to="/products" 
                  className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <FaStore className="ml-2 w-5 h-5" />
                  <span>محصولات</span>
                </Link>
                {user && (
                  <>
                    <Link 
                      to="/cart" 
                      className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      <FaShoppingCart className="ml-2 w-5 h-5" />
                      <span>سبد خرید</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                    >
                      <FaUser className="ml-2 w-5 h-5" />
                      <span>پروفایل</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* دکمه خروج/ورود */}
          <div className="flex items-center">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
              >
                <FaSignOutAlt className="ml-2 w-5 h-5" />
                <span>خروج</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center px-3 py-2 text-gray-900 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
              >
                <FaSignInAlt className="ml-2 w-5 h-5" />
                <span>ورود</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 