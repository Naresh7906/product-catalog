import { useState } from 'react';
import { Button } from './ui/button';
import { ProductPicker } from './ProductPicker';
import { ProductItem } from './ProductItem';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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

interface ProductListItem {
  id: string;
  product: Product;
  discount: {
    type: 'flat' | 'percentage';
    value: number;
  } | null;
  showVariants?: boolean;
  selectedVariantIds?: number[];
}

export const ProductList = () => {
  const [products, setProducts] = useState<ProductListItem[]>([{
    id: '1',
    product: {
      id: 1,
      title: 'Select Product',
      variants: [],
      image: { id: 1, product_id: 1, src: '' }
    },
    discount: null,
    selectedVariantIds: []
  }]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const handleAddProduct = () => {
    setEditingProductIndex(null);
    setIsProductPickerOpen(true);
  };

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setIsProductPickerOpen(true);
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const handleProductSelect = (selectedProducts: Product[]) => {
    if (editingProductIndex !== null) {
      // Replace existing product
      const newProducts = [...products];
      newProducts.splice(editingProductIndex, 1, ...selectedProducts.map(product => ({
        id: `${product.id}-${Date.now()}`,
        product,
        discount: null,
        selectedVariantIds: product.variants.map(v => v.id), // Initialize with all variants selected
        showVariants: false
      })));
      setProducts(newProducts);
    } else {
      // Add new products
      setProducts(prev => [
        ...prev,
        ...selectedProducts.map(product => ({
          id: `${product.id}-${Date.now()}`,
          product,
          discount: null,
          selectedVariantIds: product.variants.map(v => v.id), // Initialize with all variants selected
          showVariants: false
        }))
      ]);
    }
    setIsProductPickerOpen(false);
    setEditingProductIndex(null);
  };

  const handleDiscountChange = (index: number, discount: { type: 'flat' | 'percentage'; value: number } | null) => {
    const newProducts = [...products];
    newProducts[index].discount = discount;
    setProducts(newProducts);
  };

  const handleToggleVariant = (productIndex: number, variantId: number) => {
    const newProducts = [...products];
    const product = newProducts[productIndex];
    if (!product.selectedVariantIds) {
      product.selectedVariantIds = [];
    }
    
    const variantIndex = product.selectedVariantIds.indexOf(variantId);
    if (variantIndex === -1) {
      product.selectedVariantIds.push(variantId);
    } else {
      // Only allow removing if there will be at least one variant left
      if (product.selectedVariantIds.length > 1) {
        product.selectedVariantIds.splice(variantIndex, 1);
      }
    }
    
    setProducts(newProducts);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;

    // If dragging within the main product list
    if (sourceDroppableId === 'products' && destinationDroppableId === 'products') {
      const items = Array.from(products);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setProducts(items);
    }
  };

  const handleVariantReorder = (productIndex: number, sourceIndex: number, destinationIndex: number) => {
    const newProducts = [...products];
    const product = { ...newProducts[productIndex] };
    
    // Get the actual variants in their current order
    const currentVariants = product.product.variants.filter(v => 
      product.selectedVariantIds?.includes(v.id)
    );
    
    // Reorder the variants
    const [movedVariant] = currentVariants.splice(sourceIndex, 1);
    currentVariants.splice(destinationIndex, 0, movedVariant);
    
    // Update the product's variants array to maintain the new order
    product.product.variants = [
      ...currentVariants,
      ...product.product.variants.filter(v => 
        !product.selectedVariantIds?.includes(v.id)
      )
    ];
    
    newProducts[productIndex] = product;
    setProducts(newProducts);
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-6">
      <div style={{ backgroundColor: '#F6F6F8' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-8">Add Products</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 font-medium text-base text-gray-600 mb-4 px-4">
            <div>Product</div>
            <div className="flex justify-end">Discount</div>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {products.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="mb-3"
                        >
                          <ProductItem
                            product={item.product}
                            showRemove={products.length > 1}
                            onRemove={() => handleRemoveProduct(index)}
                            onEdit={() => handleEditProduct(index)}
                            discount={item.discount}
                            onDiscountChange={(discount) => handleDiscountChange(index, discount)}
                            dragHandleProps={provided.dragHandleProps}
                            index={index + 1}
                            selectedVariantIds={item.selectedVariantIds}
                            onToggleVariant={(variantId) => handleToggleVariant(index, variantId)}
                            onVariantReorder={(sourceIndex, destinationIndex) => 
                              handleVariantReorder(index, sourceIndex, destinationIndex)
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleAddProduct}
            variant="outline"
            className="border border-emerald-600 text-emerald-600 hover:bg-transparent hover:text-emerald-700 hover:border-emerald-700 font-medium px-6 py-2 rounded-[20px]"
          >
            Add Product
          </Button>
        </div>
      </div>

      <ProductPicker
        open={isProductPickerOpen}
        onClose={() => {
          setIsProductPickerOpen(false);
          setEditingProductIndex(null);
        }}
        onSelect={handleProductSelect}
      />
    </div>
  );
}; 