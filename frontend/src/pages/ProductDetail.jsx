import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { theme } from '../theme';
import useAuthStore from '../hooks/useAuth';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('خطا در دریافت اطلاعات محصول');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('لطفا ابتدا وارد شوید');
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/cart', {
        productId: id,
        quantity,
        size: selectedSize
      });
      toast.success('محصول به سبد خرید اضافه شد');
      navigate('/cart');
    } catch (err) {
      setError('خطا در افزودن به سبد خرید');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">محصول یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-indigo-600' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} - تصویر ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-xl text-gray-600">{product.price.toLocaleString()} تومان</p>
          
          <div className="prose max-w-none">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سایز:</label>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center rounded-md ${
                      selectedSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تعداد:</label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  -
                </button>
                <span className="text-xl font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`w-full py-3 px-8 rounded-lg text-white text-lg font-medium transition-colors ${
              selectedSize
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            افزودن به سبد خرید
          </button>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">مشخصات محصول</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div className="flex">
                <dt className="w-1/4 text-gray-600">جنس:</dt>
                <dd className="w-3/4 text-gray-900">{product.material}</dd>
              </div>
              <div className="flex">
                <dt className="w-1/4 text-gray-600">رنگ:</dt>
                <dd className="w-3/4 text-gray-900">{product.color}</dd>
              </div>
              <div className="flex">
                <dt className="w-1/4 text-gray-600">برند:</dt>
                <dd className="w-3/4 text-gray-900">{product.brand}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 