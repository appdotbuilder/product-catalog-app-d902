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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900">
        <div className="container-responsive py-8">
          <div className="flex items-center justify-center h-64">
            <div className="glass-panel p-8 animate-fade-in">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-2 border-t-transparent border-green-400 rounded-full animate-spin"></div>
                <span className="text-xl neon-text">Loading Catalog...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container-responsive py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-in">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <h1 className="text-5xl md:text-6xl font-bold neon-text-bright">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300">⚡</span>
                CYBER CATALOG
                <span className="inline-block transform hover:scale-110 transition-transform duration-300">⚡</span>
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                onClick={handleAdminLogin}
                className="glass-panel px-6 py-3 border-green-400/30 text-green-400 hover:bg-green-400/10 hover:text-green-300 hover:border-green-300 transition-all duration-300 neon-border focus-neon"
              >
                🔐 ADMIN ACCESS
              </Button>
            </div>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            NEXT-GEN PRODUCTS • INSTANT ORDERING • DIGITAL COMMERCE
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto"></div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 max-w-4xl mx-auto animate-fade-in">
          <div className="flex-1">
            <Input
              placeholder="🔍 SEARCH CATALOG..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="glass-panel h-14 text-lg bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
            />
          </div>
          <div className="lg:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="glass-panel h-14 bg-black/20 border-green-400/30 text-green-100 focus:border-green-400 transition-all duration-300">
                <SelectValue placeholder="CATEGORY FILTER" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-green-400/30 bg-black/90 backdrop-blur-md">
                <SelectItem value="all" className="text-green-100 hover:bg-green-400/20 focus:bg-green-400/20">ALL CATEGORIES</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category} className="text-green-100 hover:bg-green-400/20 focus:bg-green-400/20">
                    {category.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="glass-panel max-w-md mx-auto p-12">
              <div className="text-8xl mb-6 opacity-50">📦</div>
              <p className="text-2xl text-gray-300 mb-4">
                {products.length === 0 ? 'CATALOG INITIALIZING...' : 'NO MATCHES FOUND'}
              </p>
              <p className="text-gray-500">
                {products.length === 0 ? 'No products available in the system.' : 'Try adjusting your search criteria.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: Product, index: number) => (
              <Card 
                key={product.id} 
                className="glass-panel group hover:scale-[1.02] transition-all duration-500 animate-fade-in border-green-400/20 hover:border-green-400/40"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square overflow-hidden rounded-t-xl relative">
                  {product.image_filename ? (
                    <>
                      <img
                        src={`/public/uploads/${product.image_filename}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = '/api/placeholder/300/300';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-green-400/50 text-6xl">
                      📷
                    </div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
                      <span className="text-2xl font-bold text-red-400">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-lg font-bold text-green-100 line-clamp-2 flex-1 group-hover:text-green-300 transition-colors duration-300">
                      {product.name}
                    </CardTitle>
                    <Badge className="shrink-0 bg-green-400/20 text-green-300 border-green-400/30 hover:bg-green-400/30 transition-colors duration-300">
                      {product.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-gray-400 line-clamp-3 group-hover:text-gray-300 transition-colors duration-300">
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold neon-text">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-400/80">
                      📦 {product.stock_quantity} units
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOrderNow(product)}
                    disabled={product.stock_quantity === 0}
                    className={`w-full py-3 font-bold text-sm transition-all duration-300 ${
                      product.stock_quantity === 0
                        ? 'bg-red-900/50 text-red-400 border-red-400/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black hover:shadow-lg hover:shadow-green-400/25 neon-border animate-glow'
                    }`}
                  >
                    {product.stock_quantity === 0 ? (
                      '❌ UNAVAILABLE'
                    ) : product.instagram_handle ? (
                      '📱 ORDER VIA INSTAGRAM'
                    ) : (
                      '📋 COPY ORDER DATA'
                    )}
                  </Button>

                  {product.instagram_handle && (
                    <div className="text-xs text-center text-green-400/60 bg-green-400/5 rounded-lg py-2 px-3">
                      📲 {product.instagram_handle}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-24 text-center space-y-4 animate-fade-in">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
          <p className="text-green-400/80 text-lg font-medium">
            ⚡ INSTANT ORDERS • SECURE TRANSACTIONS • NEXT-GEN COMMERCE ⚡
          </p>
          <p className="text-gray-500 text-sm">
            Powered by Advanced Catalog Technology
          </p>
        </div>
      </div>
    </div>
  );
}