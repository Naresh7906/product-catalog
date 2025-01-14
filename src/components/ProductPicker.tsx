import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Search } from 'lucide-react';
import mockProducts from '../example/products.json';

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedProducts: Product[]) => void;
}

interface Variant {
  id: number;
  product_id: number;
  title: string;
  price: string;
}

interface Image {
  id: number;
  product_id: number;
  src: string;
}

interface Product {
  id: number;
  title: string;
  variants: Variant[];
  image: Image;
}

interface SelectedVariant {
  productId: number;
  variantId: number;
}

export const ProductPicker = ({ open, onClose, onSelect }: ProductPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filteredProducts = mockProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const paginatedProducts = filteredProducts.slice(0, page * itemsPerPage);
      setProducts(paginatedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProducts();
    } else {
      setSelectedVariants([]);
      setSearchQuery('');
      setPage(1);
    }
  }, [open, page, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight) {
      const maxPages = Math.ceil(mockProducts.length / itemsPerPage);
      if (page < maxPages) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const isVariantSelected = (productId: number, variantId: number) => {
    return selectedVariants.some(
      (sv) => sv.productId === productId && sv.variantId === variantId
    );
  };

  const isProductSelected = (productId: number) => {
    return selectedVariants.some((sv) => sv.productId === productId);
  };

  const toggleVariant = (productId: number, variantId: number) => {
    setSelectedVariants((prev) => {
      const isSelected = isVariantSelected(productId, variantId);
      if (isSelected) {
        return prev.filter(
          (sv) => !(sv.productId === productId && sv.variantId === variantId)
        );
      }
      return [...prev, { productId, variantId }];
    });
  };

  const toggleProduct = (product: Product) => {
    setSelectedVariants((prev) => {
      const isSelected = isProductSelected(product.id);
      if (isSelected) {
        return prev.filter((sv) => sv.productId !== product.id);
      }
      return [
        ...prev,
        ...product.variants.map((variant) => ({
          productId: product.id,
          variantId: variant.id,
        })),
      ];
    });
  };

  const handleConfirm = () => {
    const selectedProducts = products
      .filter((product) => isProductSelected(product.id))
      .map((product) => ({
        ...product,
        variants: product.variants.filter((variant) =>
          isVariantSelected(product.id, variant.id)
        ),
      }));
    onSelect(selectedProducts);
    onClose();
  };

  const selectedCount = selectedVariants.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold">Select Products</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search product"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <ScrollArea className="h-[400px] mt-4 -mx-6 px-6" onScroll={handleScroll}>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id}>
                  <div className="flex items-center space-x-4 py-2">
                    <div className="flex items-center justify-center w-5 h-5">
                      <Checkbox
                        checked={isProductSelected(product.id)}
                        onCheckedChange={() => toggleProduct(product)}
                        className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                    </div>
                    <img
                      src={product.image.src}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
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
                              checked={isVariantSelected(product.id, variant.id)}
                              onCheckedChange={() => toggleVariant(product.id, variant.id)}
                              className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                          </div>
                          <span className="text-sm text-gray-700">{variant.title}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <span className="text-sm text-gray-500">99 available</span>
                          <span className="text-sm font-medium w-14 text-right">${variant.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {loading && <div className="text-center py-4">Loading...</div>}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 