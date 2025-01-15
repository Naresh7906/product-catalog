const ProductSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 py-2">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="pl-[4.5rem] space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-14 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSkeleton; 