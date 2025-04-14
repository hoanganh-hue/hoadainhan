import { useState } from 'react';
import { Link } from 'wouter';

type Brand = {
  id: string;
  name: string;
  slug: string;
  borderColor?: string;
};

interface BrandSelectorProps {
  title?: string;
  className?: string;
}

export default function BrandSelector({ title = "Chọn thương hiệu", className = "" }: BrandSelectorProps) {
  // Danh sách các thương hiệu điện thoại với màu viền tương ứng
  const brands: Brand[] = [
    { id: "apple", name: "Apple", slug: "apple", borderColor: "border-blue-500" },
    { id: "samsung", name: "SAMSUNG", slug: "samsung", borderColor: "border-indigo-500" },
    { id: "xiaomi", name: "XIAOMI", slug: "xiaomi", borderColor: "border-orange-500" },
    { id: "oppo", name: "OPPO", slug: "oppo", borderColor: "border-green-500" },
    { id: "vivo", name: "Vivo", slug: "vivo", borderColor: "border-purple-500" },
    { id: "honor", name: "HONOR", slug: "honor", borderColor: "border-red-500" },
    { id: "huawei", name: "HUAWEI", slug: "huawei", borderColor: "border-pink-500" },
  ];

  return (
    <div className={`${className} mb-6`}>
      <h3 className="text-lg font-medium mb-4 text-white">{title}</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/products?brand=${brand.slug}`}
            className="block"
          >
            <div className="w-[120px] h-[70px]">
              <div className={`bg-[#1a0f1f] ${brand.borderColor} border-2 rounded-lg w-full h-full flex items-center justify-center transition-colors hover:bg-[#2a1f2f]`}>
                <div className="text-center px-2 py-1 text-xs font-medium text-white">
                  {brand.name}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}