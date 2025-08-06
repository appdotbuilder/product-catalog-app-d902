import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { AuthContext } from '../App';
import type { Product, CreateProductInput, UpdateProductInput } from '../../../server/src/schema';

export function AdminDashboard() {
  const authContext = useContext(AuthContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for adding new products
  const [addFormData, setAddFormData] = useState<CreateProductInput>({
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0,
    image_filename: null,
    category: '',
    instagram_handle: null
  });

  // Form state for editing products
  const [editFormData, setEditFormData] = useState<UpdateProductInput>({
    id: 0,
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0,
    image_filename: null,
    category: '',
    instagram_handle: null
  });

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.products.getAll.query();
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newProduct = await trpc.products.add.mutate(addFormData);
      setProducts((prev: Product[]) => [...prev, newProduct]);
      
      // Reset form
      setAddFormData({
        name: '',
        description: null,
        price: 0,
        stock_quantity: 0,
        image_filename: null,
        category: '',
        instagram_handle: null
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedProduct = await trpc.products.edit.mutate(editFormData);
      setProducts((prev: Product[]) =>
        prev.map((p: Product) => p.id === updatedProduct.id ? updatedProduct : p)
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to edit product:', error);
      alert('Failed to edit product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await trpc.products.delete.mutate({ id });
      setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_filename: product.image_filename,
      category: product.category,
      instagram_handle: product.instagram_handle
    });
    setIsEditDialogOpen(true);
  };

  const handleLogout = () => {
    authContext.logout();
  };

  const handleViewStore = () => {
    authContext.navigate('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center">
        <div className="glass-panel p-8 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-2 border-t-transparent border-green-400 rounded-full animate-spin"></div>
            <span className="text-xl neon-text">Loading Dashboard...</span>
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
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 glass-panel m-4 mb-0 border-green-400/30">
        <div className="container-responsive py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-glow">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold neon-text-bright">
                  ADMIN CONTROL CENTER
                </h1>
                <p className="text-green-400/80">Product Management System</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleViewStore}
                variant="outline"
                className="glass-panel border-green-400/30 text-green-400 hover:bg-green-400/10 hover:text-green-300 hover:border-green-300 transition-all duration-300"
              >
                🏪 VIEW CATALOG
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="glass-panel border-red-400/30 text-red-400 hover:bg-red-400/10 hover:text-red-300 hover:border-red-300 transition-all duration-300"
              >
                🚪 LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8 relative z-10">
        {/* Stats and Add Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-8">
            <div className="text-center glass-panel p-6 min-w-[120px]">
              <div className="text-4xl font-bold neon-text mb-2">{products.length}</div>
              <div className="text-sm text-green-400/80 uppercase">Total Products</div>
            </div>
            <div className="text-center glass-panel p-6 min-w-[120px]">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {products.filter((p: Product) => p.stock_quantity > 0).length}
              </div>
              <div className="text-sm text-green-400/80 uppercase">In Stock</div>
            </div>
            <div className="text-center glass-panel p-6 min-w-[120px]">
              <div className="text-4xl font-bold text-red-400 mb-2">
                {products.filter((p: Product) => p.stock_quantity === 0).length}
              </div>
              <div className="text-sm text-green-400/80 uppercase">Out of Stock</div>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold px-8 py-4 text-lg neon-border animate-glow">
                ➕ ADD NEW PRODUCT
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-green-400/30 max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl neon-text">Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <Label htmlFor="add-name" className="text-green-400 font-medium">PRODUCT NAME *</Label>
                  <Input
                    id="add-name"
                    value={addFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="add-category" className="text-green-400 font-medium">CATEGORY *</Label>
                  <Input
                    id="add-category"
                    value={addFormData.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({ ...prev, category: e.target.value }))
                    }
                    required
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="add-description" className="text-green-400 font-medium">DESCRIPTION</Label>
                  <Textarea
                    id="add-description"
                    value={addFormData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-price" className="text-green-400 font-medium">PRICE *</Label>
                    <Input
                      id="add-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={addFormData.price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAddFormData((prev: CreateProductInput) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0
                        }))
                      }
                      required
                      className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="add-stock" className="text-green-400 font-medium">STOCK</Label>
                    <Input
                      id="add-stock"
                      type="number"
                      min="0"
                      value={addFormData.stock_quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAddFormData((prev: CreateProductInput) => ({
                          ...prev,
                          stock_quantity: parseInt(e.target.value) || 0
                        }))
                      }
                      className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="add-image" className="text-green-400 font-medium">IMAGE FILENAME</Label>
                  <Input
                    id="add-image"
                    value={addFormData.image_filename || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({
                        ...prev,
                        image_filename: e.target.value || null
                      }))
                    }
                    placeholder="e.g., product1.jpg"
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                  <p className="text-xs text-green-400/60 mt-1">
                    📝 Upload files to /public/uploads/ folder manually
                  </p>
                </div>

                <div>
                  <Label htmlFor="add-instagram" className="text-green-400 font-medium">INSTAGRAM HANDLE</Label>
                  <Input
                    id="add-instagram"
                    value={addFormData.instagram_handle || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateProductInput) => ({
                        ...prev,
                        instagram_handle: e.target.value || null
                      }))
                    }
                    placeholder="@username"
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 glass-panel border-red-400/30 text-red-400 hover:bg-red-400/10"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold"
                  >
                    {isSubmitting ? '⏳ ADDING...' : '✅ ADD PRODUCT'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="glass-panel max-w-md mx-auto p-12">
              <div className="text-8xl mb-6 opacity-50">📦</div>
              <p className="text-2xl text-green-300 mb-4">NO PRODUCTS CONFIGURED</p>
              <p className="text-gray-400">Initialize your catalog by adding the first product.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product: Product, index: number) => (
              <Card 
                key={product.id} 
                className="glass-panel group hover:scale-[1.02] transition-all duration-500 border-green-400/20 hover:border-green-400/40 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden rounded-t-xl">
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
                    <div className="w-full h-full flex items-center justify-center text-green-400/50 text-6xl">
                      📷
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3">
                    {product.stock_quantity > 0 ? (
                      <Badge className="bg-green-500/80 text-black backdrop-blur-sm animate-glow">AVAILABLE</Badge>
                    ) : (
                      <Badge className="bg-red-500/80 text-white backdrop-blur-sm">OUT OF STOCK</Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-lg font-bold text-green-100 line-clamp-2 flex-1 group-hover:text-green-300 transition-colors duration-300">
                      {product.name}
                    </CardTitle>
                    <Badge className="shrink-0 bg-green-400/20 text-green-300 border-green-400/30">
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
                    <span className="text-2xl font-bold neon-text">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-green-400/80">📦 {product.stock_quantity} units</span>
                  </div>

                  {product.instagram_handle && (
                    <div className="text-xs text-center text-green-400/60 bg-green-400/5 rounded-lg py-2 px-3">
                      📲 {product.instagram_handle}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => openEditDialog(product)}
                      variant="outline"
                      size="sm"
                      className="flex-1 glass-panel border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                    >
                      ✏️ EDIT
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="glass-panel border-red-400/30 text-red-400 hover:bg-red-400/10"
                        >
                          🗑️ DELETE
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-panel border-green-400/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl neon-text">Delete Product</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            Are you sure you want to delete "<span className="text-green-400">{product.name}</span>"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-panel border-gray-400/30 text-gray-300 hover:bg-gray-400/10">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold"
                          >
                            DELETE
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="text-xs text-green-400/40 pt-2 border-t border-green-400/20 flex justify-between">
                    <span>ID: {product.id}</span>
                    <span>{product.created_at.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-panel border-green-400/30 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl neon-text">Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-6">
              <div>
                <Label htmlFor="edit-name" className="text-green-400 font-medium">PRODUCT NAME</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ ...prev, name: e.target.value }))
                  }
                  className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="edit-category" className="text-green-400 font-medium">CATEGORY</Label>
                <Input
                  id="edit-category"
                  value={editFormData.category || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({ ...prev, category: e.target.value }))
                  }
                  className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-green-400 font-medium">DESCRIPTION</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      description: e.target.value || null
                    }))
                  }
                  className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-green-400 font-medium">PRICE</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: UpdateProductInput) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-stock" className="text-green-400 font-medium">STOCK</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editFormData.stock_quantity || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: UpdateProductInput) => ({
                        ...prev,
                        stock_quantity: parseInt(e.target.value) || 0
                      }))
                    }
                    className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-image" className="text-green-400 font-medium">IMAGE FILENAME</Label>
                <Input
                  id="edit-image"
                  value={editFormData.image_filename || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      image_filename: e.target.value || null
                    }))
                  }
                  className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="edit-instagram" className="text-green-400 font-medium">INSTAGRAM HANDLE</Label>
                <Input
                  id="edit-instagram"
                  value={editFormData.instagram_handle || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateProductInput) => ({
                      ...prev,
                      instagram_handle: e.target.value || null
                    }))
                  }
                  className="glass-panel bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 glass-panel border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold"
                >
                  {isSubmitting ? '⏳ UPDATING...' : '✅ UPDATE PRODUCT'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}