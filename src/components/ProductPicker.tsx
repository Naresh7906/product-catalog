import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Search } from 'lucide-react';
import axios from 'axios';
import ProductSkeleton from './ProductSkeleton';
import { debounce } from 'lodash';
import InfiniteScroll from './InfiniteScroll';
import SearchListItem from './SearchListItem';

export interface Variant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  inventory_policy: string;
  created_at: string;
  updated_at: string;
  admin_graphql_api_id: string;
}

export interface Image {
  id: number;
  product_id: number;
  src: string;
}

export interface Product {
  id: number;
  title: string;
  vendor: string;
  handle: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  status: string;
  variants: Variant[];
  image: Image;
  images: Image[];
  admin_graphql_api_id: string;
}

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedProducts: Product[]) => void;
}

if (!import.meta.env.VITE_API_URL || !import.meta.env.VITE_API_KEY) {
  throw new Error('Missing required environment variables. Please check .env.local file.');
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const ProductPicker = ({ open, onClose, onSelect }: ProductPickerProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 10;

  const debouncedSearch = debounce((value: string) => {
    setPage(0);
    setHasMore(true);
    setProducts([]);
    fetchProducts(value, 0);
  }, 150);

  const fetchProducts = async (search: string, pageNum: number) => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          search,
          page: pageNum,
          limit: itemsPerPage
        },
        headers: {
          'x-api-key': API_KEY
        }
      });

      const newProducts = response.data;
      
      if (Array.isArray(newProducts)) {
        setHasMore(newProducts.length === itemsPerPage);
        if (pageNum === 0) {
          setProducts(newProducts);
        } else {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNewProducts];
          });
        }
      } else {
        setHasMore(false);
        if (pageNum === 0) setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProducts('', 0);
    } else {
      setSearchInput('');
      setSelectedVariants(new Set());
      setProducts([]);
      setPage(0);
      setHasMore(true);
    }
  }, [open]);

  useEffect(() => {
    if (open && page > 0) {
      fetchProducts(searchInput, page);
    }
  }, [page]);

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedVariants(prev => {
      const next = new Set(prev);
      const variantIds = product.variants.map(v => v.id);
      const hasAllVariants = variantIds.every(id => prev.has(id));
      
      if (hasAllVariants) {
        variantIds.forEach(id => next.delete(id));
      } else {
        variantIds.forEach(id => next.add(id));
      }
      
      return next;
    });
  };

  const handleVariantSelect = (_productId: number, variantId: number) => {
    setSelectedVariants(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedProducts = products
      .filter(product => product.variants.some(v => selectedVariants.has(v.id)))
      .map(product => ({
        ...product,
        variants: product.variants.filter(v => selectedVariants.has(v.id))
      }));
    onSelect(selectedProducts);
    onClose();
  };

  const isProductSelected = (product: Product) => {
    return product.variants.some(v => selectedVariants.has(v.id));
  };

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
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="pl-9 border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <ScrollArea className="h-[400px] mt-4 -mx-6 px-6">
            <div className="space-y-4">
              {loading && page === 0 ? (
                <>
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                </>
              ) : (
                <InfiniteScroll
                  isLoading={loading}
                  hasMore={hasMore}
                  next={() => setPage(p => p + 1)}
                  threshold={0.1}
                  rootMargin="100px"
                >
                  <div className="space-y-4">
                    {products.map((product) => (
                      <SearchListItem
                        key={product.id}
                        product={product}
                        isSelected={isProductSelected(product)}
                        onProductSelect={handleProductSelect}
                        onVariantSelect={handleVariantSelect}
                        selectedVariants={selectedVariants}
                      />
                    ))}
                    {loading && page > 0 && (
                      <div className="py-4">
                        <ProductSkeleton />
                      </div>
                    )}
                  </div>
                </InfiniteScroll>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedVariants.size} variants selected
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