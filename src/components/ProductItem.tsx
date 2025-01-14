import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronDown, ChevronUp, X, GripVertical, Pencil } from 'lucide-react';
import { DraggableProvidedDragHandleProps, Draggable, Droppable } from '@hello-pangea/dnd';

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

interface ProductItemProps {
  product: Product;
  showRemove?: boolean;
  onRemove?: () => void;
  onEdit: () => void;
  discount: {
    type: 'flat' | 'percentage';
    value: number;
  } | null;
  onDiscountChange: (discount: { type: 'flat' | 'percentage'; value: number } | null) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  index: number;
  selectedVariantIds?: number[];
  onToggleVariant?: (variantId: number) => void;
}

export const ProductItem = ({
  product,
  showRemove = true,
  onRemove,
  onEdit,
  discount,
  onDiscountChange,
  dragHandleProps,
  index,
  selectedVariantIds = [],
  onToggleVariant,
}: ProductItemProps) => {
  const [showVariants, setShowVariants] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const hasMultipleVariants = product.variants.length > 1;

  const handleDiscountTypeChange = (type: 'flat' | 'percentage') => {
    onDiscountChange({ type, value: discount?.value || 0 });
  };

  const handleDiscountValueChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onDiscountChange({ type: discount?.type || 'percentage', value: numValue });
  };

  const selectedVariants = product.variants.filter(v => selectedVariantIds.includes(v.id));

  const handleAddDiscount = () => {
    setShowDiscount(true);
    onDiscountChange({ type: 'percentage', value: 0 });
  };

  return (
    <div style={{ backgroundColor: '#F6F6F8' }}>
      <div className="flex items-center gap-4 p-4" style={{ backgroundColor: '#F6F6F8' }}>
        <div className="flex items-center gap-3">
          <div {...dragHandleProps} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="text-gray-500">{index}.</div>
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <div className="bg-white shadow-sm rounded-[20px] py-2 px-4 flex-1 min-w-[300px]">
            <button 
              onClick={onEdit} 
              className="text-left font-medium text-gray-500 hover:text-blue-600 flex items-center gap-2 w-full"
            >
              {product.title}
              <Pencil className="h-4 w-4 text-gray-400 ml-auto" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showDiscount ? (
            <Button
              onClick={handleAddDiscount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] px-6 py-2 h-auto"
            >
              Add Discount
            </Button>
          ) : (
            <>
              <div className="bg-white shadow-sm rounded-[20px]">
                <Input
                  type="number"
                  value={discount?.value || ''}
                  onChange={(e) => handleDiscountValueChange(e.target.value)}
                  className="w-20 h-9 border-0 focus:ring-0 rounded-[20px]"
                  placeholder="0"
                />
              </div>

              <div className="bg-white shadow-sm rounded-[20px]">
                <Select
                  value={discount?.type || 'percentage'}
                  onValueChange={handleDiscountTypeChange}
                >
                  <SelectTrigger className="w-[100px] h-9 border-0 focus:ring-0 rounded-[20px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">% Off</SelectItem>
                    <SelectItem value="flat">Flat Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {showRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-gray-400 hover:text-gray-600 h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {hasMultipleVariants && (
        <div className="flex justify-end pr-4">
          <button
            onClick={() => setShowVariants(!showVariants)}
            className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
          >
            {showVariants ? 'Hide variants' : 'Show variants'}
            {showVariants ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {showVariants && (
        <Droppable droppableId={`variants-${index}`}>
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps}
              className="mt-2 space-y-2"
            >
              {selectedVariants.map((variant, variantIndex) => (
                <Draggable
                  key={variant.id}
                  draggableId={`variant-${variant.id}`}
                  index={variantIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-4 p-4 ml-12"
                      style={{ backgroundColor: '#F6F6F8' }}
                    >
                      <div {...provided.dragHandleProps} className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white shadow-sm rounded-[20px] py-2 px-4">
                          <div className="font-medium">{variant.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {showDiscount && (
                          <>
                            <div className="bg-white shadow-sm rounded-[20px]">
                              <Input
                                type="number"
                                value={discount?.value || ''}
                                onChange={(e) => handleDiscountValueChange(e.target.value)}
                                className="w-20 h-9 border-0 focus:ring-0 rounded-[20px]"
                                placeholder="0"
                              />
                            </div>

                            <div className="bg-white shadow-sm rounded-[20px]">
                              <Select
                                value={discount?.type || 'percentage'}
                                onValueChange={handleDiscountTypeChange}
                              >
                                <SelectTrigger className="w-[100px] h-9 border-0 focus:ring-0 rounded-[20px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">% Off</SelectItem>
                                  <SelectItem value="flat">Flat Off</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleVariant?.(variant.id)}
                          className="text-gray-400 hover:text-gray-600 h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}; 