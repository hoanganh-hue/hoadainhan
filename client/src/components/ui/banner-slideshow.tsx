import { useState, useEffect, useRef } from 'react';

interface BannerSlideshowProps {
  interval?: number; // Thời gian chuyển đổi giữa các slides (ms)
  className?: string;
}

// Danh sách banner với nội dung theo từng banner
const banners = [
  {
    id: 1,
    src: '/images/banners/slides/bags-shoes.png',
    alt: 'Giày dép, túi xách và phụ kiện thời trang',
    href: '/categories/bags',
    content: {
      title: 'Giày dép, túi xách & phụ kiện',
      description: 'Bộ sưu tập túi xách và giày dép mới nhất dành cho bạn',
      buttonText: 'Mua ngay'
    }
  },
  {
    id: 2,
    src: '/images/banners/slides/tiktok-banner1.png',
    alt: 'Bắt đầu bán hàng trên TikTok Shop',
    href: '/auth',
    content: {
      title: 'Bắt đầu bán hàng trên TikTok Shop',
      description: 'Cơ hội kinh doanh mới cho thương hiệu của bạn',
      buttonText: 'Đăng ký ngay'
    }
  },
  {
    id: 3,
    src: '/images/banners/slides/tiktok-banner2.png',
    alt: 'TikTok Shop Affiliate Marketing',
    href: '/affiliate',
    content: {
      title: 'TikTok Shop Affiliate Marketing',
      description: 'Kiếm tiền bằng cách quảng bá sản phẩm trên TikTok Shop',
      buttonText: 'Tham gia ngay'
    }
  },
  {
    id: 4,
    src: '/images/banners/slides/tiktok-banner3.png',
    alt: 'TikTok Shop - Kết nối nhà bán hàng và người dùng',
    href: '/categories',
    content: {
      title: 'TikTok Shop',
      description: 'Khám phá các sản phẩm độc đáo từ các thương hiệu trên TikTok',
      buttonText: 'Xem sản phẩm'
    }
  },
  {
    id: 5,
    src: '/images/banners/slides/tiktok4.png',
    alt: 'TikTok Shop - Bắt đầu bán hàng trên TikTok Shop',
    href: '#tiktok-start',
    content: {
      title: 'Bắt đầu bán hàng trên TikTok Shop',
      description: 'Tham gia ngay vào cộng đồng nhà bán hàng đang phát triển mạnh mẽ',
      buttonText: 'Bắt đầu bán hàng'
    }
  }
];

export default function BannerSlideshow({ interval = 4000, className = '' }: BannerSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // Chuyển đổi tự động giữa các slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      if (!isAnimating) {
        goToNextSlide();
      }
    }, interval);
    
    return () => clearInterval(slideTimer);
  }, [interval, currentSlide, isAnimating]);
  
  // Hàm chuyển đến slide tiếp theo
  const goToNextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const nextSlide = (currentSlide + 1) % banners.length;
    setCurrentSlide(nextSlide);
    
    // Kết thúc hoạt ảnh sau 600ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };
  
  // Hàm chuyển đến slide trước đó
  const goToPrevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const prevSlide = (currentSlide - 1 + banners.length) % banners.length;
    setCurrentSlide(prevSlide);
    
    // Kết thúc hoạt ảnh sau 600ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };
  
  // Xử lý chuyển slide khi nhấn vào nút
  const goToSlide = (slideIndex: number) => {
    if (isAnimating || slideIndex === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(slideIndex);
    
    // Kết thúc hoạt ảnh sau 600ms
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };
  
  return (
    <div className={`relative w-full overflow-hidden rounded-lg shadow-md ${className}`} style={{ height: 'auto', minHeight: '250px' }}>
      {/* Slideshow container */}
      <div 
        ref={slideContainerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ height: 'auto', minHeight: '250px', maxHeight: '400px' }}
      >
        <div 
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ 
            width: `${banners.length * 100}%`, 
            transform: `translateX(-${(100 / banners.length) * currentSlide}%)` 
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-shrink-0 h-full"
              style={{ width: `${100 / banners.length}%` }}
            >
              <a href={banner.href} className="block w-full h-full relative">
                <div 
                  className={`w-full h-full relative flex items-center justify-center ${
                    banner.id === 3 
                      ? 'bg-blue-600' 
                      : banner.id === 4 
                        ? 'bg-black' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100'
                  }`}
                  aria-label={banner.alt}
                >
                  <img 
                    src={banner.src}
                    alt={banner.alt}
                    className="w-full h-full object-contain mx-auto"
                    style={{
                      maxHeight: '400px'
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent py-4 px-6">
                  <h3 className="text-white text-lg md:text-xl font-bold">{banner.content.title}</h3>
                  <p className="text-white/90 text-sm md:text-base mt-1 mb-3">{banner.content.description}</p>
                  <button className={`${
                    banner.id === 1 
                      ? 'bg-yellow-300 hover:bg-yellow-400 text-purple-900' 
                      : banner.id === 2
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : banner.id === 3
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : banner.id === 4
                            ? 'bg-cyan-400 hover:bg-cyan-500 text-black'
                            : 'bg-white hover:bg-gray-100 text-primary'
                    } px-4 py-1.5 rounded-full text-sm font-medium shadow-md transition-all duration-200 transform hover:scale-105`}>
                    {banner.content.buttonText}
                  </button>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
      
      {/* Nút điều hướng trái/phải */}
      <button 
        onClick={goToPrevSlide}
        className="absolute left-3 md:left-5 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-1.5 md:p-2.5 z-20 transition-all shadow-md"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      <button 
        onClick={goToNextSlide}
        className="absolute right-3 md:right-5 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-1.5 md:p-2.5 z-20 transition-all shadow-md"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
      
      {/* Nút điều hướng dưới */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 md:space-x-3 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-8 h-2 md:w-12 md:h-3 rounded-full focus:outline-none transition-all duration-300 shadow-sm ${
              currentSlide === index 
                ? 'bg-white scale-100' 
                : 'bg-white/50 scale-90 hover:scale-95 hover:bg-white/80'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}