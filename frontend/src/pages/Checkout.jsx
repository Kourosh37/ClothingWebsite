import '../index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    paymentMethod: 'online'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/orders', formData);
      if (formData.paymentMethod === 'online') {
        window.location.href = response.data.paymentUrl;
      } else {
        navigate(`/orders/${response.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ثبت سفارش');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">تکمیل خرید</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              آدرس تحویل
            </label>
            <textarea
              id="address"
              name="address"
              rows="4"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="آدرس کامل خود را وارد کنید"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              شماره تماس
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="شماره تماس خود را وارد کنید"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              روش پرداخت
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={formData.paymentMethod === 'online'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`w-5 h-5 border rounded-full mr-3 ${
                    formData.paymentMethod === 'online' ? 'border-4 border-indigo-600' : 'border-gray-300'
                  }`} />
                  <div>
                    <span className="font-medium text-gray-900">پرداخت آنلاین</span>
                    <p className="text-sm text-gray-500">پرداخت با درگاه بانکی</p>
                  </div>
                </div>
              </label>

              <label className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`w-5 h-5 border rounded-full mr-3 ${
                    formData.paymentMethod === 'cash' ? 'border-4 border-indigo-600' : 'border-gray-300'
                  }`} />
                  <div>
                    <span className="font-medium text-gray-900">پرداخت در محل</span>
                    <p className="text-sm text-gray-500">پرداخت هنگام تحویل</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'در حال پردازش...' : 'ثبت سفارش'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 