import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        setError('محصول مورد نظر یافت نشد');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center p-4">در حال بارگذاری...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!product) return <div className="text-center p-4">محصول مورد نظر وجود ندارد</div>;

  return (
    <div className="container mx-auto p-4">
      {/* نمایش جزئیات محصول */}
    </div>
  );
};

export default ProductPage; 