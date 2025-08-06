
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import { AuthContext } from '../App';
import type { Product } from '../../../server/src/schema';

export function HomePage() {
  const authContext = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.products.getAll.query();
      setProducts(result);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(result.map((p: Product) => p.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product: Product) => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleOrderNow = (product: Product) => {
    const message = `I want to order ${product.name}`;
    if (product.instagram_handle) {
      // Open Instagram DM with pre-filled message
      const instagramUrl = `https://instagram.com/${product.instagram_handle.replace('@', '')}`;
      window.open(instagramUrl, '_blank');
    } else {
      // Fallback: copy message to clipboard
      navigator.clipboard.writeText(message);
      alert('Instagram handle not available. Message copied to clipboard!');
    }
  };

  const handleAdminLogin = () => {
    authContext.navigate('admin-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading products... ✨</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-800">
              🛍️ Product Catalog
            </h1>
            <Button
              variant="outline"
              onClick={handleAdminLogin}
              className="text-gray-600 hover:text-gray-800"
            >
              🔐 Admin
            </Button>
          </div>
          <p className="text-gray-600 text-lg">
            Discover amazing products and order through Instagram DM
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <Input
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-600">
              {products.length === 0 ? 'No products available yet.' : 'No products match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.image_filename ? (
                    <img
                      src={`/public/uploads/${product.image_filename}`}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/api/placeholder/300/300';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                      📷
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-2 flex-1">
                      {product.name}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {product.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      📦 Stock: {product.stock_quantity}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOrderNow(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                  >
                    {product.stock_quantity === 0 ? (
                      '❌ Out of Stock'
                    ) : product.instagram_handle ? (
                      '📱 Order Now via Instagram'
                    ) : (
                      '📋 Copy Order Message'
                    )}
                  </Button>

                  {product.instagram_handle && (
                    <div className="text-xs text-center text-gray-500">
                      📲 {product.instagram_handle}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>💝 Order through Instagram DM for personalized service</p>
        </div>
      </div>
    </div>
  );
}
