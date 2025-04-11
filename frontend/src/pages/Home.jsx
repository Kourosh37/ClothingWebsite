import { Link } from 'react-router-dom';
import { FaShoppingCart, FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from '../config/axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [featuredResponse, newArrivalsResponse] = await Promise.all([
          axios.get('/api/products/featured'),
          axios.get('/api/products/new-arrivals')
        ]);

        setFeaturedProducts(featuredResponse.data || []);
        setNewArrivals(newArrivalsResponse.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('خطا در دریافت محصولات');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="pt-16">
      {/* Hero Section with Dynamic Background */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-20"></div>
        </div>
        <div className="relative py-24 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              فروشگاه لباس آنلاین
            </h1>
            <p className="text-xl md:text-2xl mb-8 animate-slide-up">بهترین کیفیت، مناسب‌ترین قیمت</p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                <span className="block text-3xl font-bold">۱۰۰۰+</span>
                <span className="text-sm">محصول متنوع</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                <span className="block text-3xl font-bold">۲۴/۷</span>
                <span className="text-sm">پشتیبانی آنلاین</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                <span className="block text-3xl font-bold">۳ روزه</span>
                <span className="text-sm">ارسال سریع</span>
              </div>
            </div>
            <Link
              to="/products"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </div>

      {/* Special Offers Slider */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">پیشنهادات ویژه</h2>
          <p className="text-gray-600 text-center mb-12">تخفیف‌های باورنکردنی، فقط برای شما</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* دو کارت مشابه دیگر */}
          </div>
        </div>
      </section>

      {/* Categories Section with Hover Effects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">دسته‌بندی محصولات</h2>
          <p className="text-gray-600 text-center mb-12">محصولات متنوع برای سلیقه‌های مختلف</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* سه کارت مشابه دیگر برای زنانه، بچگانه و اکسسوری */}
          </div>
        </div>
      </section>

      {/* Latest Products with Animation */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">جدیدترین محصولات</h2>
          <p className="text-gray-600 text-center mb-12">تازه‌ترین محصولات اضافه شده به فروشگاه</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <article key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all">
                <div className="relative pb-[100%]">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                      ٪{product.discount} تخفیف
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">{product.price.toLocaleString()} تومان</p>
                    {product.discount > 0 && (
                      <p className="text-red-500 line-through text-sm">
                        {(product.price * (1 + product.discount/100)).toLocaleString()} تومان
                      </p>
                    )}
                  </div>
                  <Link 
                    to={`/products/${product._id}`}
                    className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    مشاهده محصول
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 