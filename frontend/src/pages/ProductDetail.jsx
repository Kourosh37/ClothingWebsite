import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../hooks/useAuth';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/products/${id}`);
        const productData = response.data;
        setProduct({
          ...productData,
          image: productData.image ? `http://localhost:8000${productData.image}` : null
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('خطا در دریافت اطلاعات محصول');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('لطفاً ابتدا وارد شوید');
      return;
    }

    try {
      await axios.post('/api/cart/items', {
        product_id: product.id,
        quantity: 1,
      });
      toast.success('محصول به سبد خرید اضافه شد');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('خطا در افزودن به سبد خرید');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">محصول یافت نشد</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-blue-600">
              {product.price.toLocaleString()} تومان
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">دسته‌بندی:</span> {product.category}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">موجودی:</span>{' '}
              {product.stock > 0 ? (
                <span className="text-green-600">موجود</span>
              ) : (
                <span className="text-red-600">ناموجود</span>
              )}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
              product.stock === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 