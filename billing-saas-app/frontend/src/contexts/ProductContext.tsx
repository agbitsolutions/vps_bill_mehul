import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types/product';

interface ProductContextType {
  // Shared product list - loaded once, shared everywhere
  products: Product[];
  setProducts: (products: Product[]) => void;
  productsLoaded: boolean;
  setProductsLoaded: (loaded: boolean) => void;
  // Selection state
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  currentProduct: Product | null;
  setCurrentProduct: (product: Product | null) => void;
  productFilters: {
    search: string;
    category: string;
    inStock: boolean | null;
  };
  setProductFilters: (filters: any) => void;
  productCategories: string[];
  setProductCategories: (categories: string[]) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productFilters, setProductFilters] = useState({
    search: '',
    category: '',
    inStock: null
  });
  const [productCategories, setProductCategories] = useState<string[]>([]);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        productsLoaded,
        setProductsLoaded,
        selectedProducts,
        setSelectedProducts,
        currentProduct,
        setCurrentProduct,
        productFilters,
        setProductFilters,
        productCategories,
        setProductCategories,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;
