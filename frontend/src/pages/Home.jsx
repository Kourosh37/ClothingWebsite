import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/products/categories');
        setCategories(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('خطا در دریافت دسته‌بندی‌ها');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              به فروشگاه آنلاین ما خوش آمدید
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              جدیدترین محصولات با بهترین قیمت‌ها
            </p>
            <Link
              to="/products"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
          دسته‌بندی محصولات
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((categoryName, index) => (
              <Link
                key={index}
                to={`/products?category=${encodeURIComponent(categoryName)}`}
                className="relative h-80 rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={'/images/default-category.jpg'}
                  alt={categoryName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center p-6">
                  <h3 className="text-2xl font-bold text-white text-center">{categoryName}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 