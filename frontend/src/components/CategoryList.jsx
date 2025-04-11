import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryItem from './CategoryItem';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products/categories');
        setCategories(response.data || []);
        setLoading(false);
      } catch (error) {
        setError('خطا در دریافت دسته‌بندی‌ها');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="text-center p-4">در حال بارگذاری...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  if (categories.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-500">هنوز هیچ دسته‌بندی تعریف نشده است</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}
    </div>
  );
};

export default CategoryList; 