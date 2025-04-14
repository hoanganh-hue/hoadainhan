// Component hiển thị logo dựa trên tên thương hiệu
interface BrandLogoProps {
  brandName: string;
  className?: string;
}

export function BrandLogoSvg({ brandName, className = "" }: BrandLogoProps) {
  const name = brandName.toLowerCase();

  // Logo Adidas
  if (name.includes("adidas")) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className={className}>
        <rect width="100" height="100" fill="#1A237E" opacity="0" />
        <g transform="translate(10, 25)" fill="white">
          <text x="15" y="25" fontFamily="Arial" fontSize="20" fontWeight="bold" fill="#1A237E">ADIDAS</text>
          <path d="M60 40C60 30 51.1 20 40 20S20 30 20 40c0 10 8.9 16.6 20 16.6s20-6.6 20-16.6z M20 44.5c0-2.2 1.8-3.9 4-3.9s4 1.8 4 3.9c0 2.2-1.8 3.9-4 3.9s-4-1.8-4-3.9z M32 44.5c0-2.2 1.8-3.9 4-3.9s4 1.8 4 3.9c0 2.2-1.8 3.9-4 3.9s-4-1.8-4-3.9z M44 44.5c0-2.2 1.8-3.9 4-3.9s4 1.8 4 3.9c0 2.2-1.8 3.9-4 3.9s-4-1.8-4-3.9z" fill="#1A237E"/>
        </g>
      </svg>
    );
  }

  // Logo Nike
  if (name.includes("nike")) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className={className}>
        <rect width="100" height="100" fill="#1A1A1A" opacity="0" />
        <g transform="translate(10, 30)" fill="#1A1A1A">
          <text x="23" y="15" fontFamily="Arial" fontSize="20" fontWeight="bold" fill="#1A1A1A">NIKE</text>
          <path d="M72.6,24.3c-0.1,0-19.6-14.6-19.6-14.6c-1.8-1.6-3.9-1.2-4.4,0.6c-0.6,1.8-0.2,3.9,1.6,4.4l19.6,14.6c1.8,1.6,3.9,0.2,4.4-1.6C74.8,25.9,74.4,24.9,72.6,24.3z" fill="#1A1A1A"/>
          <path d="M10,50L10,50c0.1,0,40.6-30.5,40.6-30.5c3-3.6,7.8-2.6,9.2,1.4c1.6,3,0.6,7.8-2.4,9.2l-40.5,30.5c-3,2.6-7.8,0.6-9.2-2.4C5.2,54.9,7,51.1,10,50z" fill="#1A1A1A"/>
        </g>
      </svg>
    );
  }

  // Logo Casio
  if (name.includes("casio")) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className={className}>
        <rect width="100" height="100" fill="#1E3A8A" opacity="0" />
        <g transform="translate(10, 25)" fill="#1E3A8A">
          <rect x="5" y="5" width="70" height="40" rx="5" stroke="#1E3A8A" strokeWidth="3" fill="none"/>
          <text x="20" y="35" fontFamily="Arial" fontSize="18" fontWeight="bold" fill="#1E3A8A">CASIO</text>
          <line x1="12" y1="15" x2="12" y2="35" stroke="#1E3A8A" strokeWidth="2"/>
          <line x1="68" y1="15" x2="68" y2="35" stroke="#1E3A8A" strokeWidth="2"/>
        </g>
      </svg>
    );
  }

  // Logo Samsung
  if (name.includes("samsung")) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className={className}>
        <rect width="100" height="100" fill="#1565C0" opacity="0" />
        <g transform="translate(5, 25)" fill="#1565C0">
          <text x="3" y="30" fontFamily="Arial" fontSize="20" fontWeight="bold" fill="#1565C0">SAMSUNG</text>
          <text x="10" y="48" fontFamily="Arial" fontSize="10" fill="#1565C0">ELECTRONICS VN</text>
        </g>
      </svg>
    );
  }

  // Logo Sony
  if (name.includes("sony")) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className={className}>
        <rect width="100" height="100" fill="#3E236E" opacity="0" />
        <g transform="translate(10, 25)" fill="#3E236E">
          <text x="15" y="35" fontFamily="Arial" fontSize="24" fontWeight="bold" fill="#3E236E">SONY</text>
          <text x="8" y="50" fontFamily="Arial" fontSize="10" fill="#3E236E">CENTER VIỆT NAM</text>
        </g>
      </svg>
    );
  }

  // Logo Pandora
  if (name.includes("pandora")) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className={className}>
        <rect width="100" height="100" fill="#AA1155" opacity="0" />
        <g transform="translate(5, 25)" fill="#AA1155">
          <text x="2" y="35" fontFamily="Arial" fontSize="18" fontWeight="bold" fill="#AA1155">PANDORA</text>
          <text x="15" y="50" fontFamily="Arial" fontSize="10" fill="#AA1155">OFFICIAL STORE</text>
        </g>
      </svg>
    );
  }

  // Default logo (Apple)
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" fill="#000000" opacity="0" />
      <path d="M70.66,50.04c-0.03-5.93,2.56-10.4,7.8-13.54a15.8,15.8,0,0,0-12.53-6.78c-5.29-0.54-10.42,3.16-13.12,3.16-2.74,0-6.9-3.1-11.36-3.02A16.6,16.6,0,0,0,27.79,39.25c-5.78,10.05-1.48,24.86,4.1,33c2.78,4,6.06,8.47,10.35,8.3,4.18-0.17,5.76-2.7,10.8-2.7,5.02,0,6.5,2.7,10.8,2.6,4.48-0.08,7.3-4.06,10-8.09a33.27,33.27,0,0,0,4.55-9.44A14.17,14.17,0,0,1,70.66,50.04Z" fill="#000000"/>
      <path d="M59.53,25.77a15.38,15.38,0,0,0,3.5-11.06,15.52,15.52,0,0,0-10.1,5.26,14.53,14.53,0,0,0-3.6,10.6A12.85,12.85,0,0,0,59.53,25.77Z" fill="#000000"/>
    </svg>
  );
}