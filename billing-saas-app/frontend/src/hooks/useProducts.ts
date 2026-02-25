import { useEffect, useState, useCallback } from 'react';
import { Product } from '../types/product';
import { useProductContext } from '../contexts/ProductContext';
import { IProductService } from '../services/productService';
import { getProductService } from '../services/DIContainer';

const useProducts = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {
        products,
        setProducts,
        productsLoaded,
        setProductsLoaded,
        currentProduct,
        setCurrentProduct,
        selectedProducts,
        setSelectedProducts
    } = useProductContext();

    const productService: IProductService = getProductService();

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const productList = await productService.getProducts();
            setProducts(Array.isArray(productList) ? productList : []);
            setProductsLoaded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [productService, setProducts]);

    // Only fetch once when app starts - if already loaded, skip
    useEffect(() => {
        if (!productsLoaded) {
            loadProducts();
        }
    }, [productsLoaded]);

    useEffect(() => {
        const handleRefresh = () => {
            loadProducts();
        };
        window.addEventListener('inventory-updated', handleRefresh);
        window.addEventListener('bill-created', handleRefresh);
        return () => {
            window.removeEventListener('inventory-updated', handleRefresh);
            window.removeEventListener('bill-created', handleRefresh);
        };
    }, []);

    const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null);
            const newProduct = await productService.createProduct(productData);
            setProducts([...products, newProduct]);
            return newProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [productService, setProducts, products]);

    const updateProduct = useCallback(async (updatedProduct: Product) => {
        try {
            setError(null);
            const result = await productService.updateProduct(updatedProduct);
            setProducts(products.map(p => p.id === updatedProduct.id ? result : p));
            if (currentProduct?.id === updatedProduct.id) {
                setCurrentProduct(result);
            }
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [productService, setProducts, products, currentProduct, setCurrentProduct]);

    const deleteProduct = useCallback(async (id: string) => {
        const previousProducts = [...products];
        try {
            setError(null);
            setProducts(products.filter(p => p.id !== id));
            if (currentProduct?.id === id) {
                setCurrentProduct(null);
            }
            setSelectedProducts(selectedProducts.filter(p => p.id !== id));
            await productService.deleteProduct(id);
        } catch (err: any) {
            setProducts(previousProducts);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to delete product';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [productService, setProducts, products, currentProduct, setCurrentProduct, selectedProducts, setSelectedProducts]);

    const searchProducts = useCallback(async (query: string) => {
        try {
            setError(null);
            const results = await productService.searchProducts(query);
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search products';
            setError(errorMessage);
            return [];
        }
    }, [productService]);

    const exportProducts = useCallback(async (format: 'csv' | 'json') => {
        try {
            setError(null);
            const blob = await productService.exportProducts(format);
            return blob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export products';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [productService]);

    // Optimistic stock update for instant UI feedback
    const updateStock = useCallback((updates: { productId: string, quantity: number }[]) => {
        const newProducts = products.map(p => {
            const update = updates.find(u => u.productId === p.id);
            if (update && typeof p.stock === 'number') {
                return { ...p, stock: Math.max(0, p.stock - update.quantity) };
            }
            return p;
        });
        setProducts(newProducts);
    }, [products, setProducts]);

    return {
        products,
        loading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        searchProducts,
        exportProducts,
        updateStock,
        refetch: loadProducts,
        currentProduct,
        setCurrentProduct,
        selectedProducts,
        setSelectedProducts,
    };
};

export { useProducts };
export default useProducts;
