import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-right">
            <h3 className="text-xl font-bold mb-4">درباره ما</h3>
            <p className="text-gray-300">
              فروشگاه آنلاین ما با هدف ارائه بهترین محصولات با کیفیت و قیمت مناسب به مشتریان عزیز فعالیت می‌کند.
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  محصولات
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">
                  سبد خرید
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold mb-4">تماس با ما</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</li>
              <li className="text-gray-300">ایمیل: info@example.com</li>
              <li className="text-gray-300">آدرس: تهران، خیابان آزادی</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            تمامی حقوق این وب‌سایت محفوظ است © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 