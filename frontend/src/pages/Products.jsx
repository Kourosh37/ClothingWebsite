import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Products = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('همه');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setCategory(decodeURIComponent(categoryParam));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products');
        const products = response.data.items || [];
        const productsWithFullUrls = products.map(product => ({
          ...product,
          image: product.image ? `http://localhost:8000${product.image}` : null
        }));
        setProducts(productsWithFullUrls);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('خطا در دریافت محصولات');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفا ابتدا وارد حساب کاربری خود شوید');
        return;
      }

      await axios.post(
        'http://localhost:8000/api/cart/add',
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('محصول با موفقیت به سبد خرید اضافه شد');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('خطا در افزودن به سبد خرید');
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'همه' || product.category === category;
    return matchesSearch && matchesCategory;
  }) : [];

  const categories = ['همه', ...new Set(products.map((product) => product.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">محصولات ما</h1>
        <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
          <div className="flex-1">
            <input
              type="text"
              placeholder="جستجوی محصولات..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
            <Link to={`/products/${product.id}`}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{product.name}</h2>
                <p className="text-gray-600 mb-2">{product.category}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-blue-600">
                    {product.price.toLocaleString()} تومان
                  </p>
                </div>
              </div>
            </Link>
            <div className="px-6 pb-6">
              <button
                onClick={(e) => handleAddToCart(e, product.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                افزودن به سبد خرید
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products; 