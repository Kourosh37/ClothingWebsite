import { Link } from 'react-router-dom';
import { FaInstagram, FaTelegram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">درباره ما</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              فروشگاه لباس با بیش از 10 سال تجربه در زمینه فروش پوشاک، ارائه‌دهنده بهترین کیفیت و قیمت به مشتریان گرامی است.
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-500 transition-colors p-2 hover:scale-110 transform duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-500 transition-colors p-2 hover:scale-110 transform duration-200"
                aria-label="Telegram"
              >
                <FaTelegram size={24} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-500 transition-colors p-2 hover:scale-110 transform duration-200"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-indigo-500 transition-colors">
                  خانه
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-indigo-500 transition-colors">
                  محصولات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-indigo-500 transition-colors">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-indigo-500 transition-colors">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">اطلاعات تماس</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                آدرس: تهران، خیابان ولیعصر، پلاک 123
              </li>
              <li className="text-gray-400">
                تلفن: 021-12345678
              </li>
              <li className="text-gray-400">
                ایمیل: info@example.com
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} فروشگاه لباس. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 