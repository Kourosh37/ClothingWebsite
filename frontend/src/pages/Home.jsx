import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});

  const getCategoryImage = (categoryName) => {
    const categoryImages = {
      'مردانه': '/images/men-category.jpg',
      'زنانه': '/images/women-category.jpg',
      'بچه گانه': '/images/kids-category.jpg',
    };
    return categoryImages[categoryName] || '/images/default-category.jpg';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:8000/api/products/categories');
        const categoriesList = categoriesResponse.data.categories || [];
        console.log('Categories List:', categoriesList);
        setCategories(categoriesList);

        // Fetch all products
        const allProductsResponse = await axios.get('http://localhost:8000/api/products');
        const products = allProductsResponse.data.items || [];
        console.log('All Products Details:', products.map(p => {
          console.log('Product:', p);
          console.log('Product Image:', p.image);
          console.log('Full Image Path:', p.image ? `http://localhost:8000${p.image}` : null);
          return {
            id: p.id,
            name: p.name,
            category_id: p.category_id,
            image: p.image,
            imageType: typeof p.image,
            fullImagePath: p.image ? `http://localhost:8000${p.image}` : null,
            productDetails: JSON.stringify(p, null, 2),
            imageUrl: p.image ? `http://localhost:8000${p.image}` : null
          };
        }));
        setAllProducts(products);

        // Group products by category
        const productsByCategory = {};
        categoriesList.forEach(category => {
          const categoryProducts = products.filter(product => {
            // Check if product has category_id field
            if (!product.category_id) {
              console.log(`Product ${product.id} has no category_id`);
              return false;
            }
            // Log the comparison
            console.log(`Comparing product category_id: ${product.category_id} with category name: ${category}`);
            return product.category_id === categoriesList.indexOf(category) + 1;
          });
          console.log(`Products for category ${category}:`, categoryProducts);
          productsByCategory[category] = categoryProducts;
        });

        console.log('Products by category:', productsByCategory);
        setCategoryProducts(productsByCategory);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="container mx-auto px-4 py-20" dir="rtl">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
          دسته‌بندی محصولات
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              dir="rtl"
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              className="py-4"
            >
              {categories.map((categoryName, index) => {
                const products = categoryProducts[categoryName] || [];
                return (
                  <SwiperSlide key={index}>
                    <Link
                      to={`/products?category=${encodeURIComponent(categoryName)}`}
                      className="block"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                        <div className="relative h-80 overflow-hidden">
                          {products.length > 0 ? (
                            <Swiper
                              modules={[Navigation, Autoplay]}
                              slidesPerView={1}
                              className="h-full w-full"
                              loop={true}
                              autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                              }}
                            >
                              {products.map((product) => (
                                <SwiperSlide key={product.id}>
                                  <img
                                    src={`http://localhost:8000${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    onError={(e) => {
                                      console.error('Error loading product image:', e.target.src);
                                    }}
                                    onLoad={() => {
                                      console.log('Product image loaded successfully:', product.image);
                                    }}
                                  />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          ) : (
                            <img
                              src={getCategoryImage(categoryName)}
                              alt={categoryName}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              onError={(e) => {
                                console.error('Error loading category image:', e.target.src);
                              }}
                            />
                          )}
                        </div>
                        <div className="p-6 bg-white">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{categoryName}</h3>
                          <p className="text-blue-600 text-lg">
                            {products.length} محصول
                          </p>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>

      {/* Latest Products Section */}
      <div className="container mx-auto px-4 py-20" dir="rtl">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
          جدیدترین محصولات
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 4)
                .map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <Link to={`/products/${product.id}`}>
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={product.image ? `http://localhost:8000${product.image}` : ''}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => {
                            console.error('Error loading image:', e.target.src);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', product.image);
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h2>
                        <div className="flex justify-between items-center">
                          <p className="text-xl font-bold text-blue-600">
                            {product.price.toLocaleString()} تومان
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 