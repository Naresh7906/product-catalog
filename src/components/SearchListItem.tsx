import { useState, memo, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import type { Product } from './ProductPicker';

interface SearchListItemProps {
  product: Product;
  isSelected: boolean;
  onProductSelect: (product: Product) => void;
  onVariantSelect: (productId: number, variantId: number) => void;
  selectedVariants: Set<number>;
}

// Function to optimize Shopify image URL
const getOptimizedImageUrl = (originalUrl: string) => {
  try {
    const url = new URL(originalUrl);
    // Add width, height, and crop parameters to the URL
    // Format: cdn.shopify.com/.../{size}x{size}/image.jpg
    const path = url.pathname.replace(/(\.[^.]*)$/, '_48x48_crop_center$1');
    return `${url.protocol}//${url.host}${path}`;
  } catch {
    return originalUrl;
  }
};

const SearchListItem = memo(({ 
  product, 
  isSelected, 
  onProductSelect,
  onVariantSelect,
  selectedVariants
}: SearchListItemProps) => {
  const [isReady, setIsReady] = useState(false);
  const optimizedImageUrl = getOptimizedImageUrl(product.image.src);

  useEffect(() => {
    const img = new Image();
    img.src = optimizedImageUrl;
    img.onload = () => setIsReady(true);
    img.onerror = () => setIsReady(true); // Show content even if image fails
  }, [optimizedImageUrl]);

  if (!isReady) {
    return (
      <div className="mb-4 h-[72px] bg-gray-50 rounded animate-pulse" />
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-4 py-2">
        <div className="flex items-center justify-center w-5 h-5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onProductSelect(product)}
            className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
        </div>
        <div className="relative w-12 h-12">
          <img
            src={optimizedImageUrl}
            alt={product.title}
            className="w-12 h-12 object-cover rounded"
            width={48}
            height={48}
          />
        </div>
        <span className="font-medium flex-1">{product.title}</span>
      </div>
      <div className="pl-[4.5rem] space-y-1">
        {product.variants.map((variant) => (
          <div
            key={variant.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-5 h-5">
                <Checkbox
                  checked={selectedVariants.has(variant.id)}
                  onCheckedChange={() => onVariantSelect(product.id, variant.id)}
                  className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
              </div>
              <span className="text-sm text-gray-700">{variant.title}</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium w-14 text-right">${variant.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SearchListItem.displayName = 'SearchListItem';

export default SearchListItem; 